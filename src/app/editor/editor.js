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
  openModelLab() {
    if (this.ui.modelLabPanel) {
      this.ui.modelLabPanel.cleanup();
      this.ui.modelLabPanel = null;
      return;
    }
    let max = this.mii.personality === 24 ? 255 : 127,
      original = { height: this.mii.height, build: this.mii.build },
      panel = new Html("div").style({
        position: "absolute",
        left: "1rem",
        bottom: "4.5rem",
        width: "min(320px, calc(100vw - 2rem))",
        "max-height": "min(65vh, 520px)",
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
        "z-index": "7",
      }),
      heading = new Html("div").text("🧪 Model Lab").style({
        "font-weight": "700",
        "font-size": "1.05rem",
      }),
      help = new Html("small").text("Adjust the Mii's body proportions. Changes preview in the 3D viewer."),
      makeControl = (label, property, value) => {
        let wrapper = new Html("div").style({ display: "flex", "flex-direction": "column", gap: "5px" }),
          caption = new Html("label").text(label + ": " + value),
          input = new Html("input").attr({
            type: "range",
            min: "0",
            max: String(max),
            step: "1",
            value: String(value),
          }).style({ width: "100%" });
        input.on("input", () => {
          this.mii[property] = Number(input.getValue());
          caption.text(label + ": " + this.mii[property] + "/" + max);
        });
        input.on("change", () => this.render(!0, 0, 1));
        wrapper.appendMany(caption, input);
        return { wrapper, input, caption, property };
      },
      heightControl = makeControl("Height", "height", this.mii.height),
      buildControl = makeControl("Build", "build", this.mii.build),
      refresh = () => {
        heightControl.input.val(String(this.mii.height));
        buildControl.input.val(String(this.mii.build));
        heightControl.caption.text("Height: " + this.mii.height + "/" + max);
        buildControl.caption.text("Build: " + this.mii.build + "/" + max);
        this.render(!0, 0, 1);
      },
      setPreset = (height, build) => {
        this.mii.height = Math.max(0, Math.min(max, height));
        this.mii.build = Math.max(0, Math.min(max, build));
        refresh();
      },
      presetGrid = new Html("div").style({
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "7px",
      }),
      makeButton = (label, callback) =>
        addButtonSounds(new Html("button").text(label).style({ width: "100%" }).on("click", callback));
    for (let [label, height, build] of [
      ["Balanced", 64, 64],
      ["Short", 28, 55],
      ["Tall", 105, 55],
      ["Compact", 55, 100],
      ["Slim build", 64, 25],
      ["Broad build", 64, 110],
    ]) {
      presetGrid.append(makeButton(label, () => setPreset(height, build)));
    }
    let actions = new Html("div").style({
      display: "grid",
      "grid-template-columns": "1fr 1fr",
      gap: "7px",
    });
    actions.appendMany(
      makeButton("Reset", () => setPreset(original.height, original.build)),
      makeButton("Randomize", () => setPreset(
        Math.floor(Math.random() * (max + 1)),
        Math.floor(Math.random() * (max + 1)),
      )),
      makeButton("Save preset", () => {
        try {
          localStorage.setItem("thepjsmiicreator-model-" + this.mii.gender,
            JSON.stringify({ height: this.mii.height, build: this.mii.build }));
          Notify.show("Model Lab", "Model preset saved in this browser.");
        } catch (error) {
          Notify.show("Save failed", String(error?.message || error));
        }
      }),
      makeButton("Load preset", () => {
        try {
          let saved = JSON.parse(localStorage.getItem("thepjsmiicreator-model-" + this.mii.gender) || "null");
          if (!saved || !Number.isFinite(Number(saved.height)) || !Number.isFinite(Number(saved.build))) {
            Notify.show("Model Lab", "No valid model preset was found in this browser.");
            return;
          }
          setPreset(Number(saved.height), Number(saved.build));
        } catch (error) {
          Notify.show("Load failed", String(error?.message || error));
        }
      }),
      makeButton("Export model JSON", () => {
        let blob = new Blob([JSON.stringify({
          format: "ThePJsMiiCreator.ModelPreset",
          version: 1,
          gender: this.mii.gender,
          height: this.mii.height,
          build: this.mii.build,
        }, null, 2)], { type: "application/json" }),
          url = URL.createObjectURL(blob),
          link = document.createElement("a");
        link.href = url;
        link.download = (this.mii.nickname.trim() || "Mii") + "-model-preset.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }),
      makeButton("Close", () => {
        panel.cleanup();
        this.ui.modelLabPanel = null;
      }),
    );
    panel.appendMany(heading, help, heightControl.wrapper, buildControl.wrapper, presetGrid, actions);
    this.ui.mii.append(panel);
    this.ui.modelLabPanel = panel;
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
      if (!skinnedMesh && object.isSkinnedMesh && object.skeleton) skinnedMesh = object;
    });
    let bones = skinnedMesh?.skeleton?.bones || [];
    if (bones.length === 0) {
      Notify.show(translate("Custom Pose Maker"), translate("No editable bones were found in this body model."));
      return;
    }
    let actions = body.actions;
    if (actions) actions.forEach((action) => (action.paused = true));
    let originals = new Map(),
      originalScales = new Map(),
      offsets = new Map();
    for (let bone of bones) {
      originals.set(bone.name, bone.quaternion.clone());
      originalScales.set(bone.name, bone.scale.clone());
      offsets.set(bone.name, { x: 0, y: 0, z: 0 });
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
      applyBelly = () => {
        if (!bellyBone) return;
        let amount = Number(bellyInput.getValue()) / 100,
          base = originalScales.get(bellyBone.name);
        bellyBone.scale.set(base.x * amount, base.y, base.z * amount);
        bellyBone.updateMatrixWorld(!0);
        bellyValue.text(Math.round(amount * 100) + "%");
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
        bone.updateMatrixWorld(!0);
      },
      updateControls = () => {
        let offset = offsets.get(boneSelect.getValue()) || { x: 0, y: 0, z: 0 };
        for (let [control, axis] of [[axisX, "x"], [axisY, "y"], [axisZ, "z"]]) {
          control.input.val(String(offset[axis]));
          control.value.text(offset[axis] + "°");
        }
      },
      resetCurrent = () => {
        offsets.set(boneSelect.getValue(), { x: 0, y: 0, z: 0 });
        applyBone(boneSelect.getValue());
        updateControls();
      },
      resetAll = () => {
        for (let bone of bones) {
          offsets.set(bone.name, { x: 0, y: 0, z: 0 });
          bone.quaternion.copy(originals.get(bone.name));
          bone.scale.copy(originalScales.get(bone.name));
          bone.updateMatrixWorld(!0);
        }
        bellyInput.val("100");
        bellyValue.text("100%");
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
            Array.from(offsets.entries()).filter(([, value]) => value.x || value.y || value.z),
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
            if (!offsets.has(name) || !value || !["x", "y", "z"].every((axis) => Number.isFinite(Number(value[axis] ?? 0))))
              continue;
            offsets.set(name, {
              x: Math.max(-180, Math.min(180, Number(value.x) || 0)),
              y: Math.max(-180, Math.min(180, Number(value.y) || 0)),
              z: Math.max(-180, Math.min(180, Number(value.z) || 0)),
            });
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
              Array.from(offsets.entries()).filter(([, value]) => value.x || value.y || value.z),
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
      makeButton(translate("Close"), () => {
        for (let bone of bones) {
          bone.quaternion.copy(originals.get(bone.name));
          bone.scale.copy(originalScales.get(bone.name));
          bone.updateMatrixWorld(!0);
        }
        panel.cleanup();
        this.ui.customPoseMakerPanel = null;
      }),
    );
    axisControls.appendMany(axisX.label, axisX.input, axisY.label, axisY.input, axisZ.label, axisZ.input);
    panel.appendMany(heading, help, boneSelect, axisControls, fileInput);
    if (bellyBone) panel.appendMany(bellyLabel, bellyInput);
    panel.append(buttons);
    this.ui.mii.append(panel);
    this.ui.customPoseMakerPanel = panel;
    updateControls();
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
