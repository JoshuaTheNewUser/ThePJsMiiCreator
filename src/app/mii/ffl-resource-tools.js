/* Browser-side FFL resource archive inspector/extractor.
 * Independent JavaScript implementation of the documented FFRA/FFL resource layout.
 * Exports extracted shape meshes as GLB and textures as PNG; no upstream Python is required.
 */
(function(global){
  "use strict";
  const MAGIC=0x46465241, HEADER_SIZE=0x14, TEXTURE_HEADER_SIZE=0x2c, SHAPE_HEADER_SIZE=0x30;
  const utf8=new TextEncoder();
  function assert(ok,message){if(!ok)throw new Error(message);}
  function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c&1)?(c>>>1)^0xedb88320:c>>>1;}return(c^0xffffffff)>>>0;}
  function readTable(view,offset,count){const rows=[];for(let i=0;i<count;i++){const p=offset+i*16;rows.push({offset:view.getUint32(p,false),uncompressedSize:view.getUint32(p+4,false),compressedSize:view.getUint32(p+8,false),flags:view.getUint8(p+13),compression:view.getUint8(p+15)});}return rows;}
  async function inflateZlib(bytes){
    if(typeof DecompressionStream==="undefined")throw new Error("This browser does not support the built-in DEFLATE decoder needed for compressed FFL entries.");
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function entryBytes(archive,entry){
    if(!entry.offset)return null;
    const size=(entry.compression===5||entry.compression>100)?entry.uncompressedSize:(entry.compressedSize||entry.uncompressedSize);
    assert(size>0&&entry.offset+size<=archive.length,"FFL resource entry points outside the archive.");
    const raw=archive.subarray(entry.offset,entry.offset+size);
    const result=(entry.compression===5||entry.compression>100)?raw.slice():await inflateZlib(raw);
    assert(result.length===entry.uncompressedSize,"FFL resource decompressed size does not match its table entry.");
    return result;
  }
  function parseArchive(input,textureCount=317,shapeCount=857){
    const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
    assert(bytes.length>=HEADER_SIZE+TEXTURE_HEADER_SIZE+SHAPE_HEADER_SIZE,"FFL archive is too small.");
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    assert(view.getUint32(0,false)===MAGIC,"Invalid FFL resource magic. Expected FFRA.");
    const version=view.getUint32(4,false);
    const textureTableOffset=HEADER_SIZE+TEXTURE_HEADER_SIZE;
    const shapeTableOffset=textureTableOffset+textureCount*16+SHAPE_HEADER_SIZE;
    assert(shapeTableOffset+shapeCount*16<=bytes.length,"The supplied texture/shape counts exceed this archive's table size.");
    return {bytes,version,textureCount,shapeCount,textures:readTable(view,textureTableOffset,textureCount),shapes:readTable(view,shapeTableOffset,shapeCount)};
  }
  async function getShape(archive,index){
    const entry=archive.shapes[index];assert(entry,"Shape index is outside the table.");
    const data=await entryBytes(archive.bytes,entry);if(!data)return null;
    assert(data.length>=0x48,"Shape resource header is truncated.");
    const view=new DataView(data.buffer,data.byteOffset,data.byteLength),offsets=[],lengths=[];
    for(let i=0;i<6;i++)offsets.push(view.getUint32(i*4,false));
    for(let i=0;i<6;i++)lengths.push(view.getUint32(24+i*4,false));
    function section(n){
      let off=offsets[n],len=lengths[n]*(n===5?2:1);
      if(n===6){off=0x48;len=0x24;}else if(n===7){off=0x48;len=0x48;}else if(n===8){off=0x30;len=0x18;}
      assert(off+len<=data.length,"Shape section "+n+" is outside its resource.");
      return data.subarray(off,off+len);
    }
    const vertexBytes=section(0),uvBytes=section(2),colorBytes=section(4),faceBytes=section(5);
    assert(vertexBytes.length%16===0&&faceBytes.length%6===0,"Shape has invalid vertex or triangle data.");
    const count=vertexBytes.length/16,positions=new Float32Array(count*3);
    const vv=new DataView(vertexBytes.buffer,vertexBytes.byteOffset,vertexBytes.byteLength);
    for(let i=0;i<count;i++){positions[i*3]=vv.getFloat32(i*16,false);positions[i*3+1]=vv.getFloat32(i*16+4,false);positions[i*3+2]=vv.getFloat32(i*16+8,false);}
    let uvs=null;
    if(uvBytes.length){assert(uvBytes.length%8===0,"Invalid texture coordinate section.");uvs=new Float32Array(uvBytes.length/4);const uv=new DataView(uvBytes.buffer,uvBytes.byteOffset,uvBytes.byteLength);for(let i=0;i<uvBytes.length/8;i++){uvs[i*2]=uv.getFloat32(i*8,false);uvs[i*2+1]=uv.getFloat32(i*8+4,false)-1;}}
    let colors=null;
    if(colorBytes.length){assert(colorBytes.length%4===0,"Invalid vertex color section.");colors=new Uint8Array(colorBytes.length);const cv=new DataView(colorBytes.buffer,colorBytes.byteOffset,colorBytes.byteLength);for(let i=0;i<colorBytes.length/4;i++){const v=cv.getUint32(i*4,false);colors.set([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255],i*4);}}
    const indices=new Uint16Array(faceBytes.length/2),fv=new DataView(faceBytes.buffer,faceBytes.byteOffset,faceBytes.byteLength);for(let i=0;i<indices.length;i++)indices[i]=fv.getUint16(i*2,false);
    return {positions,uvs,colors,indices};
  }
  async function getTexture(archive,index){
    const entry=archive.textures[index];assert(entry,"Texture index is outside the table.");
    const data=await entryBytes(archive.bytes,entry);if(!data)return null;
    assert(data.length>=12,"Texture resource is truncated.");
    const v=new DataView(data.buffer,data.byteOffset,data.byteLength),width=v.getUint16(data.length-8,false),height=v.getUint16(data.length-6,false),format=v.getUint8(data.length-3);
    assert(width>0&&height>0&&width*height<=16777216,"Texture dimensions are invalid or too large.");
    const pixelBytes=data.subarray(0,data.length-12),count=width*height,rgba=new Uint8ClampedArray(count*4);
    if(format===0){assert(pixelBytes.length>=count,"Grayscale texture data is truncated.");for(let i=0;i<count;i++){const p=pixelBytes[i];rgba.set([p,p,p,255],i*4);}}
    else if(format===1){assert(pixelBytes.length>=count*2,"Luma/alpha texture data is truncated.");const p=new DataView(pixelBytes.buffer,pixelBytes.byteOffset,pixelBytes.byteLength);for(let i=0;i<count;i++){const n=p.getUint16(i*2,false),l=n>>>8,a=n&255;rgba.set([l,l,l,a],i*4);}}
    else if(format===2){assert(pixelBytes.length>=count*4,"RGBA texture data is truncated.");rgba.set(pixelBytes.subarray(0,count*4));}
    else throw new Error("Unsupported FFL texture format "+format+".");
    return {width,height,rgba,format};
  }
  function align4(n){return(n+3)&~3;}
  function makeGlb(shape,name){
    const chunks=[],views=[],accessors=[],attributes={};let offset=0;
    function append(bytes,target,componentType,count,type,min,max,normalized){
      const padded=new Uint8Array(align4(bytes.length));padded.set(bytes);
      views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})});
      accessors.push({bufferView:views.length-1,byteOffset:0,componentType,count,type,...(min?{min}:{}),...(max?{max}:{}),...(normalized?{normalized:true}:{})});
      chunks.push(padded);offset+=padded.length;return accessors.length-1;
    }
    const pos=shape.positions,bytes=new Uint8Array(pos.length*4),pv=new DataView(bytes.buffer);
    for(let i=0;i<pos.length;i++)pv.setFloat32(i*4,pos[i],true);
    const vertexCount=pos.length/3,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(let i=0;i<vertexCount;i++)for(let a=0;a<3;a++){const v=pos[i*3+a];min[a]=Math.min(min[a],v);max[a]=Math.max(max[a],v);}
    attributes.POSITION=append(bytes,34962,5126,vertexCount,"VEC3",min,max);
    if(shape.uvs&&shape.uvs.length/2===vertexCount){const b=new Uint8Array(shape.uvs.length*4),v=new DataView(b.buffer);for(let i=0;i<shape.uvs.length;i++)v.setFloat32(i*4,shape.uvs[i],true);attributes.TEXCOORD_0=append(b,34962,5126,vertexCount,"VEC2");}
    if(shape.colors&&shape.colors.length/4===vertexCount)attributes.COLOR_0=append(shape.colors,34962,5121,vertexCount,"VEC4",null,null,true);
    const idx=shape.indices,ib=new Uint8Array(idx.length*2),iv=new DataView(ib.buffer);for(let i=0;i<idx.length;i++)iv.setUint16(i*2,idx[i],true);
    let minIndex=65535,maxIndex=0;for(let i=0;i<idx.length;i++){minIndex=Math.min(minIndex,idx[i]);maxIndex=Math.max(maxIndex,idx[i]);}const indices=append(ib,34963,5123,idx.length,"SCALAR",[minIndex],[maxIndex]);
    const json={asset:{version:"2.0",generator:"The PJs Mii Creator · FFL Resource Tools"},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0}],meshes:[{primitives:[{attributes,indices,mode:4}]}],buffers:[{byteLength:offset}],bufferViews:views,accessors};
    const jsonBytes=utf8.encode(JSON.stringify(json)),jsonPadded=new Uint8Array(align4(jsonBytes.length));jsonPadded.fill(32);jsonPadded.set(jsonBytes);
    const bin=new Uint8Array(offset);let at=0;for(const c of chunks){bin.set(c,at);at+=c.length;}
    const total=12+8+jsonPadded.length+8+bin.length,out=new Uint8Array(total),dv=new DataView(out.buffer);
    dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);
    dv.setUint32(12,jsonPadded.length,true);dv.setUint32(16,0x4e4f534a,true);out.set(jsonPadded,20);
    const binHead=20+jsonPadded.length;dv.setUint32(binHead,bin.length,true);dv.setUint32(binHead+4,0x004e4942,true);out.set(bin,binHead+8);
    return out;
  }
  async function texturePng(texture){
    const canvas=document.createElement("canvas");canvas.width=texture.width;canvas.height=texture.height;
    const ctx=canvas.getContext("2d");ctx.putImageData(new ImageData(texture.rgba,texture.width,texture.height),0,0);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not encode PNG texture.")),"image/png"));
    return new Uint8Array(await blob.arrayBuffer());
  }
  function zipStore(files){
    const locals=[],centrals=[];let offset=0;
    for(const file of files){
      const name=utf8.encode(file.name),data=file.data,crc=crc32(data),local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);
      lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,0,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);
      locals.push(local,data);const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
      cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);centrals.push(central);offset+=local.length+data.length;
    }
    const centralSize=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
    const out=new Uint8Array(offset+centralSize+22);let p=0;for(const x of locals){out.set(x,p);p+=x.length;}for(const x of centrals){out.set(x,p);p+=x.length;}out.set(end,p);return out;
  }
  async function extract(input,options={}){
    const archive=parseArchive(input,options.textureCount??317,options.shapeCount??857),files=[],progress=options.onProgress||(()=>{});
    for(let i=0;i<archive.shapes.length;i++){if(!archive.shapes[i].offset)continue;const shape=await getShape(archive,i);if(shape){files.push({name:"meshes/shape_"+i+".glb",data:makeGlb(shape,"FFL Shape "+i)});progress("mesh",i+1,archive.shapeCount);}}
    for(let i=0;i<archive.textures.length;i++){if(!archive.textures[i].offset)continue;const texture=await getTexture(archive,i);if(texture){files.push({name:"textures/tex_"+i+".png",data:await texturePng(texture)});progress("texture",i+1,archive.textureCount);}}
    return {archive,files,zip:zipStore(files)};
  }
  global.PJFFLResourceTools={parseArchive,getShape,getTexture,makeGlb,extract,crc32};
})(window);
