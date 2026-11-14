// src/app/main.js
// Entry point: main() starts the app.
//
// Defines: isSafariBrowser, isSafari, main
// Uses from other files:
//   app/ui/modal.js: defaultModalButtons, closeModal, Modal
//   app/renderer/ffl-resources.js: loadFFLResources, getFFLResourcesPromise, waitForFFLResources
//   app/setup/first-run.js: skipFirstRunSetup, runFirstRunSetup, finishFirstRunSetup
//   app/settings/settings-dialog.js: applySettings, openSettingsDialog
//   app/library/library.js: getRefreshLibrary, openLibrary
//   app/ui/html.js: Html
//   app/audio/music.js: getMusicPlayer
//   app/audio/sound-effects.js: getSoundEffects
//   app/util/colors-and-bytes.js: decodeHexOrBase64
//   app/mii/mii.js: Mii
//   app/util/platform.js: MB
//   app/settings/settings.js: getSetting
//   … and 3 more files

var isSafariBrowser = !1,
  isSafari = () => isSafariBrowser;

function installCreatorHub() {
  if (document.getElementById("pj-creator-hub-launcher")) return;
  let launcher = document.createElement("button");
  launcher.id = "pj-creator-hub-launcher";
  launcher.type = "button";
  launcher.textContent = "🎮 PJ Arcade";
  Object.assign(launcher.style, {
    position: "fixed", right: "18px", bottom: "18px", zIndex: "9998",
    padding: "12px 18px", borderRadius: "999px", border: "1px solid #8ccf9b",
    background: "linear-gradient(135deg,#14532d,#16a34a)", color: "white",
    fontWeight: "800", fontSize: "14px", cursor: "pointer",
    boxShadow: "0 5px 22px #0005",
  });
  document.body.appendChild(launcher);
  // Windows 7 Aero: local MP3 drop-in player. No file is uploaded to the server.
  let aeroDock = document.createElement("div"), aeroPanel = document.createElement("section"),
    aeroAudio = document.createElement("audio"), aeroObjectUrl = null;
  Object.assign(aeroDock.style,{position:"fixed",left:"16px",bottom:"16px",zIndex:"9997",display:"none",fontFamily:"Segoe UI,Arial,sans-serif"});
  Object.assign(aeroPanel.style,{display:"none",width:"min(310px,calc(100vw - 32px))",padding:"12px",marginBottom:"8px",border:"1px solid #a9c8df",borderRadius:"10px",background:"linear-gradient(145deg,#f4fbffed,#c9e4f5ed)",color:"#18344a",boxShadow:"0 8px 28px #0005",backdropFilter:"blur(14px)"});
  let aeroTitle=document.createElement("strong");aeroTitle.textContent="🎵 Windows 7 · MP3 Player";
  let aeroHint=document.createElement("div");aeroHint.textContent="Your music goes here — choose an MP3 file.";Object.assign(aeroHint.style,{fontSize:"12px",margin:"8px 0",opacity:".8"});
  let aeroInput=document.createElement("input");aeroInput.type="file";aeroInput.accept=".mp3,audio/mpeg";aeroInput.setAttribute("aria-label","Choose an MP3 file");aeroInput.style.width="100%";
  let aeroName=document.createElement("div");aeroName.textContent="No MP3 selected";aeroName.style.cssText="font-size:12px;margin:8px 0;overflow-wrap:anywhere";
  let aeroControls=document.createElement("div");Object.assign(aeroControls.style,{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"8px"});
  const aeroButton=(label,fn)=>{let b=document.createElement("button");b.type="button";b.textContent=label;Object.assign(b.style,{border:"1px solid #8baec8",borderRadius:"6px",padding:"6px 10px",background:"linear-gradient(#fff,#dcecf7)",color:"#18344a",cursor:"pointer"});b.addEventListener("click",fn);aeroControls.appendChild(b);return b;};
  let aeroPlay=aeroButton("▶ Play",()=>{if(aeroAudio.src)aeroAudio.play().catch(()=>{aeroName.textContent="Press Play again after selecting a valid audio file.";});});
  aeroButton("Ⅱ Pause",()=>aeroAudio.pause());
  aeroButton("✕ Remove",()=>{aeroAudio.pause();aeroAudio.removeAttribute("src");aeroAudio.load();if(aeroObjectUrl)URL.revokeObjectURL(aeroObjectUrl);aeroObjectUrl=null;aeroName.textContent="No MP3 selected";aeroInput.value="";});
  let aeroVolume=document.createElement("input");aeroVolume.type="range";aeroVolume.min="0";aeroVolume.max="1";aeroVolume.step="0.01";aeroVolume.value="0.7";aeroVolume.style.width="100%";aeroVolume.setAttribute("aria-label","MP3 volume");aeroAudio.volume=.7;aeroVolume.addEventListener("input",()=>aeroAudio.volume=Number(aeroVolume.value));
  aeroInput.addEventListener("change",()=>{let file=aeroInput.files?.[0];if(!file)return;if(!file.type.startsWith("audio/")&&!/\.mp3$/i.test(file.name)){aeroName.textContent="Please choose an MP3 audio file.";return;}if(aeroObjectUrl)URL.revokeObjectURL(aeroObjectUrl);aeroObjectUrl=URL.createObjectURL(file);aeroAudio.src=aeroObjectUrl;aeroName.textContent="Loaded: "+file.name;aeroAudio.load();});
  aeroPanel.append(aeroTitle,aeroHint,aeroInput,aeroName,aeroControls,aeroVolume,aeroAudio);aeroDock.appendChild(aeroPanel);
  let aeroToggle=document.createElement("button");aeroToggle.type="button";aeroToggle.textContent="🎵 Aero MP3";Object.assign(aeroToggle.style,{padding:"10px 14px",border:"1px solid #9fc4df",borderRadius:"9px",background:"linear-gradient(145deg,#f5fcffdd,#b6d8efee)",color:"#17344b",fontWeight:"700",cursor:"pointer",boxShadow:"0 4px 16px #0004"});aeroToggle.addEventListener("click",()=>aeroPanel.style.display=aeroPanel.style.display==="none"?"block":"none");aeroDock.appendChild(aeroToggle);document.body.appendChild(aeroDock);
  const syncAeroTheme=()=>{aeroDock.style.display=document.documentElement.dataset.theme==="windows7"?"block":"none";};
  const aeroThemeObserver=new MutationObserver(syncAeroTheme);aeroThemeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});syncAeroTheme();
  let overlay = null, gameTimer = null, scores = { memory: 0, trivia: 0, reaction: 0, rps: 0 };
  const clearTimer = () => { if (gameTimer !== null) clearTimeout(gameTimer); gameTimer = null; };
  const button = (label, callback, parent) => {
    let b = document.createElement("button");
    b.type = "button"; b.textContent = label;
    Object.assign(b.style, { padding: "9px 11px", borderRadius: "9px", border: "1px solid var(--stroke, #8886)", background: "var(--container, #333)", color: "var(--text, inherit)", cursor: "pointer", fontWeight: "600" });
    b.addEventListener("click", callback); parent.appendChild(b); return b;
  };
  const open = () => {
    if (overlay) return;
    overlay = document.createElement("div");
    Object.assign(overlay.style, { position: "fixed", inset: "0", zIndex: "9999", background: "#0009", display: "grid", placeItems: "center", padding: "12px", boxSizing: "border-box" });
    let panel = document.createElement("section");
    Object.assign(panel.style, { width: "min(760px, 100%)", maxHeight: "min(88vh, 850px)", overflow: "auto", padding: "18px", borderRadius: "18px", background: "var(--background, #202820)", color: "var(--text, white)", border: "1px solid var(--stroke, #777)", boxShadow: "0 18px 60px #0008", fontFamily: "inherit", boxSizing: "border-box" });
    let head = document.createElement("div");
    Object.assign(head.style, { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" });
    let title = document.createElement("h2"); title.textContent = "🎮 PJ Arcade & Creator Hub"; title.style.margin = "0";
    let close = button("✕ Close", () => { clearTimer(); overlay.remove(); overlay = null; }, head);
    head.prepend(title);
    let subtitle = document.createElement("p"); subtitle.textContent = "Mini-games, creative tools and little Mii-themed challenges — all outside the 3D editor."; subtitle.style.opacity = ".8";
    let tabs = document.createElement("div");
    Object.assign(tabs.style, { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "7px", margin: "12px 0" });
    let content = document.createElement("div");
    Object.assign(content.style, { padding: "14px", borderRadius: "12px", background: "var(--container, #3335)", minHeight: "230px" });
    panel.append(head, subtitle, tabs, content); overlay.appendChild(panel); document.body.appendChild(overlay);
    const show = (heading, description) => {
      clearTimer(); content.replaceChildren();
      let h = document.createElement("h3"); h.textContent = heading; h.style.marginTop = "0";
      let p = document.createElement("p"); p.textContent = description; p.style.opacity = ".82";
      content.append(h, p);
      return content;
    };
    const note = (parent, value) => { let p = document.createElement("p"); p.textContent = value; parent.appendChild(p); return p; };
    const action = (parent, label, fn) => button(label, fn, parent);
    const games = [
      ["🧠 Mii Memory", () => {
        let area = show("Mii Memory Match", "Find all six matching pairs. Flip two cards per turn.");
        let symbols = ["🙂","😎","🤓","🥳","👻","🐱","⭐","🎮","🍀","🎵","🍉","🤖"];
        let deck = [...symbols.slice(0,6), ...symbols.slice(0,6)].sort(() => Math.random() - .5);
        let flipped = [], matched = new Set(), moves = 0, info = note(area, "Moves: 0 · Pairs: 0/6");
        let board = document.createElement("div"); Object.assign(board.style,{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"});
        deck.forEach((symbol,index) => {
          let card = action(board, "❔", () => {
            if (matched.has(index) || flipped.some(x => x.index === index) || flipped.length === 2) return;
            card.textContent = symbol; flipped.push({index,symbol,card});
            if (flipped.length === 2) {
              moves++;
              if (flipped[0].symbol === flipped[1].symbol) {
                flipped.forEach(x => { matched.add(x.index); x.card.disabled = true; x.card.style.opacity = ".55"; });
                flipped = [];
              } else {
                let pair = [...flipped]; flipped = [];
                gameTimer = setTimeout(() => pair.forEach(x => { x.card.textContent = "❔"; }), 700);
              }
              info.textContent = "Moves: " + moves + " · Pairs: " + matched.size/2 + "/6";
              if (matched.size === 12) { scores.memory++; info.textContent += " · YOU WIN!"; }
            }
          });
          Object.assign(card.style,{fontSize:"25px",minHeight:"62px"});
        });
        area.appendChild(board);
        action(area,"↻ Restart",()=>games[0][1]());
      }],
      ["❓ Mii Trivia", () => {
        let area = show("Mii Trivia", "Answer a quick Mii-game question. Get a point for each correct answer.");
        let questions = [
          ["Which console introduced the original Mii characters? ",["Wii","Nintendo DS","Game Boy Advance"],0],
          ["What is the name of Nintendo's Mii social life simulation on 3DS? ",["Wii Party","Tomodachi Life","Miitopia"],1],
          ["Which game lets Miis compete in bowling and tennis? ",["Wii Sports","Nintendogs","Animal Crossing"],0],
          ["Miitopia is mainly what kind of game? ",["Racing","RPG adventure","Puzzle platformer"],1],
          ["What can you customize in a Mii? ",["Face and features","Console firmware","Wi-Fi password"],0],
        ];
        let index = 0, points = 0, q = note(area,"");
        const next = () => {
          if(index >= questions.length){ q.textContent = "Finished! Score: "+points+"/"+questions.length; if(points>=3)scores.trivia++; return; }
          let [question,answers,correct] = questions[index]; q.textContent = (index+1)+"/"+questions.length+" · "+question;
          answers.forEach((answer,i)=>action(area,answer,()=>{ if(i===correct)points++; index++; area.querySelectorAll("button").forEach(b=>b.remove()); next(); }));
        };
        next();
      }],
      ["✊ Rock Paper Scissors", () => {
        let area = show("Rock Paper Scissors", "Challenge the computer. First to three wins.");
        let player=0, cpu=0, result=note(area,"You 0 — 0 CPU");
        const play = (choice) => {
          let options=["Rock","Paper","Scissors"], bot=options[Math.floor(Math.random()*3)];
          if(choice===bot) result.textContent="Tie! Both chose "+bot+".";
          else if((choice==="Rock"&&bot==="Scissors")||(choice==="Paper"&&bot==="Rock")||(choice==="Scissors"&&bot==="Paper")){player++;result.textContent="You win this round! "+choice+" beats "+bot+".";}
          else {cpu++;result.textContent="CPU wins this round. "+bot+" beats "+choice+".";}
          result.textContent += " Score: "+player+" — "+cpu;
          if(player===3||cpu===3){if(player===3)scores.rps++; result.textContent += player===3?" · MATCH WON!":" · CPU WINS!"; area.querySelectorAll("button").forEach(b=>b.disabled=true);}
        };
        ["Rock","Paper","Scissors"].forEach(x=>action(area,x,()=>play(x)));
      }],
      ["🎲 Dice Challenge", () => {
        let area=show("Dice Challenge","Roll two dice. Try to reach exactly 12!");
        let total=0, info=note(area,"Total: 0");
        action(area,"Roll 🎲",()=>{let a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6);total+=a+b;info.textContent="You rolled "+a+" + "+b+". Total: "+total+(total===12?" · PERFECT 12!":total>12?" · Over 12! Restart to try again.":"");});
        action(area,"Reset",()=>{total=0;info.textContent="Total: 0";});
      }],
      ["⚡ Reaction Test", () => {
        let area=show("Reaction Test","Wait until the panel turns green, then click as quickly as you can.");
        let state="idle", started=0, target;
        target=action(area,"Start test",()=>{
          if(state==="idle"){
            state="waiting";target.textContent="Wait...";target.disabled=true;
            gameTimer=setTimeout(()=>{state="ready";started=performance.now();target.disabled=false;target.textContent="CLICK NOW!";target.style.background="#16a34a";},1200+Math.random()*2800);
          } else if(state==="waiting"){
            clearTimer();state="idle";target.disabled=false;target.textContent="Too soon! Try again";target.style.background="";
          } else if(state==="ready"){
            let ms=Math.round(performance.now()-started);state="idle";target.textContent=ms+" ms · Try again";target.style.background="";
            if(ms<350)scores.reaction++;
          }
        });
      }],
      ["🧊 3D Shape Lab", () => {
        let area=show("3D Shape Lab","A little interactive CSS 3D playground — drag the sliders or rotate the object.");
        let stage=document.createElement("div");Object.assign(stage.style,{height:"245px",display:"grid",placeItems:"center",perspective:"700px",overflow:"hidden",borderRadius:"12px",background:"radial-gradient(circle at 50% 40%,#315b68,#101b2b)"});
        let object=document.createElement("div");Object.assign(object.style,{width:"112px",height:"112px",position:"relative",transformStyle:"preserve-3d",transform:"rotateX(-24deg) rotateY(35deg)",transition:"transform .18s"});
        let faces=[["front","translateZ(56px)"],["back","rotateY(180deg) translateZ(56px)"],["right","rotateY(90deg) translateZ(56px)"],["left","rotateY(-90deg) translateZ(56px)"],["top","rotateX(90deg) translateZ(56px)"],["bottom","rotateX(-90deg) translateZ(56px)"]];
        faces.forEach(([name,transform],i)=>{let face=document.createElement("div");Object.assign(face.style,{position:"absolute",inset:"0",display:"grid",placeItems:"center",border:"2px solid #d9f5ff99",background:["#31b6a4dd","#257b9add","#3c9bd5dd","#206b82dd","#80d9c5dd","#16465edd"][i],backdropFilter:"blur(2px)",fontSize:"26px",fontWeight:"800",color:"white",transform});face.textContent=["PJ","912","★","◆","🎮","🍀"][i];object.appendChild(face);});
        stage.appendChild(object);area.appendChild(stage);
        let rx=-24,ry=35,shape="cube";
        const redraw=()=>{object.style.transform="rotateX("+rx+"deg) rotateY("+ry+"deg)";};
        let controls=document.createElement("div");Object.assign(controls.style,{display:"flex",gap:"7px",flexWrap:"wrap",marginTop:"10px"});
        action(controls,"↶ Rotate left",()=>{ry-=25;redraw();});action(controls,"↷ Rotate right",()=>{ry+=25;redraw();});action(controls,"↑ Tilt",()=>{rx-=20;redraw();});action(controls,"↓ Tilt",()=>{rx+=20;redraw();});
        action(controls,"Reset",()=>{rx=-24;ry=35;redraw();});
        action(controls,"Auto spin",()=>{let active=true;let stop=action(controls,"Stop spin",()=>{active=false;stop.remove();});const spin=()=>{if(!active)return;ry+=2;redraw();gameTimer=setTimeout(spin,35);};spin();});
        area.appendChild(controls);
        let shapeRow=document.createElement("div");Object.assign(shapeRow.style,{display:"flex",gap:"7px",flexWrap:"wrap",marginTop:"8px"});
        action(shapeRow,"Cube",()=>{object.style.borderRadius="0";object.style.opacity="1";shape="cube";sayShape();});
        action(shapeRow,"Soft cube",()=>{object.style.borderRadius="24px";object.style.opacity=".92";shape="soft cube";sayShape();});
        action(shapeRow,"Hologram",()=>{object.style.borderRadius="50%";object.style.opacity=".72";object.style.filter="hue-rotate(80deg)";shape="hologram sphere";sayShape();});
        let shapeInfo=note(area,"Current object: cube");
        function sayShape(){shapeInfo.textContent="Current object: "+shape+". Rotate it to inspect the 3D effect.";}
        area.appendChild(shapeRow);
      }],
      ["🎨 Color Mixer", () => {
        let area=show("Color Mixer","Mix an RGB color and copy its HEX value.");
        let preview=document.createElement("div");Object.assign(preview.style,{height:"90px",borderRadius:"12px",margin:"10px 0",background:"#22aa66"});
        let output=note(area,"#22AA66"); area.appendChild(preview);
        let sliders=[];
        const update=()=>{let rgb=sliders.map(x=>Number(x.value)),hex="#"+rgb.map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();preview.style.background=hex;output.textContent=hex;};
        ["Red","Green","Blue"].forEach((name,i)=>{let label=document.createElement("label");label.textContent=name+" ";let input=document.createElement("input");input.type="range";input.min="0";input.max="255";input.value=[34,170,102][i];input.style.width="70%";input.addEventListener("input",update);sliders.push(input);label.appendChild(input);area.appendChild(label);});
        action(area,"Copy HEX",()=>navigator.clipboard?.writeText(output.textContent).then(()=>{output.textContent+=" · copied";}).catch(()=>{}));
      }],
    ];
    const tools = [
      ["🎯 Daily Challenge",()=>{let tasks=["Create a Mii with a color you never use.","Make a Mii inspired by a favorite game genre.","Try a face combination you have never used.","Create a family of three Miis with a shared theme.","Make a Mii using only random choices."];let area=show("Daily Challenge","A small creative mission for today.");note(area,tasks[Math.floor(Math.random()*tasks.length)]);}],
      ["🪪 Mii Name Ideas",()=>{let area=show("Name Generator","Generate a playful name for your next Mii.");let a=["Pip","Milo","Lumi","Nico","Tobi","Kiko","Mimi","Rolo","Zuzu","Pax"],b=["berry","spark","bloom","pixel","cloud","buddy","nova","mint","pop","quest"];note(area,a[Math.floor(Math.random()*a.length)]+b[Math.floor(Math.random()*b.length)]);action(area,"Generate another",()=>tools[1][1]());}],
      ["🎭 Personality Picker",()=>{let area=show("Personality Picker","A random character concept to inspire a Mii.");let p=["Cheerful explorer","Quiet inventor","Energetic comedian","Curious bookworm","Friendly competitor","Dreamy artist","Practical problem-solver","Mischievous prankster"];note(area,p[Math.floor(Math.random()*p.length)]);}],
      ["💭 Character Prompt",()=>{let area=show("Character Prompt","A creative starting point.");let p=["A Mii who collects unusual hats.","A Mii who wants to become a game designer.","A Mii who is secretly great at cooking.","A Mii who loves retro technology.","A Mii who always has a backup plan.","A Mii who runs a tiny island radio station."];note(area,p[Math.floor(Math.random()*p.length)]);}],
      ["📝 Quick Notes",()=>{let area=show("Quick Notes","Notes are stored only in this browser.");let input=document.createElement("textarea");input.rows=5;input.style.width="100%";input.value=localStorage.getItem("pj-creator-hub-notes")||"";area.appendChild(input);action(area,"Save notes",()=>{localStorage.setItem("pj-creator-hub-notes",input.value);note(area,"Saved locally.");});}],
      ["🏆 Scoreboard",()=>{let area=show("Arcade Scoreboard","Your wins are stored for this page session.");Object.entries(scores).forEach(([name,value])=>note(area,name.toUpperCase()+": "+value));action(area,"Reset scores",()=>{Object.keys(scores).forEach(k=>scores[k]=0);tools[5][1]();});}],
    ];
    [...games,...tools].forEach(([label,fn])=>action(tabs,label,fn));
    games[0][1]();
  };
  launcher.addEventListener("click",open);
  document.addEventListener("editor-launch",()=>{launcher.style.display="none";if(overlay){clearTimer();overlay.remove();overlay=null;}});
  document.addEventListener("editor-shutdown",()=>{launcher.style.display="block";});
}
async function main() {
  if (/Mobi/.test(navigator.userAgent)) document.documentElement.style.zoom = "0.8";
  await MB();
  let e = getMusicPlayer(),
    t = new URLSearchParams(location.search),
    r = t.has("select") ? !1 : !0,
    n = await localforage.default.getItem("settings_tutorialClear");
  (e.initMusic(n, !n), getSoundEffects());
  let i = !1;
  setInterval(() => {
    fetch("/api/session")
      .then((h) => {
        if (!h.ok) o();
      })
      .catch((h) => {
        o();
      });
  }, 45000);
  async function o() {
    if (i) return;
    if (((i = !0), getRefreshLibrary()(), MiiEditor.getCurrentEditor())) MiiEditor.getCurrentEditor()?.shutdown(!1, !1);
    if (
      (document.querySelectorAll(".modal").forEach((h) => {
        closeModal(Html.from(h));
      }),
      Modal.modal(
        translate("Warning"),
        translate("Mii Creator has lost connection to the server. Click OK to reload."),
        "body",
        {
          text: "OK",
          callback(h) {
            location.reload();
          },
        },
      ),
      e.mainGainNode.gain.setValueAtTime(e.mainGainNode.gain.value, getMusicPlayer().audioContext.currentTime),
      e.editGainNode)
    )
      e.editGainNode.gain.setValueAtTime(e.editGainNode.gain.value, getMusicPlayer().audioContext.currentTime);
    if (
      (e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 5),
      e.editGainNode)
    )
      e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 5);
  }
  if (!n)
    (localforage.default.setItem("settings_theme", "sw2"),
      localforage.default.setItem("settings_bgmType", "auto"),
      localforage.default.setItem("settings_sfxType", "auto"));
  if ((await applySettings(!0), !n)) await skipFirstRunSetup().then(() => {});
  (loadFFLResources(r, !0),
    getFFLResourcesPromise().catch((h) => {
      throw (
        Modal.modal(
          "Error",
          `Oops, an error occurred when loading Mii Creator..

Loading will not continue.`,
        )
          .qs(".modal-body")
          .appendMany(
            new Html("pre").style({ margin: "0", overflow: "auto", padding: "20px 0" }).text(h.stack),
            new Html("span").html(
              `If the error persists, please report this to the developer <a href="mailto:datkat21.yt@gmail.com">kat21's e-mail</a>!`,
            ),
            new Html("span").text("Or, you can try to reset your settings."),
            new Html("button")
              .class("danger")
              .text("Reset Settings")
              .on("click", async () => {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate("Are you sure you want to delete your settings? The page will reload."),
                    "body",
                    !0,
                  ))
                )
                  return;
                (localforage.default.clear(), location.reload());
              }),
          ),
        h
      );
    }));
  let s = Modal.modal(translate("Notice"), translate("Loading Mii Creator")),
    a = new Html("span").text(translate("Loading assets..."));
  (s.qs(".modal-body").append(a),
    await waitForFFLResources(),
    setTimeout(() => {
      closeModal(s);
    }, 500));
  function l() {
    if (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)
      (Modal.modal(
        translate("Warning"),
        translate(
          "You're using Mii Creator under Safari. Safari on iOS or iPadOS may experience instability with Mii Creator, causing the page to crash and refresh randomly. Some checks have been enabled to try and prevent the page from crashing right now. You have been warned.",
        ),
        "body",
        ...defaultModalButtons(),
      ),
        (isSafariBrowser = !0));
  }
  if (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)
    window.browserMitigations = !0;
  let c = "main";
  (document.addEventListener("editor-launch", () => {
    ((c = "edit"),
      setTimeout(() => {
        u();
      }, 100));
  }),
    document.addEventListener("editor-shutdown", () => {
      ((c = "main"),
        setTimeout(() => {
          u();
        }, 100));
    }));
  function u() {
    if (e.editGainNode === void 0) return;
    let h = 3.5;
    if (e.theme === "wiiu") h = 1;
    if (e.theme === "wii" || e.curTheme === "wii" || e.theme === "3ds" || e.curTheme === "3ds") {
      if (((h = 1), c === "main"))
        (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
          e.editGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
          e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
          e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h));
      if (c === "edit")
        (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
          e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
          e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
          e.editGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h));
      return;
    }
    if (e.theme === "miitomo" || e.curTheme === "miitomo") h = 0.5;
    if (c === "main")
      (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
        e.editGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
        e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
        e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h));
    if (c === "edit")
      (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
        e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
        e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h),
        e.editGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h));
  }
  let d = sessionStorage.getItem("loc");
  if (d !== null) {
    let h = new URLSearchParams(d);
    if (h.has("to")) {
      let f = h.get("to");
      if (f === "/") return;
      (sessionStorage.removeItem("loc"), (location.href = f));
    }
  }
  if (
    (l(),
    getSoundEffects().setVolume(0.28),
    e.setVolume(0.28),
    window.addEventListener("blur", () => {
      getSetting("bgmLoseFocus").then((h) => {
        if (h === !1) return;
        if (e.mainGainNode)
          if (e.editGainNode) {
            if (e.theme === "wii") {
              if (c === "main")
                (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.mainGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ),
                  e.editGainNode.gain.linearRampToValueAtTime(
                    -1,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ));
              if (c === "edit")
                (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
                  e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.mainGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ),
                  e.editGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ));
              return;
            }
            if (c === "main")
              (e.mainGainNode.gain.linearRampToValueAtTime(
                -0.8,
                getMusicPlayer().audioContext.currentTime + 0.5,
              ),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -1,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
            else if (c === "edit")
              (e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 0.5),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -0.8,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
          } else
            e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 0.5);
        else getMusicPlayer().setVolume(0);
        getSoundEffects().setVolume(0);
      });
    }),
    window.addEventListener("focus", () => {
      getSetting("bgmLoseFocus").then((h) => {
        if (h === !1) return;
        if (e.mainGainNode) {
          if (c === "main")
            (e.mainGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
              e.mainGainNode.gain.linearRampToValueAtTime(
                -0.6,
                getMusicPlayer().audioContext.currentTime + 0.5,
              ));
          else if (c === "edit")
            if (e.editGainNode)
              (e.editGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -0.6,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
            else
              (e.mainGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
                e.mainGainNode.gain.linearRampToValueAtTime(
                  -0.6,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
        } else getMusicPlayer().setVolume(0);
        getSoundEffects().setVolume(getSoundEffects().previousVolume);
      });
    }),
    !n)
  )
    (await runFirstRunSetup(), finishFirstRunSetup().then(() => {}));
  else if (location.search !== "")
    if (t.has("data"))
      (await waitForFFLResources(),
        new MiiEditor(
          0,
          async (h, f) => {
            if (window.parent !== window.self) {
              let p = new Mii(h),
                g = null,
                m = null,
                A = null;
              if (f === !0) {
                if (t.has("renderTypes")) {
                  let y = t.get("renderTypes").split(",");
                }
              }
              (e.mainGainNode.gain.linearRampToValueAtTime(-1, e.audioContext.currentTime + 0.5),
                window.opener.postMessage(
                  {
                    type: "miic-data-finalize",
                    properSave: f,
                    data: h,
                    name: p.nickname,
                    creator: p.creator,
                    headshot: g,
                    headOnly: m,
                    fullBody: A,
                  },
                  t.get("origin"),
                ));
            } else openLibrary();
          },
          t.get("data"),
        ));
    else if (t.has("select")) {
      let { miiData: h, mii: f } = await openLibrary(void 0, !0);
      (window.opener.postMessage(
        { type: "miic-select", data: f, name: h.nickname, creator: h.creator },
        "*",
      ),
        close());
    } else if (t.has("add-mii")) {
      let h = new Mii(decodeHexOrBase64(t.get("add-mii"))),
        f = translate("Mii Creator");
      (await waitForFFLResources(),
        cv(h, f, translate("You got sent a Mii!"), !0).then(() => {
          (Modal.modal(
            translate("Done"),
            translate("You can now close this tab, or continue using Mii Creator."),
            "body",
            {
              text: "Visit my Mii Library",
              callback(p) {
                openLibrary();
              },
            },
          ),
            window.close());
        }));
      return;
    } else if (t.has("settings")) openSettingsDialog();
    else if (t.has("custom-render")) {
      await waitForFFLResources();
      let h = t.get("custom-render"),
        f = new Mii(h);
      openCustomRenderDialog(f);
    } else openLibrary();
  else openLibrary();
  setTimeout(installCreatorHub, 900);
}
var localforage = In(Hs(), 1);
document.documentElement.dataset.theme = "sw2";
window.localforage = localforage.default;
main();
