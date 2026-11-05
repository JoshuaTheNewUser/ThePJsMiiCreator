// src/app/renderer/mii-viewer.js
// MiiViewer: the live 3D view in the editor (camera, animation, body).
//
// Defines: MiiViewer
// Uses from other files:
//   app/shaders/shader-registry.js: applyShaderMaterial, shaderUsesFFLParams,
//                                   getShaderMaterialClass, getCurrentShaderType, addDefaultLights,
//                                   getLightSetupForShader, removeLights
//   app/assets/models.js: getBodyModels, getHatModels, getHatTextures, getAccessoryModels,
//                         getAccessoryTextures, getDefaultBodyModelName, getOutfitTextureCache
//   app/mii/colors.js: FAVORITE_COLORS_INT, COMMON_COLORS_RGB, SKIN_COLORS_RGB, CA, v0
//   app/renderer/outfits.js: loadOutfitTextures, px, isGhostMii
//   app/audio/sound-effects.js: getSoundEffects, playSound
//   app/mii/formats/charinfo.js: getAlternatePaletteRGB, S0
//   app/renderer/dispose.js: ResourceTracker, disposeObject
//   app/renderer/ffl/face-builder.js: COMMON_COLOR_TABLE, toFFLCharInfo
//   app/renderer/texture-compositing.js: dx, hx
//   app/export/model-export-utils.js: XD, Bb
//   app/ui/html.js: Html
//   app/settings/palette-flags.js: isAlternatePaletteEnabled
//   … and 14 more files

class MiiViewer {
  #t;
  #e;
  #n;
  #i;
  #r;
  #o;
  #c;
  charModel;
  mii;
  ready;
  headReady;
  mixer;
  animators;
  setupType;
  #A;
  type;
  shaderOverride;
  bodyModel;
  bodyModels = /*@__PURE__*/ new Map();
  handColor;
  shaderType;
  editor;
  camSetup;
  texResolution;
  scaleFactors;
  animateAction;
  animateRef = [];
  stopAnimating = !1;
  clock;
  animate(e) {
    if (this.stopAnimating || JE) {
      for (let r of this.animateRef) cancelAnimationFrame(r);
      return;
    }
    let t = this.clock.getDelta();
    try {
      this.#o.render(this.#r, this.#t);
    } catch (r) {}
    (this.animators.forEach(function (r) {
      r(e, t);
    }),
      (this.animateRef[0] = requestAnimationFrame(this.animateAction)));
  }
  #m = !1;
  #f = !1;
  constructor(e, t, r = 0, n, i = !1, o) {
    if (
      ((this.animators = /*@__PURE__*/ new Map()),
      (this.#c = t),
      (this.#r = new THREE.Scene()),
      (this.#t = new THREE.PerspectiveCamera(15, t.offsetWidth / t.offsetHeight, 45, 500)),
      (this.ready = !1),
      (this.headReady = !1),
      (this.texResolution = 512),
      n)
    )
      this.#A = n;
    ((this.shaderOverride = i),
      (this.editor = o),
      getSetting("headScaleSmall").then((a) => {
        this.#f = a;
      }));
    let s = getCurrentShaderType();
    if (r === 1)
      ((this.#o = new THREE.WebGLRenderer({ alpha: !0, preserveDrawingBuffer: !0, antialias: !1 })),
        (this.texResolution = 1024));
    else
      this.#o = new THREE.WebGLRenderer({
        alpha: !0,
        powerPreference: "high-performance",
        stencil: !1,
        antialias: !1,
      });
    if (
      (this.getRendererElement().classList.add("scene"),
      (this.setupType = r),
      (this.#i = new rg()),
      this.#i.setMeshoptDecoder(tx),
      getSetting("shaderTypeN").then((a) => {
        this.shaderType = a;
      }),
      this.#o.setSize(512, 512),
      this.#o.setPixelRatio(window.devicePixelRatio),
      ll.install({ THREE: THREE }),
      (this.#e = new ll(this.#t, this.#o.domElement)),
      r === 0)
    )
      (getSetting("useEditorShadow").then((a) => {
        a === !0 && this.#g();
      }),
        (this.camSetup = async () => {
          if (
            ((this.#e.minPolarAngle = 0.98),
            (this.#e.maxPolarAngle = 1.8),
            (this.#e.mouseButtons.left = ll.ACTION.ROTATE),
            (this.#e.mouseButtons.right = ll.ACTION.NONE),
            (this.#e.mouseButtons.wheel = ll.ACTION.DOLLY),
            (this.#e.touches.one = ll.ACTION.TOUCH_ROTATE),
            (this.#e.touches.two = ll.ACTION.TOUCH_DOLLY),
            (this.#e.touches.three = ll.ACTION.NONE),
            this.setupType !== 1)
          )
            ((this.#e.minDistance = 70), (this.#e.maxDistance = 116));
          (this.#e.zoomTo(1),
            this.bodyModels.forEach((a) => {
              a.unBindPose();
            }),
            this.swapAnimation(this.currentAnim, !0));
        }),
        this.camSetup());
    if (r === 1)
      (this.#e.dollyTo(40),
        (this.#t.fov = 30),
        (this.#e.minDistance = 10),
        (this.#e.maxDistance = 300));
    switch (
      (this.animators.set("cameraControls", (a, l) => {
        this.#e.update(l);
      }),
      (this.#n = new THREE.TextureLoader()),
      (this.mii = e),
      this.mii.gender)
    ) {
      case 0:
        this.type = "m";
        break;
      case 1:
        this.type = "f";
        break;
      default:
        this.type = "m";
        break;
    }
    ((this.clock = new THREE.Clock()),
      this.#o.setClearAlpha(0),
      (this.stopAnimating = !1),
      (JE = !1),
      (this.animateAction = this.animate.bind(this)),
      this.animateRef.push(requestAnimationFrame(this.animateAction)),
      (this.#t.aspect = this.#c.offsetWidth / this.#c.offsetHeight),
      this.#t.updateProjectionMatrix(),
      this.resize());
  }
  #s;
  async #g(e = !1) {
    let t = await this.#i.loadAsync("/assets/models/shd.glb");
    if (
      (t.scene.traverse((r) => {
        if (r.isMesh) r.position.set(0, 0, 0);
      }),
      e)
    )
      return t;
    else ((this.#s = t.scene), this.#r.add(this.#s));
  }
  async #u() {
    if (!this.#s) return;
    if (this.#b()) {
      this.#s.visible = !1;
      return;
    }
    ((this.#s.visible = !0),
      this.#s.scale.set(this.scaleFactors.x, this.scaleFactors.y, this.scaleFactors.z));
  }
  getType() {
    switch (this.mii.gender) {
      case 0:
        return "m";
      case 1:
        return "f";
      default:
        return "m";
    }
  }
  currentPosition;
  #p;
  async focusCamera(e, t = !1, r = !0, n = !1) {
    if (this.currentPosition === e && t === !1) return;
    if (this.#p) return;
    if (this.#a)
      ((this.#p = !0),
        this.animators.delete("mii_rotation"),
        (this.#e.enabled = !1),
        await new Promise(async (l) => {
          let c = this.#h(this.#e.azimuthAngle, 0);
          (this.#e.rotateTo(c, Math.PI / 2, !1),
            (this.#e.smoothTime = 0.16),
            getSoundEffects().playSound("stop_rotation"),
            await this.#e.rotateTo(0, Math.PI / 2, !0),
            (this.#e.smoothTime = 0.2),
            l());
        }),
        (this.#l = void 0),
        (this.#e.enabled = !0),
        (this.#a = !1),
        this.editor.ui.mii.qsa("button").forEach((l) => l.attr({ disabled: void 0 })),
        this.animators.delete("mii_rotation"));
    ((this.#e.smoothTime = 0.2), (this.#p = !1), (this.currentPosition = e), this.resize(!0));
    let i = new THREE.Vector3(),
      o = this.#r.getObjectByName(this.type),
      s = this.#r.getObjectByName("MiiHead"),
      a = this.#h(this.#e.azimuthAngle, 0);
    if ((this.#e.rotateTo(a, this.#l || this.#e.polarAngle, !1), e === 1)) {
      if (o !== void 0 && s !== void 0) {
        let l = new THREE.Box3().setFromObject(s);
        i.y = l.max.y / 2;
      }
      if (n === !1) {
        let l = 0,
          c = 127,
          u = 100,
          d = 115;
        (this.#e.moveTo(i.x, i.y, i.z, r), this.#e.rotateTo(0, this.#l || Math.PI / 2, r));
        let h = u + ((this.mii.height - l) / (c - l)) * (d - u) + 5;
        if (this.setupType !== 1) ((this.#e.minDistance = h - 25), (this.#e.maxDistance = h));
        await this.#e.dollyTo(h, r);
      }
      return i;
    } else if (e === 2) {
      if (this.setupType !== 1) ((this.#e.minDistance = 125), (this.#e.maxDistance = 125));
      if (
        (i.setY(14),
        this.#e.moveTo(i.x, i.y, i.z, r),
        this.#e.rotateTo(0, this.#l || Math.PI / 2, r),
        this.setupType === 0)
      )
        await this.#e.dollyTo(125, r);
    } else if (e === 0) {
      if (this.setupType !== 1) ((this.#e.minDistance = 55), (this.#e.maxDistance = 115));
      if (o !== void 0 && s !== void 0) s.getWorldPosition(i);
      (this.#e.rotateTo(0, this.#l || Math.PI / 2, r),
        this.#e.moveTo(i.x, i.y + 4.5, i.z, r),
        await this.#e.dollyTo(70, r));
    }
    this.resize(!0);
  }
  #a;
  #h(e, t) {
    let r = e - t;
    return THREE.MathUtils.euclideanModulo(r + Math.PI, Math.PI * 2) - Math.PI;
  }
  #l;
  async cameraRotate() {
    if (this.#a === !0) return;
    this.#a = !0;
    let e = this.#e.enabled;
    ((this.#e.enabled = !1),
      this.editor.ui.mii.qsa("button").forEach((o) => o.attr({ disabled: !0 })));
    let t = 3000,
      r = 360,
      n = -1,
      i = 0;
    (this.#e.rotateTo(this.#h(this.#e.azimuthAngle, 0), this.#e.polarAngle, !1),
      await this.#e.rotateTo(0, Math.PI / 2, !0),
      getSoundEffects().playSound("start_rotation"),
      this.animators.set("mii_rotation", (o) => {
        if (n === -1) n = o;
        let s = o - n,
          a = Math.min(s / t, 1),
          l = r * a,
          c = l - i;
        if ((this.#e.rotate(HO(c), 0), (i = l), (this.#l = i), a >= 1))
          ((this.#l = void 0),
            this.#e.rotateTo(0, Math.PI / 2),
            (this.#e.enabled = e),
            (this.#a = !1),
            this.editor.ui.mii.qsa("button").forEach((u) => u.attr({ disabled: void 0 })),
            this.animators.delete("mii_rotation"));
      }));
  }
  async cameraRecenter(e = !1) {
    if (this.#a === !0) return;
    let t = this.#e.enabled;
    if (((this.#e.enabled = !1), (this.#a = !0), e)) getSoundEffects().playSound("press");
    (this.#e.rotateTo(this.#h(this.#e.azimuthAngle, 0), this.#e.polarAngle, !1),
      this.editor.ui.mii.qsa("button").forEach((n) => n.attr({ disabled: !0 })));
    let r = this.#e.smoothTime;
    if (e) this.#e.smoothTime = 0.15;
    (await this.#e.rotateTo(0, Math.PI / 2, !0),
      getSoundEffects().playSound("stop_rotation"),
      (this.#e.smoothTime = r),
      this.editor.ui.mii.qsa("button").forEach((n) => n.attr({ disabled: void 0 })),
      (this.#e.enabled = t),
      (this.#a = !1));
  }
  focusCameraUpdate() {
    if (this.ready) this.camSetup();
    (this.focusCamera(this.currentPosition, !0, !1), this.resize(!1));
  }
  setExpression(e = 1) {
    let t = this.#r.getObjectsByProperty("name", "MiiHead");
    for (let r of t)
      this.traverseAddFaceMaterial(
        r,
        `&data=${encodeURIComponent(this.mii.exportHex("studioData"))}&expression=${e}&width=512`,
      );
  }
  blink() {}
  playEndingAnimation() {
    ((this.#e.enabled = !1),
      this.focusCamera(1, !0),
      this.setExpression(1),
      this.swapAnimation(this.#_()),
      getSoundEffects().playSound("finish"));
  }
  resize(e = !0, t, r) {
    let n = t || this.#c.offsetWidth,
      i = r || this.#c.offsetHeight;
    this.resizeRendererToDisplaySize(n, i);
    let o = 1,
      s = this.#o.domElement.offsetWidth > 760;
    switch (this.currentPosition) {
      case 0:
        o = s ? 1 : 1.25;
        break;
      case 1:
        o = 1;
        break;
      case 2:
        o = 1;
        break;
    }
    if (this.setupType !== 1) this.#e.zoomTo(o, e);
    else this.#e.zoomTo(1, e);
  }
  resizeRendererToDisplaySize(e, t) {
    ((this.#t.aspect = e / t), this.#t.updateProjectionMatrix());
    let r = this.#o.domElement,
      n = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 1.5 : 2,
      i = Math.min(window.devicePixelRatio, n),
      o = Math.floor(r.clientWidth * i),
      s = Math.floor(r.clientHeight * i);
    if (r.width !== o || r.height !== s) this.#o.setSize(o, s, !1);
  }
  preparing;
  needsClothingUpdate;
  unBindPose() {
    this.bodyModels.forEach((e) => {
      if (e) {
        if (e.unBindPose) e.unBindPose();
        if (e.setPose) e.setPose();
      }
    });
  }
  async init() {
    if (this.ready) return;
    if (this.preparing) return;
    if (
      ((this.preparing = !0),
      (this.ready = !1),
      (this.getRendererElement().style.opacity = "0"),
      await this.#y(),
      await this.updateBody(1),
      await this.updateBody(2),
      this.unBindPose(),
      (this.needsClothingUpdate = !0),
      getSetting("alternateIdlePoseN").then((e) => {
        ((this.#m = e === !0 && getDefaultBodyModelName() === "wii"), this.swapAnimation(this.getWaitAnimation(), !0));
      }),
      (this.ready = !0),
      (this.preparing = !1),
      this.resize(),
      this.setupType === 1)
    )
      (this.#A && this.#A(this.#o),
        this.resize(),
        requestAnimationFrame(() => {
          this.resize();
        }),
        setTimeout(() => {
          this.resize();
        }, 0));
    else
      (this.resize(),
        setTimeout(() => {
          this.resize();
        }, 500));
    this.updateBody(1);
  }
  getRendererElement() {
    return this.#o.domElement;
  }
  currentAnim;
  initAnimation(e, t) {
    this.animators.set(t, (r, n) => {
      try {
        this.bodyModels.get(this.mii.gender).mixer.update(n);
      } catch (i) {}
    });
  }
  currentAnimTimescale;
  swapAnimation(e, t = !1, r = !1, n = 0) {
    if (e === this.currentAnim && !t) return;
    ((this.currentAnim = e), (this.currentAnimTimescale = 1));
    let i = [0, 1];
    for (let o of i) {
      if (!this.bodyModels.has(o)) return;
      if (!this.bodyModels.get(o).actions) return;
      let s = this.bodyModels.get(o),
        a = s.actions;
      if (!a.has(e)) return;
      let l;
      try {
        l = a.get(e);
      } catch (c) {
        return;
      }
      if (!l) return;
      if (!t) for (let [c, u] of a) u.fadeOut(0.2);
      else for (let [c, u] of a) if (c !== e) u.stop();
      if (
        (l.reset().setEffectiveTimeScale(1).setEffectiveWeight(1),
        (l.time = n || 0),
        (this.currentAnimTimescale = 1),
        e === "Wait" || e === "Pose.01")
      ) {
        if (((this.currentAnimTimescale = 0.5), this.bodyModel === "miitomo"))
          this.currentAnimTimescale = 0.8;
      }
      if (e === "GWait") this.currentAnimTimescale = 0.5;
      if (e === "Finish") {
        if (this.bodyModel === "miitomo") this.currentAnimTimescale = 0.5;
      }
      if (this.setupType === 1) this.currentAnimTimescale *= 2;
      if (r) ((l.clampWhenFinished = !0), (l.loop = 2200));
      else ((l.clampWhenFinished = !1), (l.loop = 2201));
      if (e === "Receive" && this.bodyModel === "miitomo") l.timeScale = 1;
      if (
        (setTimeout(() => {
          if (e === "Receive" && this.bodyModel === "miitomo") l.timeScale = 1;
          else s.setTimescale(this.currentAnimTimescale);
        }, 33.33),
        !t)
      )
        l.fadeIn(0.2).play();
      else (l.play(), this.mixer?.update(0));
    }
  }
  bodyGLTF = /*@__PURE__*/ new Map();
  boneScaler = /*@__PURE__*/ new Map();
  async #y() {
    let e = async (r, n) => {
      let i = r;
      if (i === void 0 || i === null)
        (Notify.show(
          "Fallback body model",
          "Something went wrong getting the chosen body model, sorry :(",
        ),
          (i = "miitomo"));
      if (!getBodyModels().has(i)) return;
      if (!getBodyModels().get(i).has(n)) return;
      let o = getBodyModels().get(i).get(n);
      this.bodyModels.set(n, o);
      let s = o.model,
        a = n == 1 ? "f" : "m";
      if ((this.bodyGLTF.set(n, s), this.#r.getObjectByName(`${a}-body-root`) !== void 0))
        this.#r.remove(this.#r.getObjectByName(`${a}-body-root`));
      s.scene.traverse((h) => {
        if (!h.isMesh) return;
        h.frustumCulled = !1;
      });
      let l = s.scene.getObjectByName(a);
      if (this.mixer)
        (this.animators.delete("animation-0"),
          this.animators.delete("animation-m"),
          this.animators.delete("animation-1"),
          this.animators.delete("animation-f"),
          this.mixer.stopAllAction(),
          (this.mixer = null));
      if (
        (this.animators.delete("animation-0"),
        this.animators.delete("animation-m"),
        this.animators.delete("animation-1"),
        this.animators.delete("animation-f"),
        (s.scene.name = `${a}-body-root`),
        this.#r.add(s.scene),
        this.initAnimation(l, `animation-${a}`),
        r === "wiiu" || r === "baby" || r === "mae" || r === "wiiu" ||r === "wiiplay" || r === "switch" || r === "miitomo" || r === "streetpass")
      ) {
        let h;
        (s.scene.traverse((p) => {
          if (p.isSkinnedMesh) h = p;
        }),
          this.boneScaler.set(n, new BoneScaler(h, { headBoneName: "head", sklRootName: "skl_root" }, r)));
        let f = new THREE.Vector3(1, 1, 1);
        this.animators.set("zzz", () => {
          let p = this.mii.gender;
          if (!this.boneScaler.has(p)) return;
          this.boneScaler.get(p).apply(this.scaleFactors, f);
        });
      }
      let c = s.scene.getObjectByName(`body_${a}`);
      if (
        ((c.geometry.userData = {
          cullMode: 1,
          modulateColor: (isAlternatePaletteEnabled() === !0 ? getAlternatePaletteRGB() : v0)[this.mii.favoriteColor],
          modulateMode: 0,
          modulateType: 9,
        }),
        this.shaderOverride)
      )
        c.material = new THREE.MeshStandardMaterial({
          roughness: 1,
          metalness: 1,
          color: (isAlternatePaletteEnabled() === !0 ? getAlternatePaletteRGB() : FAVORITE_COLORS_INT)[this.mii.favoriteColor],
        });
      else applyShaderMaterial(c, this.#d(), this.charModel, this.mii);
      let u = s.scene.getObjectByName(`hands_${a}`);
      if (u)
        if (
          ((u.geometry.userData = {
            cullMode: 1,
            modulateColor: (isAlternatePaletteEnabled() === !0 ? getAlternatePaletteRGB() : v0)[this.mii.favoriteColor],
            modulateMode: 0,
            modulateType: 9,
          }),
          this.shaderOverride)
        )
          u.material = new THREE.MeshStandardMaterial({
            roughness: 1,
            metalness: 1,
            color: (isAlternatePaletteEnabled() === !0 ? getAlternatePaletteRGB() : FAVORITE_COLORS_INT)[this.mii.favoriteColor],
          });
        else applyShaderMaterial(u, this.#d(), this.charModel, this.mii);
      let d = s.scene.getObjectByName(`legs_${a}`);
      if (
        ((d.geometry.userData = {
          cullMode: 1,
          modulateColor: CA,
          modulateMode: 0,
          modulateType: 10,
        }),
        this.shaderOverride)
      )
        d.material = new THREE.MeshStandardMaterial({
          metalness: 1,
          roughness: 1,
          color: new THREE.Color(
            this.mii.getPantsColor()[0],
            this.mii.getPantsColor()[1],
            this.mii.getPantsColor()[2],
          ),
        });
      else applyShaderMaterial(d, this.#d(), this.charModel, this.mii);
      if (this.#r.getObjectByName("m-body-root"))
        this.#r.getObjectByName("m-body-root").visible = !1;
      if (this.#r.getObjectByName("f-body-root"))
        this.#r.getObjectByName("f-body-root").visible = !1;
      s.scene.rotation.set(0, 0, 0);
    };
    this.bodyModel = getDefaultBodyModelName();
    let t = [e(this.bodyModel, 0), e(this.bodyModel, 1)];
    await Promise.all(t);
  }
  #b() {
    return this.mii.personality === 24;
  }
  #d() {
    return this.mii.personality === 24 ? "miitomo" : this.shaderType;
  }
  getWaitAnimation() {
    return this.mii.personality === 24 ? "GWait" : this.#m ? "Pose.01" : "Wait";
  }
  #_() {
    return this.mii.personality === 24 ? "FloatFinish" : "Finish";
  }
  accessory;
  #x = !1;
  #v(e, t = !1) {
    if (this.accessory) (hx(e), (this.accessory = null));
    if (this.mii.acceType < 0) return;
    if (t && !this.#x) {
      if (this.bodyModel === "miitomo") {
        let o = ACCESSORY_MODEL_INFO[this.mii.acceType],
          s = "Wait",
          a = 900,
          l = 0.2;
        switch (o.mdlType) {
          case 3:
            switch (randomInt(3)) {
              case 0:
                ((s = "Pose.74"), (l = 0.457), (a = 1375 + l * 900));
                break;
              case 1:
                ((s = "Pose.75"), (l = 0.28), (a = 840 + l * 900));
                break;
              case 2:
                ((s = "Pose.76"), (l = 0.205), (a = 615 + l * 900));
                break;
            }
            break;
          case 0:
            switch (randomInt(3)) {
              case 0:
                ((s = "Pose.77"), (a = 1300), (l = 0.325));
                break;
              case 1:
                ((s = "Pose.166"), (a = 980), (l = 0.235));
                break;
              case 2:
                ((s = "Pose.79"), (a = 800), (l = 0.205));
                break;
            }
            break;
          case 1:
            ((s = Math.random() > 0.5 ? "Pose.68" : "Pose.71"), (a = 1000));
            break;
          case 2:
            if (o.anmType) {
              if (o.anmType === 1) s = "Pose.69";
              if (o.anmType === 2) s = "Pose.70";
            } else s = Math.random() > 0.5 ? "Pose.69" : "Pose.70";
            break;
        }
        (this.swapAnimation(s, !1, !1, l),
          (this.#x = !0),
          setTimeout(() => {
            (this.swapAnimation(this.getWaitAnimation(), !0, !1),
              setTimeout(() => {
                this.#x = !1;
              }, 50));
          }, a));
      }
    }
    if (this.bodyModel !== "miitomo") return;
    let r = getAccessoryModels()[this.mii.acceType];
    this.accessory = dx(e, r, {
      type: this.mii.acceType,
      variant: this.mii.acceVariant,
      bodyType: this.bodyModel,
    });
    let n = 0;
    switch (ACCESSORY_MODEL_INFO[this.mii.acceType].texType) {
      case 0:
        n = 1;
        break;
      case 1:
        n = 5;
        break;
      case 2:
        n = 2;
        break;
    }
    let i = [
      this.mii.getAccePrimaryColor(),
      this.mii.getAcceSecondaryColor(),
      this.mii.getAcceTertiaryColor(),
    ];
    this.accessory.traverse((o) => {
      if (o.isMesh)
        ((o.geometry.userData.modulateMode = n),
          (o.geometry.userData.modulateType = 10),
          (o.geometry.userData.modulateColor = i),
          (o.material.map = getAccessoryTextures()[this.mii.acceType].get(o.name)),
          applyShaderMaterial(o, this.#d(), this.charModel, this.mii));
    });
  }
  #C() {
    if (!this.accessory) return;
    let e = [
      new (getTHREE().Color)(...this.mii.getAccePrimaryColor()),
      new (getTHREE().Color)(...this.mii.getAcceSecondaryColor()),
      new (getTHREE().Color)(...this.mii.getAcceTertiaryColor()),
    ];
    this.accessory.traverse((t) => {
      if (t.isMesh) t.material.color = e;
    });
  }
  #w = -1;
  #E() {
    return new Promise((e) => {
      if (this.ready && this.headReady) return e();
      let r = setInterval(() => {
        if (this.ready && this.headReady) (clearInterval(r), e());
      }, 250);
    });
  }
  async updateBody(e = 0) {
    if (!this.ready) return;
    if ((this.resize(), e === 4))
      this.getHead().traverse((d) => {
        if (!d.isMesh) return;
        let h = d;
        if (!h.geometry.userData) return;
        if (!h.geometry.userData.modulateType) return;
        if (h.geometry.userData.modulateType !== 4) return;
        let f = h.material;
        if (!f) return;
        if (!(f.isToonShader || f.isSwitchShader || f.isMiitomoShader || f.useHairTip)) return;
        if (this.mii.hairTipColor !== -1) {
          let g = this.mii.hairTipColor,
            m = new THREE.Vector3(...COMMON_COLOR_TABLE[g]);
          ((m.w = g),
            (f.hairTipColor = m),
            (f.uniforms.u_useHairTip.value = !0),
            (f.modulateType = 4));
        } else f.uniforms.u_useHairTip.value = !1;
        ((f.hairTipX = this.mii.hairTipX), (f.hairTipY = this.mii.hairTipY));
      });
    this.type = this.getType();
    let t = this.#r.getObjectByName("m-body-root"),
      r = this.#r.getObjectByName("f-body-root");
    if (!t) return;
    if (!r) return;
    let n = this.mii.build,
      i = this.mii.height,
      o = { x: 0, y: 0, z: 0 };
    ((o.x = (n * (i * 0.003671875 + 0.4)) / 128 + i * 0.001796875 + 0.4),
      (o.y = i * 0.006015625 + 0.5),
      (o.z = o.x),
      (this.scaleFactors = o),
      this.#u());
    let s = t;
    switch (this.type) {
      case "m":
        s = t;
        break;
      case "f":
        s = r;
        break;
    }
    let a = (d) => {
        if (
          this.bodyModel === "wiiu" ||
          this.bodyModel === "switch" ||
          this.bodyModel === "miitomo" ||
          this.bodyModel === "wii" ||
          this.bodyModel === "mae" ||
          this.bodyModel === "baby" ||
          this.bodyModel === "wiiplay" ||
          this.bodyModel === "streetpass"
        )
          d.scale.set(1, 1, 1);
        else d.scale.set(o.x, o.y, o.z);
      },
      l = this.bodyModel,
      c = (d) => {
        let h = new THREE.Quaternion(),
          f = new THREE.Vector3(),
          p = void 0;
        return (
          d.traverse((g) => {
            if (p) return;
            if (g.isSkinnedMesh) p = g;
          }),
          () => {
            if ((d.updateMatrixWorld(!0), p)) p.skeleton.update();
            let g = d.getObjectByName("head");
            if (g === void 0) g = d.getObjectByName("Head");
            if (!g) return;
            ((this.#T = g), g.updateMatrixWorld(!0));
            let m = new THREE.Vector3();
            if ((g.matrixWorld.decompose(m, h, f), this.#r.getObjectByName("MiiHead"))) {
              (this.#r.getObjectByName("MiiHead").position.copy(m),
                this.#r.getObjectByName("MiiHead").setRotationFromQuaternion(h));
              let A = this.#r.getObjectByName("MiiHead");
              if (l === "miitomo") ((A.rotation.z -= Math.PI / 2), (A.position.y += 0.05));
            }
          }
        );
      },
      u = async (d, h) => {
        let f = d.getObjectByName(h).getObjectByName("body_" + h),
          p = d.getObjectByName(h).getObjectByName("legs_" + h);
        if (this.bodyModel !== "miitomo" || this.mii.outfitType === -1) {
          let g = getAdditionalInfo(this.mii),
            m = this.#d(),
            A = shaderUsesFFLParams(m),
            y = getShaderMaterialClass(m),
            x = A
              ? {
                  modulateMode: 0,
                  modulateType: 9,
                  ...(isGhostMii(y, g) ? { applyGhost: !0, additionalInfo: g } : {}),
                }
              : {},
            b = A
              ? {
                  modulateMode: 0,
                  modulateType: 10,
                  ...(isGhostMii(y, g) ? { applyGhost: !0, additionalInfo: g } : {}),
                }
              : {};
          if ("isSwitchShader" in y.prototype || "isMiitomoShader" in y.prototype) {
            if (this.charModel && typeof this.charModel.charInfo < "u") {
              let v = Object.assign({}, this.charModel.charInfo, {
                personal: { favoriteColor: this.mii.favoriteColor, special: this.mii.special },
              });
              ((x.charInfo = v), (b.charInfo = v), (x.additionalInfo = g), (b.additionalInfo = g));
            }
          }
          ((f.material = new y({
            color: new THREE.Color(
              this.mii.getShirtColor()[0],
              this.mii.getShirtColor()[1],
              this.mii.getShirtColor()[2],
            ),
            ...x,
          })),
            (p.material = new y({
              color: new THREE.Color(
                this.mii.getPantsColor()[0],
                this.mii.getPantsColor()[1],
                this.mii.getPantsColor()[2],
              ),
              ...b,
            })));
        }
        if (e === 1) {
          let g;
          if (!this.charModel) g = toFFLCharInfo(this.mii);
          else g = this.charModel.charInfo;
          if (this.bodyModel === "miitomo") {
            if (this.mii.outfitType >= 0) {
              if (
                !(await loadOutfitTextures({
                  bodyType: this.bodyModel,
                  clothesTextures: getOutfitTextureCache(),
                  gender: this.mii.gender,
                  outfitType: this.mii.outfitType,
                  outfitVariant: this.mii.outfitVariant,
                }))
              ) {
                let A = getTranslator();
                Notify.show(A("Failed to load outfit"), A("This outfit is not available"));
                return;
              }
            }
          }
          px({
            gender: this.mii.gender,
            outfitType: this.mii.outfitType,
            outfitVariant: this.mii.outfitVariant,
            renderer: this.#o,
            bodyModel: this.bodyModel,
            shirtColor: this.mii.getShirtColor(),
            pantsColor: this.mii.getPantsColor(),
            shoesColor: this.mii.getShoesColor(),
            facelineColor: this.charModel
              ? this.charModel.facelineColor || this.charModel.faceColor
              : new THREE.Color(
                  ...(this.mii.facePaintColor > -1
                    ? COMMON_COLORS_RGB[this.mii.facePaintColor]
                    : SKIN_COLORS_RGB[this.mii.facelineColor]),
                ),
            nBody: f,
            nLegs: p,
            bodyGroup: this.#r.getObjectByName(this.type),
            clothesTextures: getOutfitTextureCache(),
            originalMaterial: getShaderMaterialClass(this.#d()),
            originalMaterialName: this.#d(),
            charInfo: g,
            additionalInfo: getAdditionalInfo(this.mii),
          });
        } else if (e === 2)
          (this.unBindPose(),
            this.swapAnimation(this.getWaitAnimation(), !0),
            this.#y().then(() => {
              (this.unBindPose(),
                this.swapAnimation(this.getWaitAnimation(), !0),
                this.updateBody(1));
            }));
      };
    switch (this.mii.gender) {
      case 0:
        if (((t.visible = !0), (r.visible = !1), this.animators.set("zzzza", c(t)), a(t), e !== 0))
          u(t, "m");
        break;
      case 1:
        if (((t.visible = !1), (r.visible = !0), this.animators.set("zzzza", c(r)), a(r), e !== 0))
          u(r, "f");
        break;
    }
    if (e === 3)
      requestAnimationFrame(() => {
        this.focusCamera(this.currentPosition, !0, !0, !1);
      });
    else
      requestAnimationFrame(() => {
        this.resize();
      });
    if (this.mii.gender !== this.#w || e === 5) {
      if ((await this.#E(), this.bodyModels.has(this.mii.gender))) {
        let h = this.mii.gender === 1 ? r : t;
        this.#v(h, e === 5);
      }
    }
    ((this.#w = this.mii.gender), this.#C());
  }
  debugGetScene() {
    return this.#r;
  }
  fadeIn() {
    if (
      (this.updateBody(1),
      this.focusCamera(2, !0, !1),
      setTimeout(() => {
        this.updateBody(0);
      }, 500),
      this.setupType === 0)
    ) {
      if (this.editor.source === 1)
        ((this.#e.enabled = !1),
          this.focusCamera(2, !0, !1),
          this.swapAnimation("Receive", !0, !0),
          (this.currentAnimTimescale = 0.5));
      (setTimeout(() => {
        if (this.editor.source === 1)
          ((this.#e.enabled = !1),
            this.focusCamera(2, !0, !1),
            this.swapAnimation("Receive", !0, !0),
            (this.currentAnimTimescale = 0.5),
            this.setExpression(1),
            setTimeout(() => {
              (this.focusCamera(2, !0, !1),
                this.swapAnimation("Receive", !0, !0),
                (this.currentAnimTimescale = 0.5),
                playSound("receive"),
                setTimeout(() => {
                  this.sparkle();
                }, 1000),
                setTimeout(() => {
                  (this.editor.enableUI(),
                    this.swapAnimation(this.getWaitAnimation(), !1),
                    this.setExpression(0),
                    setTimeout(() => {
                      this.blink();
                    }, 4500),
                    (this.#e.enabled = !0),
                    this.focusCamera(0, !0, !0),
                    this.resize(!0));
                }, 2500));
            }, 250));
        else (this.focusCamera(0, !0, !1), this.resize());
      }, 100),
        this.#u(),
        (this.getRendererElement().style.opacity = "0"),
        setTimeout(() => {
          this.getRendererElement().style.opacity = "1";
        }, 250));
    } else this.getRendererElement().style.opacity = "1";
  }
  lastModelType;
  async updateHat(e) {
    let t = getTranslator();
    try {
      let r = this.#r.getObjectsByProperty("name", "HatScene");
      for (let n of r) (n.removeFromParent(), disposeObject(n));
    } catch (r) {}
    try {
      if (this.mii.hatType !== -1) {
        let r = getHatModels()[this.mii.hatType];
        if (!r)
          throw Notify.show(t("Failed to load hat model"), t("Something went wrong loading this hat."));
        let n = r;
        if ((n.position.set(0, 0, 0), n.scale.set(1, 1, 1), this.mii.hairFlip))
          n.scale.set(-1, 1, 1);
        n.name = "HatScene";
        let i = 0;
        if (e.asset.extras.partsTransform.hatTranslate) {
          let o = e.asset.extras.partsTransform.hatTranslate;
          switch (HAT_MODEL_INFO[this.mii.hatType].mdlType) {
            case 1:
            case 0:
            case 6:
              n.position.add(o);
              break;
            case 4:
              break;
            case 3:
              break;
            case 5:
              let s = e.asset.extras.partsTransform.headTopTranslate;
              ((n.position.y += s.y), n.position.add(o));
              break;
          }
        }
        (n.traverse((o) => {
          if (o.name === "HatScene" || o.name === "HatRoot") return;
          if (o.isMesh) {
            let s = o,
              a = s.material,
              l = getHatTextures()[this.mii.hatType].get(s.name);
            if (!l) return;
            if (HAT_MODEL_INFO[this.mii.hatType].hatPos?.[this.mii.hairType]) {
              let f = HAT_MODEL_INFO[this.mii.hatType].hatPos[this.mii.hairType];
              (s.position.set(f.t[0], f.t[1], f.t[2]),
                s.rotation.set(
                  f.r[0] * THREE.MathUtils.DEG2RAD,
                  f.r[1] * THREE.MathUtils.DEG2RAD,
                  f.r[2] * THREE.MathUtils.DEG2RAD,
                ),
                s.scale.set(f.s[0], f.s[1], f.s[2]));
            }
            let c = s.name === "HairColor";
            if (c) {
              window.hairColor = s;
              let f = new THREE.Color(...COMMON_COLOR_TABLE[this.mii.hairColor]);
              if (isAlternatePaletteEnabled()) f = Oo(f, 4);
              if (
                ((s.material.color = f),
                (s.material.modulateType = 4),
                (s.geometry.userData.modulateType = 4),
                (s.geometry.userData.modulateMode = 0),
                (s.geometry.userData.modulateColor = [...s.material.color.toArray(), 1]),
                i++,
                applyShaderMaterial(s, this.#d(), this.charModel, this.mii),
                HAT_MODEL_INFO[this.mii.hatType].hcFix && this.mii.hairType === 30)
              )
                s.material.visible = !1;
              else if (this.mii.hairType === 30)
                ((s.material.modulateType = 0),
                  (s.material.modulateMode = 0),
                  (s.material.color = this.charModel.facelineColor));
              return;
            }
            let u = HAT_MODEL_INFO[this.mii.hatType].texType,
              d = this.mii.getHatPrimaryColor(),
              h = !1;
            if (!c && u === 2) {
              ((d = [
                this.mii.getHatPrimaryColor(),
                this.mii.getHatSecondaryColor(),
                this.mii.getHatTertiaryColor(),
              ]),
                (l.anisotropy = 0),
                (l.generateMipmaps = !1));
              let { NearestFilter: f, MirroredRepeatWrapping: p } = THREE;
              if (HAT_MODEL_INFO[this.mii.hatType].texFiltering) f = HAT_MODEL_INFO[this.mii.hatType].texFiltering;
              if (HAT_MODEL_INFO[this.mii.hatType].texWrap) p = HAT_MODEL_INFO[this.mii.hatType].texWrap;
              ((l.minFilter = f),
                (l.magFilter = f),
                (l.wrapS = p),
                (l.wrapT = p),
                (s.material.map = l),
                (s.material.needsUpdate = !0),
                (h = !0));
            }
            ((s.material = new THREE.MeshBasicMaterial({ color: d, map: l, name: a.name })),
              (s.material.needsUpdate = !0),
              (s.geometry.userData = {
                cullMode: 0,
                modulateColor: d,
                modulateMode: h ? 2 : S0(u),
                modulateType: 5,
              }),
              i++,
              applyShaderMaterial(s, this.#d(), this.charModel, this.mii));
          }
        }),
          e.scene.add(n));
      }
    } catch (r) {}
  }
  GLB;
  lights() {
    addDefaultLights(this.#r);
  }
  async updateMiiHead(e = 0) {
    if (!this.ready);
    let t = this.#r.getObjectsByProperty("name", "MiiHead"),
      r = getTranslator();
    switch (e) {
      case 0:
        try {
          let i = new Mii(this.mii.export("miic")),
            o = {};
          if (this.mii.hatType !== -1)
            switch (HAT_MODEL_INFO[this.mii.hatType].mdlType) {
              case 1:
                o.modelType = "hat";
                break;
              case 2:
                o.modelType = "face_only";
                break;
              case 6:
                i.hairType = 30;
                break;
            }
          o.verifyCharInfo = "0";
          let s,
            a = "NORMAL";
          switch (o.modelType) {
            case "hat":
              a = "HAT";
              break;
            case "face_only":
              a = "FACE_ONLY";
              break;
          }
          let l = !1;
          try {
            let m = Number(this.#c.closest("[data-tab-num]").dataset.tabNum);
            l = m === 11 || m === 14;
          } catch (m) {}
          if (
            this.mii.hatType > -1 &&
            this.lastModelType === a &&
            this.GLB !== void 0 &&
            this.GLB !== null &&
            l
          ) {
            await this.updateHat(this.GLB);
            return;
          }
          ((s = await XD(this.#d(), i, this.getRenderer(), a, this.texResolution)),
            (this.GLB = s),
            (this.lastModelType = a),
            setTimeout(() => {
              if (this.needsClothingUpdate) (this.updateBody(1), (this.needsClothingUpdate = !1));
            }, 11),
            (s.scene.name = "MiiHead"));
          var n = this.#f ? 0.112 : 0.14;
          if ((s.scene.scale.set(n, n, n), t))
            (this.#r.remove(...t),
              this.#r.getObjectsByProperty("name", "MiiHead").forEach((m) => {
                m.parent.remove(m);
              }));
          (this.resize(), this.#r.add(s.scene));
          let c = getLightSetupForShader(this.#d());
          if ((removeLights(this.#r), c)) c(this.#r);
          let u = this.#r.getObjectByName(this.type),
            d = u.getObjectByName("head");
          if (d === void 0) d = u.getObjectByName("Head");
          if (!d) return;
          d.updateMatrixWorld(!0);
          let h = new THREE.Vector3(),
            f = new THREE.Quaternion(),
            p = new THREE.Vector3();
          if ((d.matrixWorld.decompose(h, f, p), s.scene))
            (s.scene.position.copy(h), s.scene.setRotationFromQuaternion(f));
          let g = this.bodyModel;
          if (((this.charModel = s.CharModel), g === "miitomo")) s.scene.rotation.z -= Math.PI / 2;
          await this.updateHat(s);
        } catch (i) {}
        break;
      case 1:
        if (t.length > 0)
          t.forEach((i) => {
            this.traverseAddFaceMaterial(
              i,
              `&data=${encodeURIComponent(this.mii.exportHex("studioData"))}&width=512`,
            );
          });
        break;
    }
    if (this.headReady === !1) this.fadeIn();
    ((this.headReady = !0), this.resize());
  }
  sparkTimeout;
  sparkle() {
    let e = this.#c.querySelector(".sparkle-container");
    if (!e) return;
    let t = e.getBoundingClientRect(),
      r = t.width / 2,
      n = t.height / 2;
    for (let o = 0; o < 4 + Math.floor(Math.random() * 3); o++) {
      var i = new Html("img")
        .class("sparkle")
        .attr({ src: "data:image/svg+xml," + encodeURIComponent(SVG_ICONS.sparkle_new) });
      i.appendTo(e);
      let s = Math.random() * (t.width * 0.5) + t.width / 6,
        a = Math.random() * (t.height * 0.5) + t.height / 6,
        l = s - r,
        c = a - n,
        u = 0.1,
        d = s + l * u,
        h = a + c * u;
      if (
        (i.style({
          "--old-x": `${s}px`,
          "--old-y": `${a}px`,
          "--new-x": `${d}px`,
          "--new-y": `${h}px`,
        }),
        this.sparkTimeout)
      )
        clearTimeout(this.sparkTimeout);
      this.sparkTimeout = setTimeout(() => {
        (i.cleanup(), (e.innerHTML = ""));
      }, 500);
    }
  }
  getHead() {
    return this.#r.getObjectByName("MiiHead");
  }
  traverseAddFaceMaterial(e, t) {
    e.traverse((r) => {
      let n = r;
      if (n.isMesh) {
        if (n.geometry.userData) {
          let i = n.geometry.userData;
          if (i.modulateMode) {
            if (i.modulateType === 6)
              (async () => {
                let s = n.material;
                var a = t;
                let l,
                  c = new URLSearchParams(t),
                  { img: u } = await Bb(this.mii, this.getRenderer(), Number(c.get("expression")));
                if (((a = null), (l = u), l)) {
                  if (
                    ((l.flipY = !1),
                    this.#o.initTexture(l),
                    (n.material.map = l),
                    (n.material.transparent = !0),
                    s.map)
                  )
                    s.map.dispose();
                  s.dispose();
                }
              })();
          }
        }
      }
    });
  }
  getCamera() {
    return this.#t;
  }
  getControls() {
    return this.#e;
  }
  getScene() {
    return this.#r;
  }
  getRenderer() {
    return this.#o;
  }
  shuttingDown = !1;
  shutdown() {
    if (this.shuttingDown) return;
    if (((this.shuttingDown = !0), this.animators)) this.animators.clear();
    if (this.charModel) this.charModel.dispose();
    let e = new ResourceTracker();
    if (
      (e.track(this.#r),
      e.dispose(),
      getBodyModels().forEach((r) => {
        r.forEach((n) => {
          if (!n) return;
          if (!n.setPose) return;
          n.setPose("Pose.01");
        });
      }),
      this.mixer)
    )
      (this.animators.delete("animation-0"),
        this.animators.delete("animation-m"),
        this.animators.delete("animation-1"),
        this.animators.delete("animation-f"),
        this.mixer.stopAllAction(),
        (this.mixer = null));
    this.bodyModels.forEach((r) => {
      if (r) {
        if (r.unBindPose) r.unBindPose();
        if (r.setPose) r.setPose();
      }
    });
    function t(r) {
      r.visible = !0;
    }
    if (this.#r.getObjectByName("m"))
      ((this.#r.getObjectByName("m").visible = !0), this.#r.getObjectByName("m").traverse(t));
    if (this.#r.getObjectByName("f"))
      ((this.#r.getObjectByName("f").visible = !0), this.#r.getObjectByName("f").traverse(t));
    for (let r of this.animateRef) cancelAnimationFrame(r);
    ((this.stopAnimating = !0),
      this.#o.dispose(),
      this.#o.renderLists.dispose(),
      (this.animators = null),
      (this.animate = null),
      (this.animateAction = null),
      (JE = !0));
  }
  inCompareMode = !1;
  compareMixer;
  compareStuff = [];
  enterCompareMode(e, t, r) {
    if (this.inCompareMode) return;
    this.inCompareMode = !0;
    let n = this.bodyModels.get(e);
    ((this.compareMixer = new AnimationController(n, t.bodyModel)),
      this.compareMixer.actions.get(r ? "GWait" : "Wait").play(),
      this.animators.set("mix", (s, a) => {
        (this.compareMixer.update(a), t.boneScaler.apply(t.bodyScale, { x: 1, y: 1, z: 1 }));
      }));
    let o = t.miiGroup;
    if ((this.compareStuff.push(o), o.position.set(5, 0, 0), this.#s))
      this.#s.position.set(-5, 0, 0);
    (this.getScene().getObjectByName("f-body-root") &&
      this.getScene().getObjectByName("f-body-root").position.set(-5, 0, 0),
      this.getScene().getObjectByName("m-body-root") &&
        this.getScene().getObjectByName("m-body-root").position.set(-5, 0, 0),
      o.scale.setScalar(0.14),
      this.#r.add(o),
      getSetting("useEditorShadow").then(async (s) => {
        if (s === !0) {
          let a = await this.#g(!0);
          (o.add(a.scene),
            a.scene.scale.set(t.bodyScale.x * 7, t.bodyScale.y * 7, t.bodyScale.z * 7),
            this.compareStuff.push(a.scene));
        }
      }));
  }
  exitCompareMode() {
    if (!this.inCompareMode) return;
    if (
      ((this.inCompareMode = !1),
      this.animators.delete("mix"),
      this.animators.delete("head"),
      (this.compareStuff = this.compareStuff.filter(Boolean)),
      this.#s)
    )
      this.#s.position.set(0, 0, 0);
    (this.getScene().getObjectByName("f-body-root") &&
      this.getScene().getObjectByName("f-body-root").position.set(0, 0, 0),
      this.getScene().getObjectByName("m-body-root") &&
        this.getScene().getObjectByName("m-body-root").position.set(0, 0, 0),
      this.compareStuff.forEach((e) => {
        e.removeFromParent();
      }));
  }
  #T;
  get headBone() {
    return this.#T;
  }
}
var G1 = In(MN(), 1);
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */ function Fe(e) {
  if (!e) throw Error("Assertion failed.");
}
