/* Independent browser-side reader for the documented MIAN v2 .miianim container.
 * This is a clean-room format implementation; no MiiAnimator source files are copied.
 * Supports header, events and main-actor bone tracks. Unknown chunks are skipped safely.
 */
(function (global) {
  "use strict";
  const CHANNELS = ["PosX","PosY","PosZ","RotX","RotY","RotZ","ScaleX","ScaleY","ScaleZ","Stretch"];
  const BONE_NAMES = ["skl_root","hip","chest","head","arm_l1","arm_l2","wrist_l","arm_r1","arm_r2","wrist_r","foot_l1","foot_l2","ankle_l","foot_r1","foot_r2","ankle_r"];
  const INTERPOLATION = ["Smooth","Linear","Hold","EaseIn","EaseOut","EaseInOut","Snappy","Overshoot","Bouncy"];
  const textDecoder = new TextDecoder();
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i=0;i<8;i++) crc = (crc & 1) ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  class Reader {
    constructor(bytes) { this.bytes=bytes; this.view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength); this.pos=0; }
    need(n) { if (!Number.isSafeInteger(n)||n<0||this.pos+n>this.bytes.length) throw new Error("Unexpected end of .miianim data."); }
    u8(){this.need(1);return this.view.getUint8(this.pos++);}
    u16(){this.need(2);const v=this.view.getUint16(this.pos,true);this.pos+=2;return v;}
    i16(){this.need(2);const v=this.view.getInt16(this.pos,true);this.pos+=2;return v;}
    u32(){this.need(4);const v=this.view.getUint32(this.pos,true);this.pos+=4;return v;}
    f32(){this.need(4);const v=this.view.getFloat32(this.pos,true);this.pos+=4;if(!Number.isFinite(v))throw new Error("Non-finite animation value.");return v;}
    f16(){const h=this.u16(), sign=(h&0x8000)?-1:1, exp=(h>>10)&31, frac=h&1023; if(exp===0)return sign*Math.pow(2,-14)*(frac/1024);if(exp===31)return frac?NaN:sign*Infinity;return sign*Math.pow(2,exp-15)*(1+frac/1024);}
    varuint(){let out=0,shift=0;for(let i=0;i<5;i++){const b=this.u8();out+=(b&127)*Math.pow(2,shift);if(!(b&128))return out;shift+=7;}throw new Error("Invalid variable-length integer.");}
    string(){const n=this.varuint();this.need(n);const value=textDecoder.decode(this.bytes.subarray(this.pos,this.pos+n));this.pos+=n;return value;}
    take(n){this.need(n);const out=this.bytes.subarray(this.pos,this.pos+n);this.pos+=n;return out;}
  }
  function readValue(r,encoding){let v;switch(encoding){case 0:v=r.f32();break;case 1:v=r.f16();break;case 2:v=r.i16()/100;break;case 3:v=r.u8();break;default:throw new Error("Unsupported .miianim value encoding: "+encoding);}if(!Number.isFinite(v))throw new Error("Invalid numeric value in animation.");return v;}
  function parseMiianim(input) {
    const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
    if(bytes.length<9||String.fromCharCode(...bytes.subarray(0,4))!=="MIAN")throw new Error("This is not a .miianim file.");
    const tail=new DataView(bytes.buffer,bytes.byteOffset+bytes.length-4,4).getUint32(0,true);
    if(crc32(bytes.subarray(0,bytes.length-4))!==tail)throw new Error("Animation checksum failed; the file may be damaged.");
    const r=new Reader(bytes.subarray(0,bytes.length-4));r.pos=4;
    const version=r.u8();if(version!==2)throw new Error("Unsupported .miianim version "+version+" (this reader supports v2).");
    const animation={name:"Untitled",fps:60,length:120,events:[],tracks:[],actors:0,particles:0,authorMii:null,version};
    let hasHeader=false;
    while(r.pos<r.bytes.length){
      const tag=textDecoder.decode(r.take(4)), chunk=new Reader(r.take(r.varuint()));
      if(tag==="HEAD"){hasHeader=true;animation.fps=chunk.u8();animation.length=chunk.varuint();animation.name=chunk.string();}
      else if(tag==="AMII"){animation.authorMii=chunk.take(Math.min(74,chunk.bytes.length));}
      else if(tag==="TRKS"){readTracks(chunk,animation.tracks);}
      else if(tag==="EVNT"){const count=chunk.varuint();let frame=0;for(let i=0;i<count;i++){frame+=chunk.varuint();animation.events.push({frame,name:chunk.string()});}}
      else if(tag==="ACTR"){animation.actors=chunk.varuint();}
      else if(tag==="PART"){animation.particles=chunk.varuint();}
      // Unknown and currently unsupported chunks are deliberately skipped by their declared length.
    }
    if(!hasHeader)throw new Error("The animation has no HEAD chunk.");
    return animation;
  }
  function readTracks(r,out){
    const count=r.varuint();if(count>4096)throw new Error("Unreasonable track count.");
    for(let t=0;t<count;t++){
      const packedTarget=r.u8(),channel=r.u8(),encByte=r.u8(),encoding=encByte&127,shared=(encByte&128)!==0;
      const sharedInterpolation=shared?r.u8():null,keyCount=r.varuint();if(keyCount>100000)throw new Error("Unreasonable key count.");
      let frame=0;const keys=[];
      for(let k=0;k<keyCount;k++){
        const packed=r.varuint();frame+=shared?packed:(packed>>>4);
        const interpolation=shared?sharedInterpolation:(packed&15);
        const value=readValue(r,encoding),key={frame,value,interpolation};
        if(interpolation===15){key.handleOut={x:readValue(r,encoding),y:readValue(r,encoding)};key.handleIn={x:readValue(r,encoding),y:readValue(r,encoding)};}
        keys.push(key);
      }
      out.push({target:packedTarget>=128?"global":packedTarget>=64?"limb":"bone",index:packedTarget>=128?0:packedTarget>=64?packedTarget&63:packedTarget,channel,channelName:CHANNELS[channel]||"Channel"+channel,keys});
    }
  }
  function ease(type,u){
    u=Math.max(0,Math.min(1,u));
    if(type===1)return u;if(type===2)return 0;if(type===3)return u*u*u;
    if(type===4)return 1-Math.pow(1-u,3);
    if(type===5)return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
    if(type===6)return u>=1?1:(1-Math.pow(2,-10*u))/(1-Math.pow(2,-10));
    if(type===7){const c1=1.70158,c3=c1+1,x=u-1;return 1+c3*x*x*x+c1*x*x;}
    if(type===8){const n=7.5625,d=2.75;if(u<1/d)return n*u*u;if(u<2/d){u-=1.5/d;return n*u*u+.75;}if(u<2.5/d){u-=2.25/d;return n*u*u+.9375;}u-=2.625/d;return n*u*u+.984375;}
    return u;
  }
  function evaluateCurve(keys,frame){
    if(!keys.length)return 0;if(keys.length===1||frame<=keys[0].frame)return keys[0].value;
    const last=keys[keys.length-1];if(frame>=last.frame)return last.value;
    let i=0;while(i<keys.length-1&&keys[i+1].frame<frame)i++;
    const a=keys[i],b=keys[i+1],span=b.frame-a.frame;if(span<=0)return b.value;
    const u=(frame-a.frame)/span;
    if(a.interpolation===2)return a.value;
    if(a.interpolation===15){
      // Solve cubic Bezier x(t)=u by bounded bisection, then evaluate y(t).
      const p1x=Math.max(0,Math.min(1,a.handleOut?.x??1/3)),p2x=1-Math.max(0,Math.min(1,a.handleIn?.x??1/3));
      const p1y=a.value+(a.handleOut?.y??0),p2y=b.value+(a.handleIn?.y??0);
      const bez=(p0,p1,p2,p3,t)=>Math.pow(1-t,3)*p0+3*Math.pow(1-t,2)*t*p1+3*(1-t)*t*t*p2+t*t*t*p3;
      let lo=0,hi=1,t=u;for(let n=0;n<18;n++){t=(lo+hi)/2;if(bez(0,p1x,p2x,1,t)<u)lo=t;else hi=t;}
      return bez(a.value,p1y,p2y,b.value,t);
    }
    if(a.interpolation===0){
      // Smooth Hermite with finite-difference slopes, matching the format's auto-tangent intent.
      const prev=keys[Math.max(0,i-1)],next=keys[Math.min(keys.length-1,i+2)];
      const m0=(b.value-prev.value)/Math.max(1,b.frame-prev.frame)*span;
      const m1=(next.value-a.value)/Math.max(1,next.frame-a.frame)*span;
      const u2=u*u,u3=u2*u;
      return (2*u3-3*u2+1)*a.value+(u3-2*u2+u)*m0+(-2*u3+3*u2)*b.value+(u3-u2)*m1;
    }
    const t=ease(a.interpolation,u);return a.value+(b.value-a.value)*t;
  }
  global.PJMiiAnimationFormat={parse:parseMiianim,evaluateCurve,boneNames:BONE_NAMES,channelNames:CHANNELS,interpolationNames:INTERPOLATION};
})(window);
