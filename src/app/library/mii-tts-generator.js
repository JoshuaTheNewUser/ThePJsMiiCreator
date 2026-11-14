// src/app/library/mii-tts-generator.js
// Mii TTS Generator: Talkmodachi-compatible speech request UI.
// Uses the Talkmodachi /tts query contract; no game ROM or voice-model files are bundled.

function openMiiTTSGenerator(mii, libraryEntry = {}) {
  const endpointKey = "thepjsmiicreator-talkmodachi-endpoint";
  const voiceKey = "thepjsmiicreator-talkmodachi-voice-" + String(libraryEntry.id || mii.nickname || "default").replace(/[^a-z0-9_-]/gi, "_");
  const defaults = { pitch: 50, speed: 50, quality: 50, tone: 50, accent: 50, intonation: "1", lang: "es", eng: "tl" };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(voiceKey) || "{}"); } catch {}
  const params = { ...defaults, ...saved };
  let audioUrl = null, busy = false;
  const overlay = document.createElement("div");
  Object.assign(overlay.style, { position:"fixed", inset:"0", zIndex:"10020", background:"#0009", display:"grid", placeItems:"center", padding:"12px", boxSizing:"border-box" });
  const panel = document.createElement("section");
  Object.assign(panel.style, { width:"min(620px,100%)", maxHeight:"90vh", overflow:"auto", padding:"18px", borderRadius:"16px", background:"var(--background,#202820)", color:"var(--text,#fff)", border:"1px solid var(--stroke,#777)", boxShadow:"0 18px 60px #0008", boxSizing:"border-box", display:"flex", flexDirection:"column", gap:"11px" });
  const title = document.createElement("h2"); title.textContent = "🔊 Mii TTS Generator"; title.style.margin = "0";
  const subtitle = document.createElement("p"); subtitle.textContent = "Generate Tomodachi Life-style speech for " + (mii.nickname || "this Mii") + ". Voice settings are saved locally for this Mii."; subtitle.style.cssText = "margin:0;opacity:.8;font-size:.9rem";
  const field = (label, node) => { const wrap=document.createElement("label");wrap.style.cssText="display:flex;flex-direction:column;gap:5px;font-size:.88rem";const text=document.createElement("span");text.textContent=label;wrap.append(text,node);return wrap; };
  const textInput=document.createElement("textarea");textInput.maxLength=2000;textInput.rows=4;textInput.placeholder="Write something for your Mii to say…";textInput.style.cssText="width:100%;box-sizing:border-box;padding:10px;border-radius:8px;background:var(--container,#333);color:var(--text,white);border:1px solid var(--stroke,#777);font:inherit";
  const endpoint=document.createElement("input");endpoint.type="url";endpoint.value=localStorage.getItem(endpointKey)||"https://talkmodachi.dylanpdx.io/tts";endpoint.style.cssText="width:100%;box-sizing:border-box;padding:8px;border-radius:8px;background:var(--container,#333);color:var(--text,white);border:1px solid var(--stroke,#777)";
  const controls=document.createElement("div");controls.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px";
  const sliders={};
  for(const key of ["pitch","speed","quality","tone","accent"]){
    const input=document.createElement("input");input.type="range";input.min="0";input.max="100";input.step="1";input.value=String(params[key]);input.style.width="100%";
    const value=document.createElement("span");value.textContent=key[0].toUpperCase()+key.slice(1)+": "+input.value;
    input.addEventListener("input",()=>{value.textContent=key[0].toUpperCase()+key.slice(1)+": "+input.value;params[key]=Number(input.value);});
    const wrap=field(key[0].toUpperCase()+key.slice(1),input);wrap.append(value);controls.append(wrap);sliders[key]=input;
  }
  const language=document.createElement("select");
  for(const [value,label] of [["useng","US English"],["eueng","European English"],["es","Spanish"],["de","German"],["fr","French"],["it","Italian"],["kr","Korean"],["jp","Japanese"],["cafr","Canadian French"],["mxes","Mexican Spanish"],["nl","Dutch"],["ru","Russian"],["pt","Portuguese"],["ptbr","Brazilian Portuguese"]]){const o=document.createElement("option");o.value=value;o.textContent=label;language.append(o);}
  language.value=params.lang;
  const engine=document.createElement("select");
  for(const [value,label] of [["tl","Tomodachi Life"],["tc","Tomodachi Collection"],["mt","Miitomo"]]){const o=document.createElement("option");o.value=value;o.textContent=label;engine.append(o);}
  engine.value=params.eng;
  const intonation=document.createElement("select");
  for(let i=1;i<=4;i++){const o=document.createElement("option");o.value=String(i);o.textContent="Intonation "+i;intonation.append(o);}
  intonation.value=String(params.intonation);
  for(const node of [language,engine,intonation])node.style.cssText="width:100%;padding:8px;border-radius:8px;background:var(--container,#333);color:var(--text,white);border:1px solid var(--stroke,#777)";
  const voiceRow=document.createElement("div");voiceRow.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px";
  voiceRow.append(field("Language",language),field("Voice engine",engine),field("Intonation",intonation));
  const status=document.createElement("div");status.textContent="Ready. Connect to a Talkmodachi-compatible /tts endpoint to generate audio.";status.style.cssText="font-size:.85rem;white-space:pre-wrap;opacity:.85";
  const audio=document.createElement("audio");audio.controls=true;audio.style.width="100%";audio.hidden=true;
  const actions=document.createElement("div");actions.style.cssText="display:flex;flex-wrap:wrap;gap:8px";
  const button=(label,fn)=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.style.cssText="padding:9px 12px;border:1px solid var(--stroke,#888);border-radius:8px;background:var(--container,#333);color:var(--text,white);cursor:pointer";b.addEventListener("click",fn);actions.append(b);return b;};
  const generate=button("▶ Generate speech",async()=>{
    if(busy)return;
    const text=textInput.value.trim();if(!text){status.textContent="Enter some text first.";return;}
    let url;try{url=new URL(endpoint.value.trim());if(!["http:","https:"].includes(url.protocol))throw Error("Use an HTTP(S) endpoint.");}catch(e){status.textContent="Invalid endpoint: "+e.message;return;}
    params.lang=language.value;params.eng=engine.value;params.intonation=intonation.value;
    const query=new URLSearchParams({text,...Object.fromEntries(Object.entries(params).map(([k,v])=>[k,String(v)]))});
    busy=true;generate.disabled=true;status.textContent="Generating speech…";
    try{
      localStorage.setItem(endpointKey,url.toString().replace(/\/$/,""));
      localStorage.setItem(voiceKey,JSON.stringify(params));
      url.search=url.search?url.search+"&"+query.toString():query.toString();
      const response=await fetch(url.toString(),{method:"GET"});
      if(!response.ok)throw Error("Renderer returned HTTP "+response.status+".");
      const blob=await response.blob();if(!blob.type.startsWith("audio/")&&blob.size<64)throw Error("The renderer did not return an audio file.");
      if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);audio.src=audioUrl;audio.hidden=false;
      status.textContent="Speech generated. Use the audio player or download the WAV/audio output.";
      const download=actions.querySelector("[data-download]");if(download)download.remove();
      const a=document.createElement("a");a.dataset.download="1";a.href=audioUrl;a.download=(mii.nickname||"mii")+"-speech.wav";a.textContent="⬇ Download audio";a.style.cssText="padding:9px 12px;border:1px solid var(--stroke,#888);border-radius:8px;color:var(--text,white)";actions.insertBefore(a,closeButton);
      audio.play().catch(()=>{});
    }catch(error){status.textContent="Could not generate speech: "+String(error?.message||error)+". If this is a browser CORS error, use a Talkmodachi-compatible endpoint that permits requests from this site or configure a same-origin proxy.";}
    finally{busy=false;generate.disabled=false;}
  });
  button("💾 Save Mii voice settings",()=>{params.lang=language.value;params.eng=engine.value;params.intonation=intonation.value;try{localStorage.setItem(voiceKey,JSON.stringify(params));status.textContent="Voice settings saved locally for "+(mii.nickname||"this Mii")+".";
  }catch(e){status.textContent="Could not save settings: "+String(e);}});
  const closeButton=button("Close",()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);overlay.remove();});
  panel.append(title,subtitle,field("Text",textInput),field("Talkmodachi /tts endpoint",endpoint),controls,voiceRow,status,audio,actions);
  overlay.append(panel);overlay.addEventListener("click",e=>{if(e.target===overlay)closeButton.click();});
  document.body.append(overlay);
}
