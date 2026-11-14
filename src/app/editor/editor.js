// src/app/editor/editor.js
// MiiEditor: the editor screen.
//
// Defines: MiiEditor
// Uses from other files:
//   app/editor/tab-ids.js: TAB_FACE, TAB_HAIR, TAB_EYEBROWS, TAB_EYES, TAB_NOSE, TAB_MOUTH,
//                          TAB_BEARD, TAB_MOLE, TAB_GLASSES, TAB_SCALE, TAB_HAT, TAB_OUTFIT, … (+7
//                          more)
//   app/mii/colors.js: FAVORITE_COLORS_INT, FAVORITE_COLOR_GRADIENTS, COMMON_COLORS_HEX,
//                      COMMON_COLORS_SHADOW_HEX
//   app/util/colors-and-bytes.js: adjustLightness, id, bytesToBase64
//   app/ui/components.js: addButtonSounds, createTabList, m7
//   app/renderer/ffl-resources.js: Pd, waitForFFLResources
//   app/ui/html.js: Html
//   app/audio/sound-effects.js: playSound
//   app/mii/formats/ffsd-miic.js: createDefaultMiicFields
//   app/mii/mii.js: Mii
//   app/ui/icons.js: SVG_ICONS
//   app/ui/modal.js: Modal
//   app/editor/tabs/hat-tab.js: hatTab
//   … and 16 more files

class MiiEditor {
  mii;
  icons;
  ui;
  dirty;
  ready;
  hairFlipToggle;
  eyeScleraToggle;
  onShutdown;
  errors;
  useAccessibility;
  editLimits;
  static getCurrentEditor() {
    return g9;
  }
  #t;
  get source() {
    return this.#t;
  }
  #e = !1;
  constructor(e, t, r, n, i = !0) {
    if (MiiEditor.getCurrentEditor() !== null) throw Error("Cannot make multiple instances of MiiEditor!");
    ((window.editor = this),
      (g9 = this),
      (this.secretUnlocks = new Set()),
      (() => {
        try {
          for (let id of JSON.parse(localStorage.getItem("thepjsmiicreator-secrets") || "[]"))
            this.secretUnlocks.add(id);
        } catch {}
      })(),
      (this.secretKeyBuffer = []),
      (this.secretClickCount = 0),
      (this.#e = i),
      (this.#t = n || 0),
      document.dispatchEvent(new CustomEvent("editor-launch")),
      this.showLoadIndicator(),
      (this.dirty = !1),
      (this.ready = !1),
      (this.errors = /*@__PURE__*/ new Map()));
    let o = Rce;
    if (e === 1) o = Oce;
    if (r) o = r;
    if (t) this.onShutdown = t;
    let a = new Mii(o, 1).exportBase64("miic");
    if (((this.mii = new Mii(a, 1)), !r)) this.mii.nickname = "";
    if (((editorMii = this.mii), (this.mii.miicVersion = 7), this.mii.nickname.trim() === ""))
      this.errors.set("Name", {
        valid: !1,
        reason: translate("A name must be given using the details tab"),
      });
    this.#A();
  }
  #n = !1;
  #i = !1;
  #r(e) {
    if (this.#n) return;
    this.#n = !0;
    let t = "ghost",
      r = "",
      i = {
        miitomo: { i: 21, c: 19 },
        wii: { i: 8, c: 7 },
        wiiu: { i: 11, c: 4 },
        streetpass: { i: 3, c: 4 },
        switch: { i: 7, c: 16 },
      }[e];
    function o(a) {
      if (typeof a === "string") return a;
      return `Pose.${a.toString().padStart(2, "0")}`;
    }
    let s = async (a) => {
      if (this.#i) return;
      if (document.activeElement !== null && document.activeElement === document.body) {
        let l = a.key.toLowerCase();
        if (((r += l), r.length > t.length)) r = r.slice(-t.length);
        if (r === t) {
          if (
            ((this.#i = !0),
            (this.mii.height = Math.min(this.mii.height, 127)),
            (this.mii.build = Math.min(this.mii.build, 127)),
            this.mii.personality !== 24)
          ) {
            if (
              (playSound("undo"),
              this.#l(),
              (this.mii.personality = 24),
              await this.render(!0, 0, 1),
              this.ui.scene.setExpression(10),
              e)
            )
              (this.ui.scene.swapAnimation(o(i.i), !1, !0),
                setTimeout(() => {
                  (this.ui.scene.setExpression(0),
                    this.ui.scene.swapAnimation(this.ui.scene.getWaitAnimation(), !1, !1),
                    this.enableUI(),
                    (this.#i = !1));
                }, 5000));
            else
              setTimeout(() => {
                (this.ui.scene.setExpression(0), this.enableUI());
              }, 2000);
            Notify.show(
              "..?",
              `${this.mii.nickname.trim() == "" ? "Mii" : this.mii.nickname} became incorporeal.
Look what you've done.`,
            );
          } else {
            if (
              (this.#l(),
              (this.mii.personality = -1),
              await this.render(!0, 0, 1),
              this.ui.scene.setExpression(7),
              playSound("receive"),
              e)
            )
              (this.ui.scene.swapAnimation(o(i.c), !1, !0),
                setTimeout(() => {
                  (this.ui.scene.setExpression(0),
                    this.ui.scene.swapAnimation(this.ui.scene.getWaitAnimation(), !1, !1),
                    this.enableUI(),
                    (this.#i = !1));
                }, 3000));
            else
              setTimeout(() => {
                (this.ui.scene.setExpression(0), this.enableUI());
              }, 2000);
            Notify.show(
              "..?",
              `${this.mii.nickname.trim() == "" ? "Mii" : this.mii.nickname} became corporeal again!
They thank you very much..`,
            );
          }
          this.callTab(this.#p);
        }
      }
    };
    (document.addEventListener("keydown", s),
      (this.#o = () => {
        document.removeEventListener("keydown", s);
      }));
  }
  #o = null;
  #c;
  showLoadIndicator() {
    let e = () => {
      if (this.ready) {
        this.hideLoadIndicator();
        return;
      } else if (this.ui) {
        if (this.ui.mii) {
          if (this.ui.mii.qs(".loader")) this.ui.mii.qs(".loader").classOn("active");
        }
      }
    };
    (e(), (this.#c = setInterval(e, 1000)));
  }
  hideLoadIndicator() {
    if ((clearInterval(this.#c), this.ui.mii.qs(".loader")))
      this.ui.mii.qs(".loader").classOff("active");
  }
  async #A() {
    let e = await getSetting("accessibilityFeature"),
      t = await getSetting("editLimits");
    if (
      ((this.useAccessibility = e),
      (this.editLimits = t),
      (this.icons = Pd()),
      (this.ui = {}),
      this.#m(),
      this.#u(),
      await this.#f(),
      this.#h(),
      await this.render(void 0, void 0, 1),
      (this.ready = !0),
      this.source === 1)
    )
      this.#l();
  }
  #m() {
    this.ui.base = new Html("div").class("ui-base").appendTo("body");
  }
  async #f() {
    ((this.ui.mii = new Html("div").class("mii-holder").appendTo(this.ui.base)),
      this.ui.mii.append(new Html("div").html(SVG_ICONS.loading).class("loader", "active")),
      this.ui.mii.append(new Html("div").class("sparkle-container")),
      document.addEventListener("pointerdown", dG),
      (this.hairFlipToggle = addButtonSounds(
        new Html("button")
          .style({ position: "absolute", top: "5rem", right: "1rem" })
          .html(SVG_ICONS.hair_flip)
          .on("click", () => {
            ((this.mii.hairFlip = Number(!this.mii.hairFlip)), this.render(!0, 0, 0));
          })
          .appendTo(this.ui.mii),
      )),
      (this.eyeScleraToggle = addButtonSounds(
        new Html("button")
          .style({ position: "absolute", top: "5rem", right: "1rem" })
          .html(SVG_ICONS.eye_sclera)
          .on("click", () => {
            ((this.mii.eyeSclera = Number(!this.mii.eyeSclera)), this.render(!0, 0, 0));
          })
          .appendTo(this.ui.mii),
      )));
    let e = addButtonSounds(
        new Html("button")
          .class("square", "bottom-left")
          .html(SVG_ICONS.rotate)
          .appendTo(this.ui.mii)
          .on("click", () => {
            this.ui.scene.cameraRotate();
          }),
      ),
      t = addButtonSounds(
        new Html("button")
          .class("square", "bottom-right")
          .html(SVG_ICONS.recenter)
          .appendTo(this.ui.mii)
          .on("click", () => {
            this.ui.scene.cameraRecenter();
          }),
      );
    if (this.editLimits !== "miic") {
      let r = new Html("span").class("top-left").appendTo(this.ui.mii).style({ "max-width": "90vw" });
      switch (
        (r.on("click", () => {
          Modal.alert(
            translate("Notice"),
            translate(`You have Editor Limits enabled, which is restricting options.
If you want to use all Mii Creator features, change it in Settings -> Editor.`),
          );
        }),
        this.editLimits)
      ) {
        case "wii":
          r.html(SVG_ICONS.edit_limits_wii);
          break;
        case "3ds_wiiu":
          r.html(SVG_ICONS.edit_limits_wiiu);
          break;
        case "switch":
          r.html(SVG_ICONS.edit_limits_switch);
          break;
      }
    }
    if (this.useAccessibility === !1)
      (this.hairFlipToggle.style({
        "z-index": "1",
        background: "transparent",
        color: "transparent",
        border: "0",
        "border-radius": "8px",
        padding: "0",
      }),
        this.eyeScleraToggle.style({
          "z-index": "1",
          background: "transparent",
          color: "transparent",
          border: "0",
          "border-radius": "8px",
          padding: "0",
        }));
    else
      (e.text(translate("Rotate")),
        t.text(translate("Recenter")),
        this.hairFlipToggle.text(translate("Flip Hair")),
        this.eyeScleraToggle.text(translate("Toggle Sclera")));
  }
  async #s() {
    (await waitForFFLResources(),
      (this.ui.scene = new MiiViewer(this.mii, this.ui.mii.elm, void 0, void 0, void 0, this)),
      await this.ui.scene.init(),
      this.ui.mii.append(this.ui.scene.getRendererElement()),
      window.addEventListener("resize", () => {
        this.ui.scene.resize();
      }),
      this.ui.scene.focusCamera(0),
      this.ui.scene.getRendererElement().classList.add("ready"),
      this.ui.scene.getRendererElement().addEventListener("dblclick", () => {
        this.ui.scene.cameraRecenter(!0);
      }),
      this.ui.mii.qs(".loader").classOff("active"),
      (this.ui.animationStudioButton = addButtonSounds(
        new Html("button")
          .text(translate("Animation Studio"))
          .style({
            position: "absolute",
            top: "1rem",
            right: "1rem",
            "z-index": "4",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openAnimationStudio()),
      )),
      (this.ui.customPoseMakerButton = addButtonSounds(
        new Html("button")
          .text(translate("Custom Pose Maker"))
          .style({
            position: "absolute",
            top: "1rem",
            right: "10rem",
            "z-index": "4",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openCustomPoseMaker()),
      )),
      (this.ui.expressionCreatorButton = addButtonSounds(new Html("button").text("🎭 Expression Creator").style({ position:"absolute", top:"1rem", right:"19rem", "z-index":"4" }).appendTo(this.ui.mii).on("click", () => this.openExpressionCreator()))),
      (this.ui.sandboxButton = addButtonSounds(
        new Html("button")
          .text("🧪 Sandbox Mode")
          .style({
            position: "absolute",
            top: "7rem",
            left: "1rem",
            "z-index": "4",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openSandboxMode()),
      )),
      (this.ui.prototypeArchiveButton = addButtonSounds(
        new Html("button")
          .text("🗃️ Prototype Archive")
          .style({
            position: "absolute",
            top: "10rem",
            left: "1rem",
            "z-index": "4",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openPrototypeArchive()),
      )),
      (this.ui.modelLabButton = addButtonSounds(
        new Html("button")
          .text("Model Lab")
          .style({
            position: "absolute",
            top: "4rem",
            left: "1rem",
            "z-index": "4",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openModelLab()),
      )),
      (this.ui.secretVaultButton = addButtonSounds(
        new Html("button")
          .text("🔓 Secret Vault (" + this.secretUnlocks.size + ")")
          .style({
            position: "absolute",
            top: "4rem",
            right: "1rem",
            "z-index": "4",
            display: this.secretUnlocks.size ? "block" : "none",
          })
          .appendTo(this.ui.mii)
          .on("click", () => this.openSecretVault()),
      )),
      (this.secretKeyHandler = (event) => {
        if (event.target?.matches?.("input, textarea, select, [contenteditable='true']")) return;
        let key = event.key.toLowerCase(),
          sequence = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
        this.secretKeyBuffer.push(key);
        this.secretKeyBuffer = this.secretKeyBuffer.slice(-sequence.length);
        if (sequence.every((value, index) => this.secretKeyBuffer[index] === value)) {
          this.unlockSecret("konami", "Konami Code", "You found the classic secret input! A new Secret Vault entry has been unlocked.");
          this.secretKeyBuffer = [];
        }
        if (key === "p") this.secretTypingBuffer = "p";
        else if (this.secretTypingBuffer) {
          this.secretTypingBuffer += key;
          this.secretTypingBuffer = this.secretTypingBuffer.slice(-5);
          if (this.secretTypingBuffer === "pj912") {
            this.unlockSecret("pj912", "PJ912", "The creator signature. You found the hidden PJ code.");
            this.secretTypingBuffer = "";
          }
        }
      }),
      document.addEventListener("keydown", this.secretKeyHandler),
      this.ui.scene.getRendererElement().addEventListener("click", () => {
        this.secretClickCount++;
        if (this.secretClickCount === 7) {
          this.unlockSecret("lucky-seven", "Lucky Seven", "Seven clicks on the Mii viewer. That's dedication.");
        }
      }),
      getSetting("shaderTypeN").then((e) => {
        ((this.#g = e),
          getSetting("bodyModelN").then((t) => {
            this.#r(t);
          }));
      }));
  }
  openPrototypeArchive() {
    if (this.ui.prototypeArchivePanel) {
      this.ui.prototypeArchiveCleanup?.();
      return;
    }
    let scene = this.ui.scene,
      body = scene?.bodyModels?.get(this.mii.gender),
      root = body?.model?.scene,
      originalVisible = root?.visible ?? true,
      originalTransform = root ? {
        position: root.position.clone(),
        rotation: root.rotation.clone(),
        scale: root.scale.clone(),
      } : null,
      wireframes = [],
      hidden = false,
      paused = false,
      speedIndex = 0,
      timer = null,
      panel = new Html("div").style({
        position: "absolute", right: "1rem", top: "8rem",
        width: "min(390px, calc(100vw - 2rem))",
        "max-height": "min(72vh, 650px)", "overflow-y": "auto",
        "box-sizing": "border-box", padding: "14px", display: "flex",
        "flex-direction": "column", gap: "9px", color: "var(--text)",
        background: "var(--container)", border: "1px solid var(--stroke)",
        "border-radius": "12px", "box-shadow": "0 8px 28px #0005", "z-index": "12",
      }),
      heading = new Html("div").text("🗃️ Prototype Archive").style({ "font-weight": "800", "font-size": "1.1rem" }),
      intro = new Html("small").text("20 experimental tools inspired by Mii-game prototypes, unused assets and creator utilities. Historical notes are labeled; the interactive demos here are original recreations."),
      status = new Html("div").text("Choose a prototype below.").style({
        padding: "9px", background: "var(--background)", "border-radius": "8px",
        "font-size": "0.85rem", "white-space": "pre-wrap",
      }),
      grid = new Html("div").style({
        display: "grid", "grid-template-columns": "1fr 1fr", gap: "7px",
      }),
      makeButton = (label, callback) => addButtonSounds(
        new Html("button").text(label).style({ width: "100%", "min-height": "42px", "white-space": "normal" }).on("click", callback),
      ),
      say = (title, message) => status.text(title + "\n" + message),
      close = () => this.ui.prototypeArchiveCleanup?.(),
      telephoneLines = [
        "Hey! I found a mysterious object. What do you think it does?",
        "If you could visit any place in the Mii world, where would you go?",
        "I heard there's a hidden character somewhere nearby. Any clues?",
        "What's your favorite memory from the island?",
      ],
      adviceOptions = [
        ["Try a new hobby", "Maybe your Mii should explore a creative hobby today."],
        ["Take a little break", "A calm moment might be just what your Mii needs."],
        ["Meet someone new", "Your Mii could start a friendly conversation."],
        ["Follow a curiosity", "Let your Mii investigate something interesting."],
      ],
      setWireframe = (enabled) => {
        if (!root) return say("Wireframe Preview", "No 3D body model is loaded.");
        if (enabled) {
          wireframes = [];
          root.traverse((object) => {
            if (!object.isMesh || !object.material) return;
            for (let material of (Array.isArray(object.material) ? object.material : [object.material])) {
              if (!material || !("wireframe" in material)) continue;
              wireframes.push([material, material.wireframe]);
              material.wireframe = true;
            }
          });
          say("Wireframe Preview", "Wireframe enabled. Press the same button again or close the archive to restore materials.");
        } else {
          for (let [material, value] of wireframes) material.wireframe = value;
          wireframes = [];
          say("Wireframe Preview", "Original material display restored.");
        }
      },
      rigSummary = () => {
        let names = [], meshes = 0, materials = 0, hands = [];
        root?.traverse((object) => {
          if (object.isBone) {
            names.push(object.name);
            if (/hand|finger|thumb|index|middle|ring|pinky/i.test(object.name)) hands.push(object.name);
          }
          if (object.isMesh) {
            meshes++;
            materials += Array.isArray(object.material) ? object.material.length : (object.material ? 1 : 0);
          }
        });
        return { bones: names.length, meshes, materials, boneNames: names, handBones: hands };
      },
      features = [
        ["☎️ String telephone", () => say("String Telephone Prototype", telephoneLines[Math.floor(Math.random() * telephoneLines.length)] + "\n\nInspired by an early Tomodachi Life interaction prototype. This is an original text demo.")],
        ["💡 Conversation advice", () => {
          let option = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];
          say("Advice Deck · " + option[0], option[1] + "\n\nThe Mii's next action remains up to the player.");
        }],
        ["🥷 Ninja hide-and-seek", () => {
          if (!root) return say("Ninja", "No 3D model is loaded.");
          hidden = !hidden;
          root.visible = !hidden;
          say("Ninja · Hidden Mii", hidden ? "The Mii is hidden! Press this button again to reveal them." : "Found them! The Mii is visible again.");
        }],
        ["👏 Find clapping animation", () => {
          let name = Array.from(body?.actions?.keys?.() || []).find((key) => /clap|applause/i.test(String(key)));
          if (!name) return say("Unused Animation Search", "No clapping-named animation exists in this loaded model's action list. The archive does not invent one.");
          scene.swapAnimation(String(name), true, false);
          say("Clapping Animation", "Playing available animation: " + name);
        }],
        ["🎾 Tennis serve note", () => say("Wii Sports · Unused text", "Historical note: research documents an unused tennis serve/net-related message. This entry is an archive note, not a playable tennis mode.")],
        ["🦴 Full rig inspector", () => {
          let info = rigSummary();
          say("Rig Inspector", info.bones + " bones · " + info.meshes + " meshes · " + info.materials + " materials\n\n" + info.boneNames.slice(0, 28).join(", "));
        }],
        ["✋ Hand & finger scan", () => {
          let hands = rigSummary().handBones;
          say("Hand / Finger Scan", hands.length ? hands.join(", ") : "No hand or finger bones were found in this model.");
        }],
        ["🎲 Animation roulette", () => {
          let names = Array.from(body?.actions?.keys?.() || []);
          if (!names.length) return say("Animation Roulette", "No animation actions are available on this body model.");
          let name = names[Math.floor(Math.random() * names.length)];
          scene.swapAnimation(String(name), true, false);
          say("Animation Roulette", "Selected: " + name);
        }],
        ["⏯️ Pause / resume", () => {
          let actions = body?.actions;
          if (!actions?.size) return say("Playback", "No animation actions are available.");
          paused = !paused;
          actions.forEach((action) => { action.paused = paused; });
          say("Playback", paused ? "All loaded animation actions paused." : "Animation actions resumed.");
        }],
        ["⏩ Animation speed", () => {
          let actions = body?.actions;
          if (!actions?.size) return say("Playback Speed", "No animation actions are available.");
          let speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
          speedIndex = (speedIndex + 1) % speeds.length;
          actions.forEach((action) => action.setEffectiveTimeScale(speeds[speedIndex]));
          say("Playback Speed", "Set available actions to " + speeds[speedIndex] + "×.");
        }],
        ["🎯 Recenter camera", () => { scene?.cameraRecenter?.(true); say("Camera", "Camera recentered."); }],
        ["🔄 Rotate camera", () => { scene?.cameraRotate?.(); say("Camera", "Camera rotation control activated."); }],
        ["📸 Save 3D screenshot", () => {
          try {
            let canvas = scene.getRendererElement(), link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = (this.mii.nickname.trim() || "Mii") + "-prototype-archive.png";
            document.body.appendChild(link); link.click(); link.remove();
            say("Screenshot", "PNG screenshot export requested.");
          } catch (error) { say("Screenshot unavailable", String(error?.message || error)); }
        }],
        ["🕸️ Toggle wireframe", () => setWireframe(wireframes.length === 0)],
        ["🎨 Material inventory", () => {
          let info = rigSummary();
          say("Material Inventory", info.materials + " material slots across " + info.meshes + " meshes. Custom shader materials are counted but left untouched.");
        }],
        ["🎲 Random proportions", () => {
          let max = this.mii.personality === 24 ? 255 : 127;
          this.mii.height = Math.floor(Math.random() * (max + 1));
          this.mii.build = Math.floor(Math.random() * (max + 1));
          this.render(true, 0, 1);
          say("Random Proportions", "Generated height " + this.mii.height + " and build " + this.mii.build + ".");
        }],
        ["💾 Quick-save profile", () => {
          try {
            localStorage.setItem("thepjsmiicreator-prototype-profile-" + this.mii.gender, JSON.stringify({
              format: "ThePJsMiiCreator.PrototypeProfile", version: 1,
              height: this.mii.height, build: this.mii.build, gender: this.mii.gender,
            }));
            say("Quick Save", "Current height and build saved in this browser.");
          } catch (error) { say("Quick Save failed", String(error?.message || error)); }
        }],
        ["📤 Export profile", () => {
          let data = { format: "ThePJsMiiCreator.PrototypeProfile", version: 1, gender: this.mii.gender, height: this.mii.height, build: this.mii.build };
          let url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
          let link = document.createElement("a"); link.href = url;
          link.download = (this.mii.nickname.trim() || "Mii") + "-prototype-profile.json";
          document.body.appendChild(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          say("Export Profile", "Profile JSON export requested.");
        }],
        ["📋 Copy rig summary", () => {
          let info = rigSummary(), summary = JSON.stringify(info, null, 2);
          if (navigator.clipboard?.writeText) navigator.clipboard.writeText(summary)
            .then(() => say("Rig Summary", "Copied " + info.bones + " bones and " + info.meshes + " meshes."))
            .catch(() => say("Rig Summary", summary));
          else say("Rig Summary", summary);
        }],
        ["🧹 Reset preview stage", () => {
          if (root && originalTransform) {
            root.position.copy(originalTransform.position);
            root.rotation.copy(originalTransform.rotation);
            root.scale.copy(originalTransform.scale);
            root.visible = originalVisible;
            hidden = false;
            root.updateMatrixWorld(true);
          }
          setWireframe(false);
          say("Preview Stage", "Original model transform, visibility and material wireframe settings restored.");
        }],
      ];
    for (let [label, callback] of features) grid.append(makeButton(label, callback));
    panel.appendMany(heading, intro, status, grid, makeButton("Close Prototype Archive", close));
    this.ui.mii.append(panel);
    this.ui.prototypeArchivePanel = panel;
    this.ui.prototypeArchiveCleanup = () => {
      if (timer !== null) clearTimeout(timer);
      setWireframe(false);
      if (root && originalTransform) {
        root.position.copy(originalTransform.position);
        root.rotation.copy(originalTransform.rotation);
        root.scale.copy(originalTransform.scale);
        root.visible = originalVisible;
        root.updateMatrixWorld(true);
      }
      panel.cleanup();
      this.ui.prototypeArchivePanel = null;
      this.ui.prototypeArchiveCleanup = null;
    };
  }
  openSandboxMode() {
    if (this.ui.sandboxPanel) {
      this.ui.sandboxPanel.cleanup();
      this.ui.sandboxPanel = null;
      return;
    }
    let body = this.ui.scene?.bodyModels?.get(this.mii.gender),
      root = body?.model?.scene;
    if (!root) {
      Notify.show("Sandbox Mode", "The 3D model is not ready yet. Try again in a moment.");
      return;
    }
    let originalScale = root.scale.clone(),
      originalMaterials = [],
      transformed = false,
      panel = new Html("div").style({
        position: "absolute",
        left: "1rem",
        top: "10rem",
        width: "min(320px, calc(100vw - 2rem))",
        "max-height": "min(60vh, 480px)",
        "overflow-y": "auto",
        "box-sizing": "border-box",
        padding: "14px",
        display: "flex",
        "flex-direction": "column",
        gap: "10px",
        color: "var(--text)",
        background: "var(--container)",
        border: "1px solid var(--stroke)",
        "border-radius": "12px",
        "box-shadow": "0 8px 28px #0005",
        "z-index": "8",
      }),
      heading = new Html("div").text("🕹️ Sandbox Mode").style({
        "font-weight": "700",
        "font-size": "1.05rem",
      }),
      description = new Html("small").text("Free play: experiment with a silly fictional item and reset whenever you like."),
      status = new Html("div").text("Form: Normal").style({ "font-weight": "600" }),
      makeButton = (label, callback) =>
        addButtonSounds(new Html("button").text(label).style({ width: "100%" }).on("click", callback)),
      restore = () => {
        root.scale.copy(originalScale);
        for (let [mesh, material] of originalMaterials) mesh.material = material;
        root.updateMatrixWorld(!0);
        transformed = false;
        status.text("Form: Normal");
      },
      applyBlueberry = (amount = 1.55) => {
        if (!transformed) {
          root.traverse((object) => {
            if (!object.isMesh || !object.material) return;
            let original = object.material;
            let canTint = (material) =>
              material?.isMeshStandardMaterial ||
              material?.isMeshPhongMaterial ||
              material?.isMeshBasicMaterial ||
              material?.isMeshLambertMaterial;
            let tint = (material) => {
              if (!canTint(material)) return material;
              let copy = material.clone();
              if (copy.color) copy.color.lerp(new THREE.Color("#397bd1"), 0.58);
              return copy;
            };
            let tinted = Array.isArray(original)
              ? original.map(tint)
              : tint(original);
            if (tinted !== original && (!Array.isArray(original) || tinted.some((m, i) => m !== original[i]))) {
              originalMaterials.push([object, original]);
              object.material = tinted;
            }
          });
          transformed = true;
        }
        // Push the whole character toward a rounded, ball-like silhouette.
        // Wider X/Z and a slightly compressed Y make the full model read as a sphere.
        let sphereFactor = 1 + (amount - 1) * 1.45;
        root.scale.set(
          originalScale.x * sphereFactor,
          originalScale.y * (1 + (sphereFactor - 1) * 0.88),
          originalScale.z * sphereFactor,
        );
        root.updateMatrixWorld(!0);
        status.text("Form: Blueberry mode 🫐 (" + Math.round(amount * 100) + "%)");
      },
      sizeLabel = new Html("label").text("Cartoon puff: 155%"),
      sizeInput = new Html("input").attr({
        type: "range",
        min: "120",
        max: "200",
        step: "1",
        value: "155",
      }).style({ width: "100%" }),
      itemButton = makeButton("🫐 Use TCM Gum", () => {
        applyBlueberry(Number(sizeInput.getValue()) / 100);
        Notify.show("TCM Gum", "Fictional item activated! Blueberry mode!");
      }),
      controls = new Html("div").style({
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "8px",
      }),
      close = () => {
        restore();
        panel.cleanup();
        this.ui.sandboxPanel = null;
      };
    sizeInput.on("input", () => {
      let amount = Number(sizeInput.getValue()) / 100;
      sizeLabel.text("Cartoon puff: " + Math.round(amount * 100) + "%");
      if (transformed) applyBlueberry(amount);
    });
    controls.appendMany(
      makeButton("Reset character", () => {
        restore();
        sizeInput.val("155");
        sizeLabel.text("Cartoon puff: 155%");
      }),
      makeButton("Random puff", () => {
        let amount = 1.2 + Math.random() * 0.8;
        sizeInput.val(String(Math.round(amount * 100)));
        sizeLabel.text("Cartoon puff: " + Math.round(amount * 100) + "%");
        applyBlueberry(amount);
      }),
      makeButton("Close sandbox", close),
    );
    panel.appendMany(heading, description, status, itemButton, sizeLabel, sizeInput, controls,
      makeButton("🎬 Play blueberry cutscene", () => this.openSandboxCutscene()));
    this.ui.mii.append(panel);
    this.ui.sandboxPanel = panel;
  }
  openSandboxCutscene() {
    if (this.ui.sandboxCutscenePanel) {
      this.ui.sandboxCutsceneCleanup?.();
      return;
    }
    let body = this.ui.scene?.bodyModels?.get(this.mii.gender),
      root = body?.model?.scene;
    if (!root) {
      Notify.show("Sandbox Cutscene", "The 3D model is not ready yet. Try again in a moment.");
      return;
    }
    let originalScale = root.scale.clone(),
      originalRotation = root.rotation.clone(),
      originals = [],
      timer = null,
      closed = false,
      panel = new Html("div").style({
        position: "absolute",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        width: "min(680px, calc(100% - 2rem))",
        padding: "12px 16px",
        display: "flex",
        "flex-direction": "column",
        gap: "8px",
        "box-sizing": "border-box",
        color: "#fff",
        background: "linear-gradient(145deg, #101a2ce8, #243d65e8)",
        border: "1px solid #8fc7ff",
        "border-radius": "14px",
        "box-shadow": "0 8px 32px #0009",
        "z-index": "20",
        "text-align": "center",
        "backdrop-filter": "blur(8px)",
      }),
      eyebrow = new Html("div").text("🫐 TCM GUM • 3D CUTSCENE").style({
        "font-size": "0.7rem", "letter-spacing": "0.12em", opacity: "0.8",
      }),
      title = new Html("div").text("The TCM Gum Experiment").style({
        "font-size": "1.2rem", "font-weight": "800",
      }),
      sceneText = new Html("div").text("A curious Mii discovers a mysterious piece of TCM Gum...").style({
        "font-size": "0.95rem", "line-height": "1.4",
      }),
      progress = new Html("div").text("Scene 1 / 5").style({ opacity: "0.75", "font-size": "0.8rem" }),
      makeButton = (label, callback) => addButtonSounds(
        new Html("button").text(label).style({ padding: "9px 13px" }).on("click", callback),
      ),
      restore = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
        root.scale.copy(originalScale);
        root.rotation.copy(originalRotation);
        for (let [mesh, material] of originals) mesh.material = material;
        root.updateMatrixWorld(!0);
      },
      applyTint = () => {
        if (originals.length) return;
        root.traverse((object) => {
          if (!object.isMesh || !object.material) return;
          let original = object.material;
          let canTint = (material) =>
            material?.isMeshStandardMaterial ||
            material?.isMeshPhongMaterial ||
            material?.isMeshBasicMaterial ||
            material?.isMeshLambertMaterial;
          let tint = (material) => {
            if (!canTint(material)) return material;
            let copy = material.clone();
            if (copy.color) copy.color.lerp(new THREE.Color("#397bd1"), 0.58);
            return copy;
          };
          let tinted = Array.isArray(original) ? original.map(tint) : tint(original);
          if (tinted !== original && (!Array.isArray(original) || tinted.some((m, i) => m !== original[i]))) {
            originals.push([object, original]);
            object.material = tinted;
          }
        });
      },
      applySphereInflation = (amount) => {
        applyTint();
        // The body model itself expands in all three dimensions, becoming a
        // rounded blueberry-like sphere rather than merely growing taller.
        let sphere = 1 + amount * 1.18;
        root.scale.set(
          originalScale.x * sphere,
          originalScale.y * (1 + amount * 1.02),
          originalScale.z * sphere,
        );
        root.rotation.y = originalRotation.y + amount * 0.12;
        root.updateMatrixWorld(!0);
      },
      scenes = [
        ["Scene 1 / 5", "A curious Mii discovers a mysterious piece of TCM Gum...", 0],
        ["Scene 2 / 5", "One tiny taste later... something unusual begins.", 0],
        ["Scene 3 / 5", "A blue glow! The 3D transformation starts with a gentle cartoon puff.", 0.25],
        ["Scene 4 / 5", "The body rounds outward in every direction, becoming a big blueberry-like sphere!", 1],
        ["Scene 5 / 5", "Ta-da! Full blueberry sphere mode. The experiment is complete!", 1],
      ],
      finish = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
        applySphereInflation(1);
        progress.text("Cutscene complete");
        sceneText.text("Blueberry sphere mode achieved! Replay the 3D transformation or close the cutscene.");
        replayButton.style({ display: "inline-block" });
        skipButton.style({ display: "none" });
      },
      play = () => {
        restore();
        originals = [];
        replayButton.style({ display: "none" });
        skipButton.style({ display: "inline-block" });
        title.text("The TCM Gum Experiment");
        let index = 0, tick = 0;
        sceneText.text(scenes[0][1]);
        progress.text(scenes[0][0]);
        timer = setInterval(() => {
          tick++;
          if (index >= 2) {
            let amount = Math.min(1, (index - 2 + tick / 50) / 2);
            applySphereInflation(amount);
          }
          if (tick >= 50) {
            tick = 0;
            index++;
            if (index >= scenes.length) {
              finish();
              return;
            }
            progress.text(scenes[index][0]);
            sceneText.text(scenes[index][1]);
          }
        }, 60);
      },
      replayButton = makeButton("↻ Replay 3D scene", play),
      skipButton = makeButton("Skip to sphere ending", finish),
      closeButton = makeButton("Close cutscene", () => this.ui.sandboxCutsceneCleanup?.()),
      buttons = new Html("div").style({
        display: "flex", "flex-wrap": "wrap", "justify-content": "center", gap: "8px",
      });
    buttons.appendMany(replayButton, skipButton, closeButton);
    panel.appendMany(eyebrow, title, sceneText, progress, buttons);
    this.ui.mii.append(panel);
    this.ui.sandboxCutscenePanel = panel;
    this.ui.sandboxCutsceneCleanup = () => {
      if (closed) return;
      closed = true;
      restore();
      panel.cleanup();
      this.ui.sandboxCutscenePanel = null;
      this.ui.sandboxCutsceneCleanup = null;
    };
    play();
  }
  openModelLab() {
    if (this.ui.modelLabPanel) {
      this.ui.modelLabCleanup?.();
      return;
    }
    let max = this.mii.personality === 24 ? 255 : 127,
      original = { height: this.mii.height, build: this.mii.build },
      body = this.ui.scene?.bodyModels?.get(this.mii.gender),
      root = body?.model?.scene,
      originalRootScale = root?.scale?.clone(),
      bones = [],
      boneScales = new Map(),
      selectedShape = "classic",
      intensity = 100,
      panel = new Html("div").style({
        position: "absolute", left: "1rem", bottom: "4.5rem",
        width: "min(350px, calc(100vw - 2rem))",
        "max-height": "min(72vh, 620px)", "overflow-y": "auto",
        "box-sizing": "border-box", padding: "14px", display: "flex",
        "flex-direction": "column", gap: "10px", color: "var(--text)",
        background: "var(--container)", border: "1px solid var(--stroke)",
        "border-radius": "12px", "box-shadow": "0 8px 28px #0005", "z-index": "7",
      }),
      heading = new Html("div").text("🧪 Model Lab + Body Studio").style({
        "font-weight": "700", "font-size": "1.05rem",
      }),
      help = new Html("small").text("Ten new tools, including procedural 3D body-model presets. These are reversible previews using the currently loaded rig; separate model files can be added when compatible GLB assets are available."),
      makeButton = (label, callback) => addButtonSounds(
        new Html("button").text(label).style({ width: "100%" }).on("click", callback),
      ),
      section = (label) => new Html("div").text(label).style({
        "font-weight": "700", "padding-top": "5px", "border-bottom": "1px solid var(--stroke)",
      }),
      makeControl = (label, property, value) => {
        let wrapper = new Html("div").style({ display: "flex", "flex-direction": "column", gap: "5px" }),
          caption = new Html("label").text(label + ": " + value),
          input = new Html("input").attr({ type: "range", min: "0", max: String(max), step: "1", value: String(value) }).style({ width: "100%" });
        input.on("input", () => {
          this.mii[property] = Number(input.getValue());
          caption.text(label + ": " + this.mii[property] + "/" + max);
        });
        input.on("change", () => this.render(!0, 0, 1));
        wrapper.appendMany(caption, input);
        return { wrapper, input, caption };
      },
      heightControl = makeControl("Height", "height", this.mii.height),
      buildControl = makeControl("Build", "build", this.mii.build),
      refresh = () => {
        heightControl.input.val(String(this.mii.height));
        buildControl.input.val(String(this.mii.build));
        heightControl.caption.text("Height: " + this.mii.height + "/" + max);
        buildControl.caption.text("Build: " + this.mii.build + "/" + max);
        this.render(!0, 0, 1).then(() => rebindShapeRig()).catch(() => {});
      },
      setPreset = (height, build) => {
        this.mii.height = Math.max(0, Math.min(max, height));
        this.mii.build = Math.max(0, Math.min(max, build));
        refresh();
      },
      shapeSelect = new Html("select").style({
        width: "100%", padding: "8px", "border-radius": "8px",
        background: "var(--background)", color: "var(--text)",
      }),
      shapeLabel = new Html("label").text("Shape intensity: 100%"),
      shapeInput = new Html("input").attr({ type: "range", min: "0", max: "150", step: "1", value: "100" }).style({ width: "100%" }),
      shapeHelp = new Html("small").text("Shape changes are applied to torso/hip bones where available. Unsupported rigs keep their original proportions."),
      slotSelect = new Html("select").style({
        width: "100%", padding: "8px", "border-radius": "8px",
        background: "var(--background)", color: "var(--text)",
      }),
      profileFile = new Html("input").attr({ type: "file", accept: ".json,application/json" }).style({ display: "none" }),
      rigInfo = new Html("small").text("Rig inspector: scanning...").style({ "white-space": "pre-wrap" }),
      shapePresets = [
        ["classic", "Classic body", 1, 1, 1],
        ["sphere", "Round sphere", 1.48, 1.32, 1.48],
        ["capsule", "Tall capsule", 1.12, 1.55, 1.12],
        ["pear", "Pear silhouette", 1.24, 1.08, 1.24],
        ["chibi", "Chibi proportions", 1.3, 1.24, 1.3],
        ["slim", "Streamlined", 0.86, 1.02, 0.86],
        ["broad", "Broad torso", 1.38, 1.05, 1.18],
      ],
      shapeBones = [],
      setShape = (id, amount = intensity) => {
        selectedShape = id;
        intensity = amount;
        let preset = shapePresets.find((item) => item[0] === id) || shapePresets[0],
          blend = Math.max(0, Math.min(1.5, amount / 100));
        for (let item of shapeBones) {
          let bone = item.bone, base = item.base;
          let factorX = preset[2], factorY = preset[3], factorZ = preset[4];
          if (id === "pear" && /hip|pelvis|leg|thigh/i.test(bone.name)) {
            factorX *= 1.22; factorZ *= 1.22;
          }
          if (id === "pear" && /chest|upper|shoulder/i.test(bone.name)) {
            factorX *= 0.9; factorZ *= 0.9;
          }
          bone.scale.set(
            base.x * (1 + (factorX - 1) * blend),
            base.y * (1 + (factorY - 1) * blend),
            base.z * (1 + (factorZ - 1) * blend),
          );
        }
        if (root) root.updateMatrixWorld(!0);
        shapeSelect.val(id);
        shapeInput.val(String(amount));
        shapeLabel.text("Shape intensity: " + amount + "%");
      },
      rebindShapeRig = () => {
        body = this.ui.scene?.bodyModels?.get(this.mii.gender);
        root = body?.model?.scene;
        if (!root) return;
        originalRootScale = root.scale.clone();
        bones = [];
        shapeBones = [];
        root.traverse((object) => {
          if (!object.isBone) return;
          bones.push(object);
          if (/spine|torso|chest|abdomen|waist|hip|pelvis/i.test(object.name))
            shapeBones.push({ bone: object, base: object.scale.clone() });
        });
        setShape(selectedShape, intensity);
      },
      captureProfile = () => ({
        format: "ThePJsMiiCreator.BodyStudio",
        version: 1,
        gender: this.mii.gender,
        height: this.mii.height,
        build: this.mii.build,
        bodyShape: selectedShape,
        intensity,
      }),
      exportProfile = () => {
        let blob = new Blob([JSON.stringify(captureProfile(), null, 2)], { type: "application/json" }),
          url = URL.createObjectURL(blob), link = document.createElement("a");
        link.href = url;
        link.download = (this.mii.nickname.trim() || "Mii") + "-body-studio.json";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      applyProfile = (profile) => {
        if (profile?.format !== "ThePJsMiiCreator.BodyStudio" || !Number.isFinite(Number(profile.height)) ||
            !Number.isFinite(Number(profile.build)) || !shapePresets.some((item) => item[0] === profile.bodyShape))
          throw new Error("This is not a supported Body Studio profile.");
        setPreset(Number(profile.height), Number(profile.build));
        setShape(profile.bodyShape, Math.max(0, Math.min(150, Number(profile.intensity) || 0)));
      },
      actions = new Html("div").style({ display: "grid", "grid-template-columns": "1fr 1fr", gap: "7px" });
    if (root) {
      root.traverse((object) => {
        if (object.isBone) {
          bones.push(object);
          if (/spine|torso|chest|abdomen|waist|hip|pelvis/i.test(object.name)) {
            let base = object.scale.clone();
            boneScales.set(object.name, base);
            shapeBones.push({ bone: object, base });
          }
        }
      });
    }
    for (let [id, label] of shapePresets)
      new Html("option").attr({ value: id }).text(label).appendTo(shapeSelect);
    for (let slot of ["1", "2", "3"])
      new Html("option").attr({ value: slot }).text("Preset slot " + slot).appendTo(slotSelect);
    shapeSelect.on("change", () => setShape(shapeSelect.getValue()));
    shapeInput.on("input", () => setShape(selectedShape, Number(shapeInput.getValue())));
    profileFile.on("change", async () => {
      let file = profileFile.elm.files?.[0];
      if (!file) return;
      try { applyProfile(JSON.parse(await file.text())); Notify.show("Body Studio", "Profile imported."); }
      catch (error) { Notify.show("Import failed", String(error?.message || error)); }
      profileFile.elm.value = "";
    });
    rigInfo.text("Rig inspector: " + bones.length + " bones found\n" +
      (shapeBones.length ? shapeBones.map((item) => item.bone.name).slice(0, 12).join(", ") : "No recognized torso bones; body shape presets may have limited effect."));
    actions.appendMany(
      makeButton("Reset proportions", () => setPreset(original.height, original.build)),
      makeButton("Random proportions", () => setPreset(Math.floor(Math.random() * (max + 1)), Math.floor(Math.random() * (max + 1)))),
      makeButton("Random body shape", () => {
        let pick = shapePresets[Math.floor(Math.random() * shapePresets.length)];
        setShape(pick[0], 65 + Math.floor(Math.random() * 86));
      }),
      makeButton("Reset body shape", () => setShape("classic", 100)),
      makeButton("Save selected slot", () => {
        try { localStorage.setItem("thepjsmiicreator-body-studio-" + this.mii.gender + "-" + slotSelect.getValue(), JSON.stringify(captureProfile())); Notify.show("Body Studio", "Saved to preset slot " + slotSelect.getValue() + "."); }
        catch (error) { Notify.show("Save failed", String(error?.message || error)); }
      }),
      makeButton("Load selected slot", () => {
        try { let saved = localStorage.getItem("thepjsmiicreator-body-studio-" + this.mii.gender + "-" + slotSelect.getValue()); if (!saved) throw new Error("That preset slot is empty."); applyProfile(JSON.parse(saved)); }
        catch (error) { Notify.show("Load failed", String(error?.message || error)); }
      }),
      makeButton("Export body profile", exportProfile),
      makeButton("Import body profile", () => profileFile.elm.click()),
      makeButton("Save 3D screenshot", () => {
        try {
          let canvas = this.ui.scene.getRendererElement(), link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = (this.mii.nickname.trim() || "Mii") + "-body-studio.png";
          document.body.appendChild(link); link.click(); link.remove();
        } catch (error) { Notify.show("Screenshot failed", String(error?.message || error)); }
      }),
      makeButton("Copy rig summary", () => {
        let summary = "ThePJsMiiCreator Body Studio\nBones: " + bones.length + "\nShape bones: " + shapeBones.map((item) => item.bone.name).join(", ");
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(summary).then(() => Notify.show("Body Studio", "Rig summary copied.")).catch(() => Notify.show("Clipboard unavailable", summary));
        else Notify.show("Rig summary", summary);
      }),
      makeButton("Close", () => this.ui.modelLabCleanup?.()),
    );
    panel.appendMany(
      heading, help, section("1 · Proportions"), heightControl.wrapper, buildControl.wrapper,
      section("2 · Procedural 3D body models"), shapeSelect, shapeLabel, shapeInput, shapeHelp,
      section("3 · Six extra tools"), slotSelect, actions, section("Rig inspector"), rigInfo, profileFile,
    );
    this.ui.mii.append(panel);
    this.ui.modelLabPanel = panel;
    this.ui.modelLabCleanup = () => {
      if (root && originalRootScale) root.scale.copy(originalRootScale);
      for (let item of shapeBones) item.bone.scale.copy(item.base);
      root?.updateMatrixWorld(!0);
      panel.cleanup();
      this.ui.modelLabPanel = null;
      this.ui.modelLabCleanup = null;
    };
    setShape("classic", 100);
  }
  openAnimationStudio() {
    if (this.ui.animationStudioPanel) {
      this.ui.animationStudioPanel.cleanup();
      this.ui.animationStudioPanel = null;
      return;
    }
    let scene = this.ui.scene,
      model = scene?.bodyModels?.get(this.mii.gender),
      actions = model?.actions;
    if (!actions || actions.size === 0) {
      Notify.show(
        translate("Animation Studio"),
        translate("Animations are still loading, or this body model has no animations."),
      );
      return;
    }
    let names = Array.from(actions.keys()).map(String),
      selected = names.includes(scene.currentAnim) ? scene.currentAnim : names[0],
      panel = new Html("div").classOn("animation-studio-panel").style({
        position: "absolute",
        top: "4.5rem",
        right: "1rem",
        width: "min(320px, calc(100vw - 2rem))",
        "box-sizing": "border-box",
        padding: "14px",
        display: "flex",
        "flex-direction": "column",
        gap: "10px",
        color: "var(--text)",
        background: "var(--container)",
        border: "1px solid var(--stroke)",
        "border-radius": "12px",
        "box-shadow": "0 8px 28px #0005",
        "z-index": "5",
      }),
      heading = new Html("div").text(translate("Animation Studio")).style({
        "font-weight": "700",
        "font-size": "1.05rem",
      }),
      animationSelect = new Html("select").style({
        width: "100%",
        padding: "8px",
        "border-radius": "8px",
        background: "var(--background)",
        color: "var(--text)",
      }),
      loopLabel = new Html("label").style({ display: "flex", gap: "8px", "align-items": "center" }),
      loopInput = new Html("input").attr({ type: "checkbox", checked: "checked" }),
      speedLabel = new Html("label").text(translate("Playback speed")).style({
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center",
      }),
      speedInput = new Html("input").attr({
        type: "range",
        min: "0.25",
        max: "2",
        step: "0.25",
        value: "1",
      }).style({ width: "100%" }),
      speedValue = new Html("span").text("1×"),
      controls = new Html("div").style({
        display: "flex",
        gap: "8px",
        "flex-wrap": "wrap",
      }),
      makeButton = (label, callback) =>
        addButtonSounds(
          new Html("button")
            .text(label)
            .style({ flex: "1", "min-width": "70px" })
            .on("click", callback),
        ),
      getSelectedAction = () => actions.get(animationSelect.getValue()),
      applySpeed = () => {
        let action = getSelectedAction();
        if (action) action.setEffectiveTimeScale(Number(speedInput.getValue()));
      },
      play = () => {
        let action = getSelectedAction(),
          name = animationSelect.getValue();
        if (!action) return;
        if (scene.currentAnim !== name) scene.swapAnimation(name, !0, !loopInput.elm.checked);
        action.paused = !1;
        action.play();
        setTimeout(applySpeed, 50);
      },
      pause = () => {
        let action = getSelectedAction();
        if (action) action.paused = !0;
      },
      restart = () => {
        let name = animationSelect.getValue();
        if (!name) return;
        scene.swapAnimation(name, !0, !loopInput.elm.checked, 0);
        setTimeout(applySpeed, 50);
      };
    for (let name of names)
      new Html("option").attr({ value: name }).text(name).appendTo(animationSelect);
    animationSelect.val(selected);
    loopLabel.appendMany(loopInput, new Html("span").text(translate("Loop")));
    speedLabel.append(speedValue);
    speedInput.on("input", () => {
      speedValue.text(Number(speedInput.getValue()).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "×");
      applySpeed();
    });
    animationSelect.on("change", () => {
      scene.swapAnimation(animationSelect.getValue(), !1, !loopInput.elm.checked);
      setTimeout(applySpeed, 50);
    });
    loopInput.on("change", () => {
      let action = getSelectedAction();
      if (action) {
        action.loop = loopInput.elm.checked ? 2201 : 2200;
        action.clampWhenFinished = !loopInput.elm.checked;
      }
    });
    controls.appendMany(
      makeButton(translate("Play"), play),
      makeButton(translate("Pause"), pause),
      makeButton(translate("Restart"), restart),
    );
    let close = makeButton(translate("Close"), () => {
      panel.cleanup();
      this.ui.animationStudioPanel = null;
    });
    panel.appendMany(
      heading,
      animationSelect,
      loopLabel,
      speedLabel,
      speedInput,
      controls,
      close,
    );
    (this.ui.mii.append(panel), (this.ui.animationStudioPanel = panel));
  }
  openCustomPoseMaker() {
    if (this.ui.customPoseMakerPanel) {
      this.ui.customPoseMakerPanel.cleanup();
      this.ui.customPoseMakerPanel = null;
      return;
    }
    let scene = this.ui.scene,
      body = scene?.bodyModels?.get(this.mii.gender),
      root = body?.model?.scene,
      skinnedMesh = null;
    if (!root) {
      Notify.show(translate("Custom Pose Maker"), translate("The 3D body model is not ready yet."));
      return;
    }
    root.traverse((object) => {
      if (object.isSkinnedMesh && object.skeleton &&
          (!skinnedMesh || (object.geometry?.attributes?.position?.count || 0) > (skinnedMesh.geometry?.attributes?.position?.count || 0))) {
        skinnedMesh = object;
      }
    });
    let bones = skinnedMesh?.skeleton?.bones || [];
    if (bones.length === 0) {
      Notify.show(translate("Custom Pose Maker"), translate("No editable bones were found in this body model."));
      return;
    }
    let actions = body.actions;
    if (actions) actions.forEach((action) => (action.paused = true));
    let originals = new Map(), originalScales = new Map(), offsets = new Map(),
      translations = new Map(), boneScales = new Map();
    for (let bone of bones) {
      originals.set(bone.name, bone.quaternion.clone());
      originalScales.set(bone.name, bone.scale.clone());
      offsets.set(bone.name, { x: 0, y: 0, z: 0 });
      translations.set(bone.name, { x: 0, y: 0, z: 0 });
      boneScales.set(bone.name, { x: 1, y: 1, z: 1 });
    }
    // Prefer a dedicated abdomen/waist bone; use the lower spine only as a fallback.
    let bellyBone =
      bones.find((bone) => /belly|abdomen|stomach|waist/i.test(bone.name)) ||
      bones.find((bone) => /spine|torso/i.test(bone.name));
    let panel = new Html("div").classOn("custom-pose-maker-panel").style({
        position: "absolute",
        top: "4.5rem",
        left: "1rem",
        width: "min(340px, calc(100vw - 2rem))",
        "max-height": "min(70vh, 560px)",
        "overflow-y": "auto",
        "box-sizing": "border-box",
        padding: "14px",
        display: "flex",
        "flex-direction": "column",
        gap: "10px",
        color: "var(--text)",
        background: "var(--container)",
        border: "1px solid var(--stroke)",
        "border-radius": "12px",
        "box-shadow": "0 8px 28px #0005",
        "z-index": "5",
      }),
      heading = new Html("div").text(translate("Custom Pose Maker")).style({
        "font-weight": "700",
        "font-size": "1.05rem",
      }),
      help = new Html("div").text(translate("Choose a bone and rotate it on each axis. The preview updates live.")).style({
        "font-size": "0.85rem",
        opacity: "0.8",
      }),
      boneSelect = new Html("select").style({
        width: "100%",
        padding: "8px",
        "border-radius": "8px",
        background: "var(--background)",
        color: "var(--text)",
      }),
      axisControls = new Html("div").style({
        display: "flex",
        "flex-direction": "column",
        gap: "9px",
      }),
      makeAxisControl = (axis) => {
        let label = new Html("label").style({
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            gap: "8px",
          }),
          value = new Html("span").text("0°"),
          input = new Html("input").attr({
            type: "range",
            min: "-180",
            max: "180",
            step: "1",
            value: "0",
          }).style({ width: "100%" });
        label.appendMany(new Html("span").text(axis.toUpperCase()), value);
        input.on("input", () => {
          let offset = offsets.get(boneSelect.getValue());
          if (!offset) return;
          offset[axis] = Number(input.getValue());
          value.text(offset[axis] + "°");
          applyBone(boneSelect.getValue());
        });
        return { label, input, value };
      },
      axisX = makeAxisControl("x"),
      axisY = makeAxisControl("y"),
      axisZ = makeAxisControl("z"),
      makeTransformControl = (kind, axis, min, max, step, initial) => {
        const wrap = new Html("label").style({ display: "flex", "flex-direction": "column", gap: "3px", "font-size": "0.8rem" });
        const value = new Html("span").text(kind + " " + axis.toUpperCase() + ": " + initial);
        const input = new Html("input").attr({ type: "range", min: String(min), max: String(max), step: String(step), value: String(initial) }).style({ width: "100%" });
        wrap.appendMany(value, input);
        input.on("input", () => {
          const name = boneSelect.getValue(), values = kind === "Move" ? translations.get(name) : boneScales.get(name);
          if (!values) return;
          values[axis] = Number(input.getValue()); value.text(kind + " " + axis.toUpperCase() + ": " + Number(input.getValue()).toFixed(2)); applyBone(name);
        });
        return { wrap, input, value, kind, axis };
      },
      moveX = makeTransformControl("Move", "x", -2, 2, 0.01, 0), moveY = makeTransformControl("Move", "y", -2, 2, 0.01, 0), moveZ = makeTransformControl("Move", "z", -2, 2, 0.01, 0),
      scaleX = makeTransformControl("Scale", "x", 0.25, 3, 0.01, 1), scaleY = makeTransformControl("Scale", "y", 0.25, 3, 0.01, 1), scaleZ = makeTransformControl("Scale", "z", 0.25, 3, 0.01, 1),
      bellyLabel = new Html("label").style({
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center",
        gap: "8px",
      }),
      bellyValue = new Html("span").text("100%"),
      bellyInput = new Html("input").attr({
        type: "range",
        min: "75",
        max: "150",
        step: "1",
        value: "100",
      }).style({ width: "100%" }),
      bellyVertexData = null,
      applyBelly = () => {
        if (!bellyVertexData) {
          bellyValue.text("Unavailable for this body model");
          return;
        }
        const amount = Number(bellyInput.getValue()) / 100;
        const attribute = bellyVertexData.attribute, original = bellyVertexData.original, profile = bellyVertexData.profile;
        for (let index = 0; index < profile.length; index++) {
          const i = index * 3, x = original[i], y = original[i + 1], z = original[i + 2];
          const side = z >= bellyVertexData.centerZ ? 1 : -1;
          const expansion = (amount - 1) * bellyVertexData.depth * profile[index];
          const widthExpansion = (amount - 1) * bellyVertexData.width * profile[index] * 0.42;
          // Expand around the abdomen on both horizontal axes. The body meshes
          // use different forward-axis conventions, so avoid a one-sided mask.
          attribute.setXYZ(index,
            x + (x - bellyVertexData.centerX) * (amount - 1) * profile[index] * 0.55,
            y,
            z + side * expansion + Math.sign(z - bellyVertexData.centerZ || 1) * widthExpansion);
        }
        attribute.needsUpdate = true;
        bellyVertexData.geometry.computeVertexNormals();
        bellyVertexData.geometry.computeBoundingSphere();
        if (bellyBone) applyBone(bellyBone.name);
        bellyValue.text(Math.round(amount * 100) + "% · abdomen only");
      },
      applyBone = (name) => {
        let bone = bones.find((item) => item.name === name),
          offset = offsets.get(name),
          base = originals.get(name);
        if (!bone || !offset || !base) return;
        let delta = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            offset.x * THREE.MathUtils.DEG2RAD,
            offset.y * THREE.MathUtils.DEG2RAD,
            offset.z * THREE.MathUtils.DEG2RAD,
            bone.rotation.order,
          ),
        );
        bone.quaternion.copy(base).multiply(delta);
        const move = translations.get(name) || { x: 0, y: 0, z: 0 }, size = boneScales.get(name) || { x: 1, y: 1, z: 1 };
        const position = basePositions.get(name), scale = originalScales.get(name);
        const bellyFactor = bone === bellyBone ? 1 + (Number(bellyInput.getValue()) / 100 - 1) * 0.32 : 1;
        if (position) bone.position.set(position.x + move.x, position.y + move.y, position.z + move.z);
        if (scale) bone.scale.set(scale.x * size.x * bellyFactor, scale.y * size.y, scale.z * size.z * bellyFactor);
        bone.updateMatrixWorld(!0);
      },
      updateControls = () => {
        let offset = offsets.get(boneSelect.getValue()) || { x: 0, y: 0, z: 0 };
        for (let [control, axis] of [[axisX, "x"], [axisY, "y"], [axisZ, "z"]]) {
          control.input.val(String(offset[axis])); control.value.text(offset[axis] + "°");
        }
        const move = translations.get(boneSelect.getValue()) || { x: 0, y: 0, z: 0 }, scale = boneScales.get(boneSelect.getValue()) || { x: 1, y: 1, z: 1 };
        for (const control of [moveX, moveY, moveZ, scaleX, scaleY, scaleZ]) {
          const amount = control.kind === "Move" ? move[control.axis] : scale[control.axis];
          control.input.val(String(amount)); control.value.text(control.kind + " " + control.axis.toUpperCase() + ": " + Number(amount).toFixed(2));
        }
      },
      resetCurrent = () => {
        offsets.set(boneSelect.getValue(), { x: 0, y: 0, z: 0 });
        translations.set(boneSelect.getValue(), { x: 0, y: 0, z: 0 }); boneScales.set(boneSelect.getValue(), { x: 1, y: 1, z: 1 });
        applyBone(boneSelect.getValue());
        updateControls();
      },
      resetAll = () => {
        for (let bone of bones) {
          offsets.set(bone.name, { x: 0, y: 0, z: 0 });
          translations.set(bone.name, { x: 0, y: 0, z: 0 }); boneScales.set(bone.name, { x: 1, y: 1, z: 1 });
          bone.quaternion.copy(originals.get(bone.name));
          bone.position.copy(basePositions.get(bone.name));
          bone.scale.copy(originalScales.get(bone.name));
          bone.updateMatrixWorld(!0);
        }
        bellyInput.val("100");
        applyBelly();
        updateControls();
      },
      exportPose = () => {
        let pose = {
          format: "ThePJsMiiCreator.CustomPose",
          version: 1,
          bodyModel: scene.bodyModel,
          gender: this.mii.gender,
          bellySize: Number(bellyInput.getValue()),
          bones: Object.fromEntries(
            bones.map((bone) => [bone.name, { rotation: { ...offsets.get(bone.name) }, position: { ...translations.get(bone.name) }, scale: { ...boneScales.get(bone.name) } }]).filter(([, value]) => Object.values(value.rotation).some(Boolean) || Object.values(value.position).some(Boolean) || Object.values(value.scale).some((amount) => amount !== 1)),
          ),
        };
        let blob = new Blob([JSON.stringify(pose, null, 2)], { type: "application/json" }),
          url = URL.createObjectURL(blob),
          link = document.createElement("a");
        link.href = url;
        link.download = (this.mii.nickname.trim() || "Mii") + "-custom-pose.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      importPose = async (file) => {
        try {
          let pose = JSON.parse(await file.text());
          if (pose?.format !== "ThePJsMiiCreator.CustomPose" || !pose.bones || typeof pose.bones !== "object")
            throw new Error("This file is not a supported Custom Pose JSON.");
          resetAll();
          for (let [name, value] of Object.entries(pose.bones)) {
            if (!offsets.has(name) || !value) continue;
            const rotation = value.rotation || value, position = value.position || { x: 0, y: 0, z: 0 }, scale = value.scale || { x: 1, y: 1, z: 1 };
            if (![...["x","y","z"].map((axis) => rotation[axis] ?? 0), ...["x","y","z"].map((axis) => position[axis] ?? 0), ...["x","y","z"].map((axis) => scale[axis] ?? 1)].every((amount) => Number.isFinite(Number(amount)))) continue;
            offsets.set(name, { x: Math.max(-180, Math.min(180, Number(rotation.x) || 0)), y: Math.max(-180, Math.min(180, Number(rotation.y) || 0)), z: Math.max(-180, Math.min(180, Number(rotation.z) || 0)) });
            translations.set(name, { x: Math.max(-2, Math.min(2, Number(position.x) || 0)), y: Math.max(-2, Math.min(2, Number(position.y) || 0)), z: Math.max(-2, Math.min(2, Number(position.z) || 0)) });
            boneScales.set(name, { x: Math.max(0.25, Math.min(3, Number(scale.x ?? 1))), y: Math.max(0.25, Math.min(3, Number(scale.y ?? 1))), z: Math.max(0.25, Math.min(3, Number(scale.z ?? 1))) });
            applyBone(name);
          }
          if (bellyBone && Number.isFinite(Number(pose.bellySize))) {
            bellyInput.val(String(Math.max(75, Math.min(150, Number(pose.bellySize)))));
            applyBelly();
          }
          updateControls();
          Notify.show(translate("Custom Pose Maker"), "Pose imported successfully.");
        } catch (error) {
          Notify.show(translate("Import failed"), String(error?.message || error));
        }
      },
      fileInput = new Html("input").attr({ type: "file", accept: ".json,application/json" }).style({ display: "none" }),
      savePreset = () => {
        try {
          let pose = {
            format: "ThePJsMiiCreator.CustomPose",
            version: 1,
            bodyModel: scene.bodyModel,
            gender: this.mii.gender,
            bellySize: Number(bellyInput.getValue()),
            bones: Object.fromEntries(
              bones.map((bone) => [bone.name, { rotation: { ...offsets.get(bone.name) }, position: { ...translations.get(bone.name) }, scale: { ...boneScales.get(bone.name) } }]).filter(([, value]) => Object.values(value.rotation).some(Boolean) || Object.values(value.position).some(Boolean) || Object.values(value.scale).some((amount) => amount !== 1)),
            ),
          };
          localStorage.setItem("thepjsmiicreator-pose-" + this.mii.gender, JSON.stringify(pose));
          Notify.show(translate("Custom Pose Maker"), "Pose preset saved in this browser.");
        } catch (error) {
          Notify.show(translate("Save failed"), String(error?.message || error));
        }
      },
      loadPreset = () => {
        try {
          let saved = localStorage.getItem("thepjsmiicreator-pose-" + this.mii.gender);
          if (!saved) {
            Notify.show(translate("Custom Pose Maker"), "No saved pose preset was found in this browser.");
            return;
          }
          importPose(new Blob([saved], { type: "application/json" }));
        } catch (error) {
          Notify.show(translate("Load failed"), String(error?.message || error));
        }
      },
      makeButton = (label, callback) =>
        addButtonSounds(
          new Html("button").text(label).style({ width: "100%" }).on("click", callback),
        );
    let keyframes = [],
      rootScale = root.scale.clone(),
      squashLabel = new Html("label").text("Squash / stretch: 100%"),
      squashInput = new Html("input").attr({ type: "range", min: "70", max: "140", step: "1", value: "100" }).style({ width: "100%" }),
      timelineLabel = new Html("div").text("Motion timeline · 0 keyframes"),
      timelineInput = new Html("input").attr({ type: "range", min: "0", max: "1000", step: "1", value: "0" }).style({ width: "100%" }),
      captureFrame = () => Object.fromEntries(Array.from(offsets.entries()).map(([name, rotation]) => [name, {
        rotation: { ...rotation }, position: { ...(translations.get(name) || { x: 0, y: 0, z: 0 }) },
        scale: { ...(boneScales.get(name) || { x: 1, y: 1, z: 1 }) },
      }])),
      applyFrame = (frame) => {
        for (let bone of bones) {
          const value = frame?.[bone.name] || { rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
          const rotation = value.rotation || value;
          offsets.set(bone.name, { x: Number(rotation.x) || 0, y: Number(rotation.y) || 0, z: Number(rotation.z) || 0 });
          translations.set(bone.name, { x: Number(value.position?.x) || 0, y: Number(value.position?.y) || 0, z: Number(value.position?.z) || 0 });
          boneScales.set(bone.name, { x: Number(value.scale?.x ?? 1), y: Number(value.scale?.y ?? 1), z: Number(value.scale?.z ?? 1) });
          applyBone(bone.name);
        }
        updateControls();
      },
      updateTimeline = () => {
        timelineLabel.text("Timeline · " + keyframes.length + " keyframes · " + timelineFps + " FPS");
        timelineInput.attr({ max: String(Math.max(10000, (keyframes.length ? keyframes[keyframes.length - 1].time + 10 : 10) * 1000)) });
        if (timelineRuler) {
          timelineRuler.elm.replaceChildren();
          for (const item of keyframes) {
            const marker = new Html("button").text("◆").attr({ type: "button", title: "Go to frame " + (item.time + 1) })
              .style({ flex: "0 0 28px", minWidth: "28px", padding: "4px", color: "#f5c542", background: "transparent", border: "0", cursor: "pointer" })
              .on("click", () => { timelineInput.val(String(item.time * 1000)); sampleTimeline(item.time); updateTimelineReadout(); });
            timelineRuler.append(marker);
          }
          if (!keyframes.length) timelineRuler.append(new Html("span").text("No keyframes yet — add one to begin.").style({ opacity: "0.7", "font-size": "0.8rem" }));
        }
      },
      mirrorPose = () => {
        let source = captureFrame(), mirrored = {};
        for (let [name, value] of Object.entries(source)) {
          let other = name
            .replace(/Left/g, "__SIDE__").replace(/Right/g, "Left").replace(/__SIDE__/g, "Right")
            .replace(/_L\b/g, "__SIDE__").replace(/_R\b/g, "_L").replace(/__SIDE__/g, "_R")
            .replace(/\.L\b/g, "__SIDE__").replace(/\.R\b/g, ".L").replace(/__SIDE__/g, ".R");
          mirrored[offsets.has(other) ? other : name] = {
            rotation: { x: value.rotation.x, y: -value.rotation.y, z: -value.rotation.z },
            position: { x: -value.position.x, y: value.position.y, z: value.position.z },
            scale: { ...value.scale },
          };
        }
        applyFrame(mirrored);
      },
      sampleTimeline = (position) => {
        if (!keyframes.length) return;
        const first = keyframes[0].time, last = keyframes[keyframes.length - 1].time;
        const framePosition = Math.max(first, Math.min(last, position));
        let left = 0, right = keyframes.length - 1;
        for (let index = 0; index < keyframes.length - 1; index++) {
          if (keyframes[index].time <= framePosition && keyframes[index + 1].time >= framePosition) { left = index; right = index + 1; break; }
        }
        if (framePosition <= first) right = left = 0;
        if (framePosition >= last) left = right = keyframes.length - 1;
        const span = keyframes[right].time - keyframes[left].time;
        const blend = span > 0 ? (framePosition - keyframes[left].time) / span : 0;
        const a = keyframes[left].pose, b = keyframes[right].pose, result = {};
        for (let bone of bones) {
          let av = a[bone.name] || { rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
          let bv = b[bone.name] || { rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
          const blendAxis = (key, fallback) => ({
            x: (av[key]?.x ?? fallback) + ((bv[key]?.x ?? fallback) - (av[key]?.x ?? fallback)) * blend,
            y: (av[key]?.y ?? fallback) + ((bv[key]?.y ?? fallback) - (av[key]?.y ?? fallback)) * blend,
            z: (av[key]?.z ?? fallback) + ((bv[key]?.z ?? fallback) - (av[key]?.z ?? fallback)) * blend,
          });
          result[bone.name] = { rotation: blendAxis("rotation", 0), position: blendAxis("position", 0), scale: blendAxis("scale", 1) };
        }
        applyFrame(result);
      },
      addKeyframe = () => {
        const frame = Math.max(0, Math.round(Number(timelineInput.getValue()) / 1000));
        const existing = keyframes.findIndex((item) => item.time === frame);
        if (existing >= 0) keyframes[existing].pose = captureFrame();
        else keyframes.push({ time: frame, pose: captureFrame() });
        keyframes.sort((a, b) => a.time - b.time);
        updateTimeline();
        timelineInput.val(String(frame * 1000));
        sampleTimeline(frame);
        updateTimelineReadout();
      },
      exportMotionClip = () => {
        if (!keyframes.length) return Notify.show("Motion Timeline", "Add at least one keyframe first.");
        let clip = { format: "ThePJsMiiCreator.MotionClip", version: 1, gender: this.mii.gender, bodyModel: scene.bodyModel, fps: 30, keyframes },
          url = URL.createObjectURL(new Blob([JSON.stringify(clip, null, 2)], { type: "application/json" })),
          link = document.createElement("a");
        link.href = url; link.download = (this.mii.nickname.trim() || "Mii") + "-motion-clip.json";
        document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

    let importedAnimation = null, importedAnimationRaf = 0, importedAnimationStart = 0;
    let poseTimelineRaf = 0, poseTimelineStart = 0, poseTimelineStartFrame = 0;
    const timelineFps = 30;
    const timelineFrameLabel = new Html("div").text("Frame 1 · 00:00").style({ "font-size": "0.82rem", "font-variant-numeric": "tabular-nums" });
    const timelineRuler = new Html("div").style({ display: "flex", gap: "4px", "align-items": "center", "min-height": "34px", padding: "6px", overflowX: "auto", background: "var(--background)", border: "1px solid var(--stroke)", "border-radius": "7px" });
    const updateTimelineReadout = () => {
      const frame = Math.max(0, Number(timelineInput.getValue()) / 1000);
      timelineFrameLabel.text("Frame " + (Math.floor(frame) + 1) + " · " + (frame / timelineFps).toFixed(2) + "s");
    };
    const stopPoseTimeline = () => { if (poseTimelineRaf) cancelAnimationFrame(poseTimelineRaf); poseTimelineRaf = 0; };
    const playPoseTimeline = () => {
      if (keyframes.length < 2) return Notify.show("Timeline", "Add at least two keyframes to play an animation.");
      stopPoseTimeline();
      poseTimelineStartFrame = Number(timelineInput.getValue()) / 1000;
      poseTimelineStart = performance.now();
      const endFrame = keyframes[keyframes.length - 1].time;
      const tick = (now) => {
        const frame = poseTimelineStartFrame + (now - poseTimelineStart) / 1000 * timelineFps;
        if (frame >= endFrame) {
          timelineInput.val(String(endFrame * 1000)); sampleTimeline(endFrame); updateTimelineReadout(); stopPoseTimeline(); return;
        }
        timelineInput.val(String(frame * 1000)); sampleTimeline(frame); updateTimelineReadout();
        poseTimelineRaf = requestAnimationFrame(tick);
      };
      poseTimelineRaf = requestAnimationFrame(tick);
    };
    const deleteTimelineKeyframe = () => {
      if (!keyframes.length) return;
      const frame = Math.round(Number(timelineInput.getValue()) / 1000);
      let index = keyframes.reduce((best, item, i) => Math.abs(item.time - frame) < Math.abs(keyframes[best].time - frame) ? i : best, 0);
      keyframes.splice(index, 1);
      keyframes.forEach((item, i) => item.time = i);
      updateTimeline(); timelineInput.val(String(Math.min(frame, Math.max(0, keyframes.length - 1)) * 1000));
      if (keyframes.length) sampleTimeline(Number(timelineInput.getValue()) / 1000);
      updateTimelineReadout();
    };
    const basePositions = new Map(bones.map((bone) => [bone.name, bone.position.clone()]));
    if (bellyBone && skinnedMesh?.geometry?.attributes?.position) {
      // Clone first: the cached source body model must not be permanently modified.
      skinnedMesh.geometry = skinnedMesh.geometry.clone();
      const geometry = skinnedMesh.geometry, attribute = geometry.attributes.position;
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox, height = Math.max(0.001, bounds.max.y - bounds.min.y);
      const centerX = (bounds.min.x + bounds.max.x) / 2;
      const centerY = bounds.min.y + height * 0.59;
      const centerZ = (bounds.min.z + bounds.max.z) / 2;
      const radiusX = Math.max(0.001, (bounds.max.x - bounds.min.x) * 0.34);
      const radiusY = height * 0.17;
      const depth = Math.max(0.01, (bounds.max.z - bounds.min.z) * 0.30);
      const original = Array.from(attribute.array);
      const profile = new Float32Array(attribute.count);
      for (let index = 0; index < attribute.count; index++) {
        const x = attribute.getX(index), y = attribute.getY(index), z = attribute.getZ(index);
        const vertical = (y - centerY) / radiusY, horizontal = (x - centerX) / radiusX;
        const verticalFalloff = Math.exp(-0.5 * vertical * vertical);
        const horizontalFalloff = Math.exp(-0.5 * horizontal * horizontal);
        // No front/back gate: some body models face -Z, others +Z.
        profile[index] = verticalFalloff * horizontalFalloff;
      }
      bellyVertexData = {
        geometry, attribute, original, profile, depth, centerX, centerZ,
        width: Math.max(0.01, bounds.max.x - bounds.min.x),
      };
    }
    const boneAliases = [
      ["skl_root", ["sklroot","root","bodyroot"]], ["hip", ["hip","hips","pelvis"]],
      ["chest", ["chest","spine","torso"]], ["head", ["head","neckhead"]],
      ["arm_l1", ["arml1","leftupperarm","upperarml","upperarmleft","lupperarm"]],
      ["arm_l2", ["arml2","leftforearm","forearml","forearmleft","lowerarml"]],
      ["wrist_l", ["wristl","lefthand","handl","handleft"]],
      ["arm_r1", ["armr1","rightupperarm","upperarmr","upperarmright","rupperarm"]],
      ["arm_r2", ["armr2","rightforearm","forearmr","forearmright","lowerarmr"]],
      ["wrist_r", ["wristr","righthand","handr","handright"]],
      ["foot_l1", ["footl1","leftthigh","thighl","upperlegl","leftupperleg"]],
      ["foot_l2", ["footl2","leftshin","shinl","lowerlegl","leftlowerleg"]],
      ["ankle_l", ["anklel","leftfoot","footl","leftankle"]],
      ["foot_r1", ["footr1","rightthigh","thighr","upperlegr","rightupperleg"]],
      ["foot_r2", ["footr2","rightshin","shinr","lowerlegr","rightlowerleg"]],
      ["ankle_r", ["ankler","rightfoot","footr","rightankle"]]
    ];
    const normalizeBoneName = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const findClipBone = (index) => {
      const names = boneAliases[index]?.[1] || [];
      return bones.find((bone) => names.includes(normalizeBoneName(bone.name)))?.name || null;
    };

    const ikLimbDefinitions = [
      { label: "Left arm", upper: 4, lower: 5, end: 6 },
      { label: "Right arm", upper: 7, lower: 8, end: 9 },
      { label: "Left leg", upper: 10, lower: 11, end: 12 },
      { label: "Right leg", upper: 13, lower: 14, end: 15 }
    ];
    const ikBaseTargets = new Map();
    root.updateMatrixWorld(!0);
    for (let limb of ikLimbDefinitions) {
      const endName = findClipBone(limb.end), endBone = bones.find((bone) => bone.name === endName);
      if (endBone) { const point = new THREE.Vector3(); endBone.getWorldPosition(point); ikBaseTargets.set(limb.label, point); }
    }
    const ikSelect = new Html("select").style({ width: "100%", padding: "7px", "border-radius": "8px", background: "var(--background)", color: "var(--text)" });
    for (let limb of ikLimbDefinitions) new Html("option").attr({ value: limb.label }).text(limb.label).appendTo(ikSelect);
    const makeIkAxis = (label, min, max) => {
      const wrap = new Html("label").style({ display: "flex", "flex-direction": "column", gap: "3px", "font-size": "0.82rem" });
      const title = new Html("span").text(label + ": 0");
      const input = new Html("input").attr({ type: "range", min: String(min), max: String(max), step: "1", value: "0" }).style({ width: "100%" });
      wrap.appendMany(title, input);
      return { wrap, title, input, label };
    };
    const ikX = makeIkAxis("Target X", -80, 80), ikY = makeIkAxis("Target Y", -80, 80), ikZ = makeIkAxis("Target Z", -80, 80), ikSwivel = makeIkAxis("Elbow / knee swivel", -180, 180);
    const ikStatus = new Html("div").text("Choose a limb and move its target sliders to solve a two-bone IK pose.").style({ "font-size": "0.78rem", opacity: "0.85", "white-space": "pre-wrap" });
    const applyIkTarget = () => {
      try {
        const limb = ikLimbDefinitions.find((item) => item.label === ikSelect.getValue()) || ikLimbDefinitions[0];
        const upperName = findClipBone(limb.upper), lowerName = findClipBone(limb.lower), endName = findClipBone(limb.end);
        const upper = bones.find((bone) => bone.name === upperName), lower = bones.find((bone) => bone.name === lowerName), end = bones.find((bone) => bone.name === endName);
        const baseTarget = ikBaseTargets.get(limb.label);
        if (!upper || !lower || !end || !baseTarget) throw new Error("This body model does not expose the complete " + limb.label.toLowerCase() + " bone chain.");
        applyBone(upper.name); applyBone(lower.name); root.updateMatrixWorld(!0);
        const target = baseTarget.clone().add(new THREE.Vector3(Number(ikX.input.getValue()), Number(ikY.input.getValue()), Number(ikZ.input.getValue())));
        const result = window.PJMiiIK.solveTwoBoneIK(THREE, root, upper, lower, end, target, Number(ikSwivel.input.getValue()), 150);
        ikStatus.text((result.clamped ? "Target clamped to reachable range. " : "Target reachable. ") + "End error: " + result.error.toFixed(2) + " units.");
      } catch (error) { ikStatus.text("IK unavailable: " + String(error?.message || error)); }
    };
    for (const control of [ikX, ikY, ikZ, ikSwivel]) control.input.on("input", () => {
      control.title.text(control.label + ": " + control.input.getValue());
      applyIkTarget();
    });
    ikSelect.on("change", () => {
      for (const control of [ikX, ikY, ikZ, ikSwivel]) control.input.val("0");
      for (const control of [ikX, ikY, ikZ, ikSwivel]) control.title.text(control.label + ": 0");
      applyIkTarget();
    });
    const ikPanel = new Html("div").style({ display: "flex", "flex-direction": "column", gap: "6px", padding: "9px", border: "1px solid var(--stroke)", "border-radius": "9px" });
    ikPanel.appendMany(new Html("div").text("🦴 Two-bone IK · MiiPy-inspired").style({ "font-weight": "700" }), ikSelect, ikX.wrap, ikY.wrap, ikZ.wrap, ikSwivel.wrap, ikStatus,
      makeButton("Reset IK target", () => {
        for (const control of [ikX, ikY, ikZ, ikSwivel]) { control.input.val("0"); control.title.text(control.title.elm.textContent.split(":")[0] + ": 0"); }
        applyIkTarget();
      }));

    const stopImportedClip = (restore = false) => {
      if (importedAnimationRaf) cancelAnimationFrame(importedAnimationRaf);
      importedAnimationRaf = 0;
      if (restore) {
        for (let bone of bones) {
          offsets.set(bone.name, { x: 0, y: 0, z: 0 });
          translations.set(bone.name, { x: 0, y: 0, z: 0 }); boneScales.set(bone.name, { x: 1, y: 1, z: 1 });
          bone.quaternion.copy(originals.get(bone.name));
          bone.position.copy(basePositions.get(bone.name));
          bone.scale.copy(originalScales.get(bone.name));
          bone.updateMatrixWorld(!0);
        }
        updateControls();
      }
    };
    const applyImportedAnimationFrame = (frame) => {
      const values = new Map();
      for (let bone of bones) {
        offsets.set(bone.name, { x: 0, y: 0, z: 0 });
        bone.position.copy(basePositions.get(bone.name));
        bone.scale.copy(originalScales.get(bone.name));
      }
      for (let track of importedAnimation.tracks) {
        if (track.target !== "bone" || track.index >= 16 || !track.keys.length) continue;
        const boneName = findClipBone(track.index);
        if (!boneName) continue;
        const value = window.PJMiiAnimationFormat.evaluateCurve(track.keys, frame);
        const item = values.get(boneName) || { rotation: { x: 0, y: 0, z: 0 }, position: {}, scale: {} };
        if (track.channel >= 3 && track.channel <= 5) item.rotation[["x","y","z"][track.channel - 3]] = value;
        else if (track.channel >= 0 && track.channel <= 2) item.position[["x","y","z"][track.channel]] = value;
        else if (track.channel >= 6 && track.channel <= 8) item.scale[["x","y","z"][track.channel - 6]] = value;
        values.set(boneName, item);
      }
      for (let [boneName, item] of values) {
        offsets.set(boneName, item.rotation);
        const bone = bones.find((candidate) => candidate.name === boneName);
        if (!bone) continue;
        const basePosition = basePositions.get(boneName), baseScale = originalScales.get(boneName);
        bone.position.set(basePosition.x + (item.position.x || 0), basePosition.y + (item.position.y || 0), basePosition.z + (item.position.z || 0));
        bone.scale.set(baseScale.x * (item.scale.x ?? 1), baseScale.y * (item.scale.y ?? 1), baseScale.z * (item.scale.z ?? 1));
        applyBone(boneName);
      }
      updateControls();
      root.updateMatrixWorld(!0);
    };
    const playImportedClip = () => {
      if (!importedAnimation) return Notify.show("MiiAnimator Clip", "Import a .miianim file first.");
      stopImportedClip(false);
      importedAnimationStart = performance.now();
      const tick = (now) => {
        if (!importedAnimation) return;
        const frame = ((now - importedAnimationStart) / 1000 * Math.max(1, importedAnimation.fps)) % Math.max(1, importedAnimation.length);
        applyImportedAnimationFrame(frame);
        importedAnimationRaf = requestAnimationFrame(tick);
      };
      importedAnimationRaf = requestAnimationFrame(tick);
      animationStatus.text("▶ Playing " + importedAnimation.name + " · " + importedAnimation.fps + " FPS");
    };
    const miianimInput = new Html("input").attr({ type: "file", accept: ".miianim,application/octet-stream" }).style({ display: "none" });
    const animationStatus = new Html("div").text("No .miianim clip loaded.").style({ "font-size": "0.8rem", opacity: "0.85", "white-space": "pre-wrap" });
    miianimInput.on("change", async () => {
      const file = miianimInput.elm.files?.[0]; miianimInput.elm.value = "";
      if (!file) return;
      try {
        stopImportedClip(true);
        importedAnimation = window.PJMiiAnimationFormat.parse(await file.arrayBuffer());
        const matched = new Set(importedAnimation.tracks.filter((track) => track.target === "bone").map((track) => findClipBone(track.index)).filter(Boolean));
        animationStatus.text("✓ " + importedAnimation.name + "\\n" + importedAnimation.tracks.length + " tracks · " + importedAnimation.length + " frames · " + importedAnimation.fps + " FPS\\n" + matched.size + "/16 rig bones matched. IK, facial-expression and particle tracks are not applied in this preview.");
        Notify.show("MiiAnimator Clip", "Animation imported. Press Play imported clip to preview.");
      } catch (error) {
        importedAnimation = null; animationStatus.text("Import failed: " + String(error?.message || error));
        Notify.show("MiiAnimator Clip", String(error?.message || error));
      }
    });

    squashInput.on("input", () => {
      let amount = Number(squashInput.getValue()) / 100;
      root.scale.set(rootScale.x / Math.sqrt(amount), rootScale.y * amount, rootScale.z / Math.sqrt(amount));
      squashLabel.text("Squash / stretch: " + Math.round(amount * 100) + "%");
    });
    timelineInput.on("input", () => { stopPoseTimeline(); sampleTimeline(Number(timelineInput.getValue()) / 1000); updateTimelineReadout(); });
    for (let index = 0; index < bones.length; index++)
      new Html("option")
        .attr({ value: bones[index].name })
        .text(bones[index].name || "Bone " + index)
        .appendTo(boneSelect);
    boneSelect.on("change", updateControls);
    fileInput.on("change", () => {
      let file = fileInput.elm.files?.[0];
      if (file) importPose(file);
      fileInput.elm.value = "";
    });
    bellyLabel.appendMany(new Html("span").text(translate("Belly size")), bellyValue);
    bellyInput.on("input", applyBelly);
    let buttons = new Html("div").style({
      display: "grid",
      "grid-template-columns": "1fr 1fr",
      gap: "8px",
    });
    buttons.appendMany(
      makeButton(translate("Reset bone"), resetCurrent),
      makeButton(translate("Reset all"), resetAll),
      makeButton("Save preset", savePreset),
      makeButton("Load preset", loadPreset),
      makeButton("Import pose JSON", () => fileInput.elm.click()),
      makeButton(translate("Export pose JSON"), exportPose),
      makeButton("🪞 Mirror pose", mirrorPose),
      makeButton(translate("Close"), () => {
        stopPoseTimeline();
        stopImportedClip(false);
        importedAnimation = null;
        for (let bone of bones) {
          bone.quaternion.copy(originals.get(bone.name));
          bone.position.copy(basePositions.get(bone.name));
          bone.scale.copy(originalScales.get(bone.name));
          bone.updateMatrixWorld(!0);
        }
        root.scale.copy(rootScale);
        if (bellyVertexData) {
          for (let index = 0; index < bellyVertexData.profile.length; index++) {
            const i = index * 3, a = bellyVertexData.attribute;
            a.setXYZ(index, bellyVertexData.original[i], bellyVertexData.original[i + 1], bellyVertexData.original[i + 2]);
          }
          bellyVertexData.attribute.needsUpdate = true;
          bellyVertexData.geometry.computeVertexNormals();
          bellyVertexData.geometry.computeBoundingSphere();
        }
        root.updateMatrixWorld(!0);
        panel.cleanup();
        this.ui.customPoseMakerPanel = null;
      }),
    );
    axisControls.appendMany(axisX.label, axisX.input, axisY.label, axisY.input, axisZ.label, axisZ.input);
    const transformControls = new Html("div").style({ display: "grid", "grid-template-columns": "1fr 1fr", gap: "7px", padding: "8px", border: "1px solid var(--stroke)", "border-radius": "8px" });
    transformControls.append(new Html("div").text("↔ Move bone (local units)").style({ "font-weight": "700", "grid-column": "1 / -1" }), moveX.wrap, moveY.wrap, moveZ.wrap,
      new Html("div").text("⤢ Resize bone").style({ "font-weight": "700", "grid-column": "1 / -1" }), scaleX.wrap, scaleY.wrap, scaleZ.wrap);
    const tabBar = new Html("div").style({ display: "grid", "grid-template-columns": "1fr 1fr", gap: "6px", padding: "4px", background: "var(--background)", border: "1px solid var(--stroke)", "border-radius": "9px" });
    const boneTab = new Html("div").style({ display: "flex", "flex-direction": "column", gap: "9px" });
    const timelineTab = new Html("div").style({ display: "none", "flex-direction": "column", gap: "9px" });
    const setPoseTab = (active) => {
      const isTimeline = active === "timeline";
      boneTab.style({ display: isTimeline ? "none" : "flex" });
      timelineTab.style({ display: isTimeline ? "flex" : "none" });
      poseTabButton.classOff("primary"); timelineTabButton.classOff("primary");
      (isTimeline ? timelineTabButton : poseTabButton).classOn("primary");
    };
    const poseTabButton = makeButton("🦴 Pose & Bones", () => setPoseTab("pose"));
    const timelineTabButton = makeButton("🎞 Timeline", () => setPoseTab("timeline"));
    tabBar.appendMany(poseTabButton, timelineTabButton);
    boneTab.appendMany(boneSelect, axisControls, transformControls, fileInput, ikPanel, squashLabel, squashInput);
    if (bellyBone) boneTab.appendMany(bellyLabel, bellyInput);
    boneTab.append(buttons);
    const timelineButtons = new Html("div").style({ display: "grid", "grid-template-columns": "1fr 1fr", gap: "7px" });
    timelineButtons.appendMany(
      makeButton("＋ Add keyframe", addKeyframe),
      makeButton("− Delete nearest keyframe", deleteTimelineKeyframe),
      makeButton("▶ Play timeline", playPoseTimeline),
      makeButton("■ Stop timeline", stopPoseTimeline),
      makeButton("📤 Export motion clip", exportMotionClip),
      makeButton("🧹 Clear timeline", () => { stopPoseTimeline(); keyframes = []; updateTimeline(); timelineInput.val("0"); updateTimelineReadout(); }),
      makeButton("🎞 Import .miianim", () => miianimInput.elm.click()),
      makeButton("▶ Play imported clip", playImportedClip),
      makeButton("■ Stop imported clip", () => { stopImportedClip(false); animationStatus.text(importedAnimation ? "Clip loaded: " + importedAnimation.name : "No .miianim clip loaded."); }),
    );
    timelineTab.appendMany(
      new Html("div").text("Animation Timeline").style({ "font-weight": "700", "font-size": "1rem" }),
      new Html("div").text("Blender-style keyframe workflow · 30 FPS · drag the playhead or select a diamond to scrub."),
      timelineLabel, timelineFrameLabel, timelineRuler, timelineInput, timelineButtons, miianimInput, animationStatus,
    );
    panel.appendMany(heading, help, tabBar, boneTab, timelineTab);
    this.ui.mii.append(panel);
    this.ui.customPoseMakerPanel = panel;
    updateControls(); updateTimeline(); updateTimelineReadout();
  }
  unlockSecret(id, title, message) {
    if (this.secretUnlocks.has(id)) return;
    this.secretUnlocks.add(id);
    try {
      localStorage.setItem("thepjsmiicreator-secrets", JSON.stringify([...this.secretUnlocks]));
    } catch {}
    if (this.ui?.secretVaultButton) {
      this.ui.secretVaultButton.style({ display: "block" });
      this.ui.secretVaultButton.text("🔓 Secret Vault (" + this.secretUnlocks.size + ")");
    }
    Notify.show("✨ " + title, message);
  }
  openExpressionCreator() {
    if (this.ui.expressionCreatorPanel) {
      this.ui.expressionCreatorPanel.cleanup();
      this.ui.expressionCreatorPanel = null;
      return;
    }
    const panel = new Html("div").style({
      position: "absolute", top: "4.5rem", right: "1rem",
      width: "min(410px, calc(100vw - 2rem))", "max-height": "80vh",
      overflow: "auto", padding: "14px", display: "flex",
      "flex-direction": "column", gap: "9px", color: "var(--text)",
      background: "var(--container)", border: "1px solid var(--stroke)",
      "border-radius": "12px", "z-index": "7",
    });
    const title = new Html("div").text("🎭 Expression & Asset Studio").style({ "font-weight": "700" });
    const note = new Html("div").text("Create expressions with the native Custom Render catalogue or build your own face from Mii eyebrow, eye and mouth assets. Both types share one local preset library.").style({ "font-size": "0.82rem", opacity: "0.85" });
    const key = "thepjsmiicreator-expression-presets-v2";
    const nativeExpressions = [
      ["Normal",0],["Smile",1],["Anger",2],["Sorrow",3],["Surprise",4],["Blink",5],
      ["Normal (open mouth)",6],["Smile (open mouth)",7],["Anger (open mouth)",8],["Sorrow (open mouth)",9],
      ["Surprise (open mouth)",10],["Blink (open mouth)",11],["Wink (left eye open)",12],["Wink (right eye open)",13],
      ["Wink (left eye and mouth open)",14],["Wink (right eye and mouth open)",15],["Wink (left eye open and smiling)",16],
      ["Wink (right eye open and smiling)",17],["Frustrated",18],["Bored",19],["Bored open mouth",20],
      ["Sigh mouth straight",21],["Sigh",22],["Disgusted mouth straight",23],["Disgusted",24],["Love",25],
      ["Love mouth open",26],["Determined mouth straight",27],["Determined",28],["Cry mouth straight",29],["Cry",30],
      ["Big smile mouth straight",31],["Big smile",32],["Cheeky",33],["Cheeky (mirror)",34],
      ["Resolve eyes funny mouth",35],["Resolve eyes funny mouth open",36],["Smug",37],["Smug mouth open",38],
      ["Resolve",39],["Resolve mouth open",40],["Unbelievable",41],["Cunning",43],["Raspberry",45],
      ["Innocent",47],["Innocent (mirror)",48],["Cat",49],["Dog",51],["Tasty",53],
      ["Money mouth straight",55],["Money",56],["Confused mouth straight",57],["Confused",58],
      ["Cheerful mouth straight",59],["Cheerful",60],["Blank",61],["Grumble mouth straight",63],["Grumble",64],
      ["Moved mouth straight",65],["Moved (pleading face)",66],["Singing mouth small",67],["Singing",68],
      ["Stunned",69],["Demotivated",70],["Cunning (alternate)",71],["Full",72],["Sleepy",73],
      ["Sleepy (right eye open)",74],["Confused (alternate)",75],["Woozy",76],["Wink (Joy)",77],
      ["Wink (Joy, mirrored)",78],["Uninterested",79],["Mischievous",80],["Mad",81],
    ];
    const fields = {
      eyebrowType: { label: "Eyebrow asset", max: 23 },
      eyeType: { label: "Eye asset", max: 59 },
      mouthType: { label: "Mouth asset", max: 35 },
      eyebrowRotate: { label: "Eyebrow rotation", max: 31 },
      eyeRotate: { label: "Eye rotation", max: 31 },
      mouthY: { label: "Mouth vertical position", max: 31 },
      eyeY: { label: "Eye vertical position", max: 31 },
      eyebrowY: { label: "Eyebrow vertical position", max: 31 },
    };
    const original = Object.fromEntries(Object.keys(fields).map(field => [field, Number(this.mii[field]) || 0]));
    const status = new Html("div").text("Choose a mode, then preview or save your expression.").style({ "font-size": "0.8rem", "white-space": "pre-wrap" });
    const mode = new Html("select").style({ width: "100%", padding: "8px", color: "var(--text)", background: "var(--background)" });
    new Html("option").attr({ value: "native" }).text("Native Custom Render expression").appendTo(mode);
    new Html("option").attr({ value: "custom" }).text("Custom face-part assets").appendTo(mode);
    const nativeSelect = new Html("select").style({ width: "100%", padding: "8px", color: "var(--text)", background: "var(--background)" });
    for (const [label, id] of nativeExpressions) new Html("option").attr({ value: String(id) }).text(label + " · " + id).appendTo(nativeSelect);
    const nativeWrap = new Html("div").style({ display: "flex", "flex-direction": "column", gap: "4px" });
    nativeWrap.append(new Html("label").text("Native expression catalogue"), nativeSelect);
    const assetWrap = new Html("div").style({ display: "none", "flex-direction": "column", gap: "7px" });
    const controls = {};
    for (const [field, config] of Object.entries(fields)) {
      const wrap = new Html("label").style({ display: "flex", "flex-direction": "column", gap: "4px", "font-size": "0.85rem" });
      wrap.append(new Html("span").text(config.label));
      const select = new Html("select").style({ width: "100%", padding: "7px", color: "var(--text)", background: "var(--background)" });
      for (let value = 0; value <= config.max; value++)
        new Html("option").attr({ value: String(value) }).text("Asset " + value).appendTo(select);
      select.val(String(original[field]));
      controls[field] = select;
      wrap.append(select);
      assetWrap.append(wrap);
    }
    const modeChanged = () => {
      const custom = mode.getValue() === "custom";
      nativeWrap.style({ display: custom ? "none" : "flex" });
      assetWrap.style({ display: custom ? "flex" : "none" });
    };
    mode.on("change", modeChanged);
    const name = new Html("input").attr({ type: "text", maxlength: "40", placeholder: "Name this expression…" }).style({ width: "100%", padding: "8px", "box-sizing": "border-box" });
    const saved = new Html("select").style({ width: "100%", padding: "8px", color: "var(--text)", background: "var(--background)" });
    const button = (label, callback) => addButtonSounds(new Html("button").text(label).style({ width: "100%" }).on("click", callback));
    const values = () => Object.fromEntries(Object.entries(controls).map(([field, select]) => [field, Number(select.getValue())]));
    const read = () => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data.filter(item => {
          if (!item || typeof item.name !== "string") return false;
          if (item.mode === "native") return nativeExpressions.some(([, id]) => id === Number(item.nativeExpression));
          return item.assets && Object.entries(fields).every(([field, config]) =>
            Number.isInteger(item.assets[field]) && item.assets[field] >= 0 && item.assets[field] <= config.max);
        }) : [];
      } catch { return []; }
    };
    let presets = read();
    const current = () => mode.getValue() === "native"
      ? { mode: "native", nativeExpression: Number(nativeSelect.getValue()) }
      : { mode: "custom", assets: values() };
    const apply = async (preset) => {
      if (preset.mode === "native") {
        status.text("Native expression selected: " + (nativeExpressions.find(([, id]) => id === Number(preset.nativeExpression))?.[0] || preset.nativeExpression) + ". Apply it in Custom Render to use the native FFL expression renderer.");
        return;
      }
      for (const [field, value] of Object.entries(preset.assets || {})) {
        if (fields[field]) this.mii[field] = Math.max(0, Math.min(fields[field].max, Number(value) || 0));
      }
      await this.render(true, 0, 1);
    };
    const refresh = () => {
      saved.elm.replaceChildren();
      new Html("option").attr({ value: "" }).text("Saved expressions…").appendTo(saved);
      presets.forEach((preset, index) => new Html("option").attr({ value: String(index) }).text((preset.mode === "native" ? "FFL · " : "Assets · ") + preset.name).appendTo(saved));
    };
    const save = () => {
      const label = name.getValue().trim();
      if (!label) return Notify.show("Expression Studio", "Give this expression a name first.");
      const data = current();
      const preset = { ...data, name: label.slice(0, 40), version: 3, createdAt: new Date().toISOString() };
      presets.push(preset);
      try {
        presets = presets.slice(-100);
        localStorage.setItem(key, JSON.stringify(presets));
        refresh();
        status.text("Saved " + preset.name + " (" + (preset.mode === "native" ? "native FFL" : "custom assets") + ") to this browser.");
      } catch (error) {
        presets.pop();
        Notify.show("Save failed", String(error?.message || error));
      }
    };
    const exportCustom = () => {
      const data = current();
      const payload = { format: "ThePJsMiiCreator.ExpressionDAT", version: 3, name: name.getValue().trim() || "Custom Expression", ...data };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/octet-stream" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = (payload.name.replace(/[^a-z0-9_-]+/gi, "_") || "expression") + ".dat";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.text("Exported PJ Expression .dat (version 3 custom format).");
    };
    const exportMii = () => {
      try {
        const bytes = this.mii.export("switchCharInfo");
        const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = (this.mii.nickname || "mii").replace(/[^a-z0-9_-]+/gi, "_") + "_switch-charinfo.dat";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.text("Exported Nintendo Switch CharInfo data. This is a Mii file, not a PJ expression file.");
      } catch (error) { Notify.show("Mii DAT export failed", String(error?.message || error)); }
    };
    const importInput = new Html("input").attr({ type: "file", accept: ".dat,.json,application/json" }).style({ display: "none" });
    importInput.on("change", async () => {
      const file = importInput.elm.files?.[0];
      importInput.elm.value = "";
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data?.format !== "ThePJsMiiCreator.ExpressionDAT" || ![2,3].includes(data.version))
          throw Error("Unsupported PJ Expression .dat file. Nintendo Mii CharInfo files are not expression presets.");
        let preset;
        if (data.mode === "native" || (data.version === 3 && Number.isInteger(data.nativeExpression))) {
          if (!nativeExpressions.some(([, id]) => id === Number(data.nativeExpression))) throw Error("Unknown native FFL expression ID.");
          preset = { mode: "native", nativeExpression: Number(data.nativeExpression) };
          mode.val("native"); nativeSelect.val(String(preset.nativeExpression));
        } else {
          const assets = data.assets || {};
          if (!Object.entries(fields).every(([field, config]) => Number.isInteger(assets[field]) && assets[field] >= 0 && assets[field] <= config.max))
            throw Error("The custom asset data is incomplete or outside the supported ranges.");
          preset = { mode: "custom", assets };
          mode.val("custom");
          for (const [field, select] of Object.entries(controls)) select.val(String(assets[field]));
        }
        modeChanged();
        name.val(String(data.name || "Imported expression"));
        await apply(preset);
        status.text("Imported " + (data.name || "expression") + ".");
      } catch (error) { Notify.show("Expression import failed", String(error?.message || error)); }
    });
    saved.on("change", async () => {
      const preset = presets[Number(saved.getValue())];
      if (!preset) return;
      name.val(preset.name);
      mode.val(preset.mode === "native" ? "native" : "custom");
      modeChanged();
      if (preset.mode === "native") nativeSelect.val(String(preset.nativeExpression));
      else for (const [field, select] of Object.entries(controls)) select.val(String(preset.assets[field]));
      await apply(preset);
    });
    panel.appendMany(
      title, note,
      new Html("div").text("Expression type").style({ "font-weight": "700" }),
      mode, nativeWrap, assetWrap,
      new Html("div").text("Shared expression library").style({ "font-weight": "700" }),
      name, button("＋ Save expression", save), saved,
      button("👁 Preview custom assets on Mii", () => {
        if (mode.getValue() !== "custom") return status.text("Native FFL expressions are applied in Custom Render, where the native expression renderer is available.");
        apply(current());
      }),
      button("📤 Export PJ Expression .dat", exportCustom),
      button("📥 Import PJ Expression .dat", () => importInput.elm.click()),
      button("🧬 Export Nintendo Mii CharInfo .dat", exportMii),
      importInput, status,
      button("Restore original face", () => apply({ mode: "custom", assets: original })),
      button("Close", () => {
        panel.cleanup();
        this.ui.expressionCreatorPanel = null;
        apply({ mode: "custom", assets: original });
      }),
    );
    this.ui.mii.append(panel);
    this.ui.expressionCreatorPanel = panel;
    refresh();
    modeChanged();
  }
  openSecretVault() {
    if (this.ui.secretVaultPanel) {
      this.ui.secretVaultPanel.cleanup();
      this.ui.secretVaultPanel = null;
      return;
    }
    let descriptions = {
        konami: ["Konami Code", "Enter the classic up, up, down, down, left, right, left, right, B, A sequence."],
        pj912: ["PJ912", "Type PJ912 anywhere in the editor (not inside a text field)."],
        "lucky-seven": ["Lucky Seven", "Click the 3D Mii viewer seven times."],
      },
      panel = new Html("div").style({
        position: "absolute",
        top: "7rem",
        right: "1rem",
        width: "min(300px, calc(100vw - 2rem))",
        padding: "14px",
        display: "flex",
        "flex-direction": "column",
        gap: "9px",
        color: "var(--text)",
        background: "var(--container)",
        border: "1px solid var(--stroke)",
        "border-radius": "12px",
        "box-shadow": "0 8px 28px #0005",
        "z-index": "6",
      }),
      heading = new Html("div").text("✨ Secret Vault").style({ "font-weight": "700" }),
      close = addButtonSounds(new Html("button").text(translate("Close")).on("click", () => {
        panel.cleanup();
        this.ui.secretVaultPanel = null;
      }));
    panel.append(heading);
    for (let [id, [title, hint]] of Object.entries(descriptions)) {
      let unlocked = this.secretUnlocks.has(id);
      panel.append(
        new Html("div")
          .text((unlocked ? "🔓 " + title : "🔒 ???") + (unlocked ? " — " + hint : " — undiscovered"))
          .style({ "font-size": "0.9rem", opacity: unlocked ? "1" : "0.65" }),
      );
    }
    panel.append(close);
    this.ui.mii.append(panel);
    this.ui.secretVaultPanel = panel;
  }
  #g;
  get shaderType() {
    return this.#g;
  }
  async #u() {
    if (this.ui) {
      if (this.ui.scene) this.#g = this.ui.scene.shaderType;
    }
    let e = COMMON_COLORS_HEX[this.mii.glassColor],
      t = COMMON_COLORS_HEX[this.mii.eyeColor],
      r = { top: COMMON_COLORS_SHADOW_HEX[this.mii.mouthColor], bottom: COMMON_COLORS_HEX[this.mii.mouthColor] },
      n = (p) => "rgb(" + p.map((g) => g * 255).join(",") + ")",
      i = n(this.mii.getHatPrimaryColor()),
      o = n(id(this.mii.favoriteColor, this.mii.hatFavoriteColor, this.mii.hatCommonColor)[0]),
      s = n(this.mii.getHatSecondaryColor(!0)),
      a = n(adjustLightness(this.mii.getHatSecondaryColor(!0), -0.15)),
      l = this.mii.hatSecondaryColor !== -1 ? s : "#fff",
      c = this.mii.hatSecondaryColor !== -1 ? a : "#ccc",
      u = n(this.mii.getHatTertiaryColor(!0)),
      d = n(adjustLightness(this.mii.getHatTertiaryColor(), -0.15)),
      h = this.mii.hatTertiaryColor !== -1 ? u : "#8B4F00",
      f = this.mii.hatTertiaryColor !== -1 ? d : "#582900";
    if (
      (this.ui.base.attr({
        "data-hair-flip": this.mii.hairFlip ? "yes" : "no",
        "data-tab-num": this.#p,
      }),
      this.useAccessibility)
    )
      this.ui.base.style({
        "--eye-color": "#787880",
        "--icon-lip-color-top": "#780c0c",
        "--icon-lip-color-bottom": "#f00c08",
        "--icon-hair-tie": "#" + FAVORITE_COLORS_INT[this.mii.favoriteColor].toString(16).padStart(6, "0"),
        "--icon-eyebrow-fill": "var(--text)",
        "--icon-hair-fill": "var(--text)",
        "--icon-hair-tip": "var(--stroke)",
        "--icon-facial-hair-fill": "#9b9b9b",
        "--icon-hat-fill": FAVORITE_COLOR_GRADIENTS[0].top,
        "--icon-hat-stroke": FAVORITE_COLOR_GRADIENTS[0].bottom,
        "--icon-custom-hat-fill": i,
        "--icon-custom-hat-stroke": o,
        "--icon-custom-hat-secondary": s,
        "--icon-custom-hat-secondary-stroke": a,
        "--icon-custom-hat-tertiary": u,
        "--icon-custom-hat-tertiary-stroke": d,
        "--icon-custom-hat-quaternary": l,
        "--icon-custom-hat-quaternary-stroke": c,
        "--icon-custom-hat-quinary": h,
        "--icon-custom-hat-quinary-stroke": f,
        "--icon-glasses-fill": "#787880",
        "--icon-glasses-shade": "#78788077",
      });
    else
      this.ui.base.style({
        "--eye-color": t,
        "--icon-lip-color-top": r.top,
        "--icon-lip-color-bottom": r.bottom,
        "--icon-hair-tie": "#" + FAVORITE_COLORS_INT[this.mii.favoriteColor].toString(16).padStart(6, "0"),
        "--icon-eyebrow-fill": COMMON_COLORS_HEX[this.mii.eyebrowColor],
        "--icon-hair-fill": COMMON_COLORS_HEX[this.mii.hairColor],
        "--icon-hair-tip": COMMON_COLORS_HEX[this.mii.hairTipColor],
        "--icon-facial-hair-fill": COMMON_COLORS_HEX[this.mii.beardColor],
        "--icon-hat-fill": FAVORITE_COLOR_GRADIENTS[0].top,
        "--icon-hat-stroke": FAVORITE_COLOR_GRADIENTS[0].bottom,
        "--icon-custom-hat-fill": i,
        "--icon-custom-hat-stroke": o,
        "--icon-custom-hat-secondary": s,
        "--icon-custom-hat-secondary-stroke": a,
        "--icon-custom-hat-tertiary": u,
        "--icon-custom-hat-tertiary-stroke": d,
        "--icon-custom-hat-quaternary": l,
        "--icon-custom-hat-quaternary-stroke": c,
        "--icon-custom-hat-quinary": h,
        "--icon-custom-hat-quinary-stroke": f,
        "--icon-glasses-fill": e,
        "--icon-glasses-shade": e + "77",
      });
    if (this.eyeScleraToggle) this.eyeScleraToggle.style({ display: "none" });
    if (this.hairFlipToggle) this.hairFlipToggle.style({ display: "none" });
    if (this.#p === 1) {
      if (m7[this.mii.hairType] === 0) this.hairFlipToggle.style({ display: "flex" });
    } else if (this.#p === 3 && (this.mii.personality === 24 || this.mii.eyeColor !== 8)) {
      if (this.eyeScleraToggle) this.eyeScleraToggle.style({ display: "flex" });
    }
  }
  #p = 0;
  #a;
  callTab(e) {
    if (!this.#a[e]) return;
    (this.ui.tabContent.clear(), this.#a[e](this.ui.tabContent));
  }
  onChangeTab = /*@__PURE__*/ new Map();
  #h() {
    this.#a = [];
    let e = 0,
      t = (n, i, o) => {
        let s = async (a) => {
          if (this.ui.scene) this.ui.scene.focusCamera(o);
          if (
            ((this.#p = n),
            this.#u(),
            await Promise.all(Array.from(this.onChangeTab.values()).map((l) => l(this.#p))),
            await i({
              container: a,
              callback: (l, c, u, d) => {
                ((this.mii = l), (editorMii = l), this.render(c, u, d), this.#u(), (this.dirty = !0));
              },
              icons: this.icons,
              mii: this.mii,
              editor: this,
              useAccessibility: this.useAccessibility,
              editLimits: this.editLimits,
            }),
            this.ui.scene)
          )
            this.ui.scene.resize();
        };
        return ((this.#a[e] = s), e++, s);
      },
      r = createTabList([
        { icon: SVG_ICONS.head, select: t(TAB_FACE, faceTab, 0) },
        { icon: SVG_ICONS.hair, select: t(TAB_HAIR, hairTab, 0) },
        { icon: SVG_ICONS.eyebrows, select: t(TAB_EYEBROWS, eyebrowsTab, 0) },
        { icon: SVG_ICONS.eyes, select: t(TAB_EYES, eyesTab, 0) },
        { icon: SVG_ICONS.nose, select: t(TAB_NOSE, noseTab, 0) },
        { icon: SVG_ICONS.mouth, select: t(TAB_MOUTH, mouthTab, 0) },
        { icon: SVG_ICONS.facialHair, select: t(TAB_BEARD, beardTab, 0) },
        { icon: SVG_ICONS.mole, select: t(TAB_MOLE, moleTab, 0) },
        { icon: SVG_ICONS.glasses, select: t(TAB_GLASSES, glassesTab, 0) },
        { icon: SVG_ICONS.scale, select: t(TAB_SCALE, scaleTab, 2) },
        this.editLimits === "miic" ? { icon: SVG_ICONS.hat, select: t(TAB_HAT, hatTab, 0) } : void 0,
        this.editLimits === "miic" ? { icon: SVG_ICONS.clothes, select: t(TAB_OUTFIT, outfitTab, 1) } : void 0,
        this.editLimits === "miic" ? { icon: SVG_ICONS.accessory, select: t(TAB_ACCESSORY, accessoryTab, 1) } : void 0,
        { icon: SVG_ICONS.details, select: t(TAB_PROFILE, profileTab, 1) },
        {
          icon: SVG_ICONS.save + `<span>${translate("Save")}</span>`,
          type: "tab-save",
          select: () => {
            if (this.dirty === !0)
              Modal.modal(
                translate("Save Mii"),
                translate("Would you like to save?"),
                "body",
                {
                  text: translate("Save & Exit"),
                  callback: () => {
                    this.shutdown();
                  },
                  type: "primary",
                },
                ...(this.#e
                  ? [
                      {
                        text: translate("Exit without Saving"),
                        callback: () => {
                          this.shutdown(!1);
                        },
                      },
                    ]
                  : []),
                { text: "Cancel" },
              );
            else
              Modal.modal(
                translate("Quitting Editor"),
                translate("No changes were made. Are you sure you want to exit?"),
                "body",
                {
                  text: translate("Save & Exit"),
                  callback: () => {
                    this.shutdown();
                  },
                },
                { text: "Cancel" },
                ...(this.#e
                  ? [
                      {
                        text: translate("Exit without Saving"),
                        callback: () => {
                          this.shutdown(!1);
                        },
                      },
                    ]
                  : []),
              );
          },
          update: !1,
        },
      ]);
    ((this.ui.tabList = r.list),
      (this.ui.tabContent = r.content),
      this.ui.base.appendMany(r.list, r.content));
  }
  async render(e = !0, t = 0, r) {
    this.#u();
    var n;
    try {
      n = this.mii.verify();
    } catch (i) {
      if (n) {
        if (!n.valid)
          n.reasons.forEach((o) => {
            this.mii[o.prop] = createDefaultMiicFields()[o.prop];
          });
      }
    }
    if (this.ui.mii.qs("canvas.scene") === null) await this.#s();
    if (
      (this.ui.mii.qs("canvas.scene")?.style({ display: "block" }),
      (this.ui.scene.mii = this.mii),
      t === 2)
    ) {
      if ((await this.ui.scene.updateBody(r), r === 1)) await this.ui.scene.updateBody(1);
      this.ui.scene.resize();
    } else if (e) {
      if (r === 1) this.ui.scene.needsClothingUpdate = !0;
      if ((await this.ui.scene.updateMiiHead(t), r !== 0)) await this.ui.scene.updateBody(r);
      if (r === 1)
        setTimeout(() => {
          this.ui.scene.updateBody(1);
        }, 13.33);
      (this.ui.scene.sparkle(), this.ui.scene.resize());
    }
  }
  #l() {
    (this.ui.mii.qs("button").classOn("disabled"),
      this.ui.tabList.classOn("disabled"),
      this.ui.tabContent.classOn("disabled"));
  }
  enableUI() {
    (this.ui.mii.qs("button").classOff("disabled"),
      this.ui.tabList.classOff("disabled"),
      this.ui.tabContent.classOff("disabled"));
  }
  async shutdown(e = !0, t = !0) {
    if (this.secretKeyHandler) document.removeEventListener("keydown", this.secretKeyHandler);
    if (this.ui?.secretVaultPanel) this.ui.secretVaultPanel.cleanup();
    if (this.ui?.sandboxPanel) this.ui.sandboxPanel.cleanup();
    if (this.ui?.sandboxCutsceneCleanup) this.ui.sandboxCutsceneCleanup();
    if (this.ui?.secretVaultButton) this.ui.secretVaultButton.cleanup();
    if ((document.removeEventListener("pointerdown", dG), this.#o)) this.#o();
    if (e) {
      if (Array.from(this.errors.values()).find((r) => r.valid === !1)) {
        let r = [];
        for (let n of this.errors.values()) if (n.valid === !1) r.push(n.reason);
        Modal.alert(
          translate("Notice"),
          translate("You need to fix the following issues before you can save:") +
            `

` +
            r.map((n) => `• ${n}`).join(`
`),
        );
        return;
      }
      (await new Promise((r, n) => {
        (this.#l(),
          this.ui.scene.playEndingAnimation(),
          setTimeout(() => {
            r(null);
          }, 1500));
      }),
        await fetch("/api/archive", {
          body: JSON.stringify({
            nickname: this.mii.nickname,
            creator: this.mii.creator,
            ffsd: this.mii.exportBase64("ffsd"),
            data: this.mii.exportBase64("miic"),
            studio: this.mii.exportBase64("studioData"),
          }),
          method: "POST",
          headers: { "content-type": "application/json" },
        }).catch(void 0));
    }
    if (this.#c) clearInterval(this.#c);
    (this.ui.base.classOn("closing"),
      setTimeout(() => {
        if (this.ui.scene) this.ui.scene.shutdown();
        if ((this.ui.base.cleanup(), t)) {
          if (this.onShutdown) this.onShutdown(bytesToBase64(this.mii.export("miic")), e);
        }
        (document.dispatchEvent(new CustomEvent("editor-shutdown")),
          (window.editor = null),
          (g9 = null));
      }, 500));
  }
}
