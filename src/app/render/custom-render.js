// src/app/render/custom-render.js
// Expressions list and the Custom Render dialog.
//
// Defines: EXPRESSIONS, Sre, Mre, Ire, openCustomRenderDialog
// Uses from other files:
//   app/util/download.js: downloadURL, k5, downloadBlob, copyTextToClipboard, readClipboard
//   app/ui/components.js: addButtonSounds, createFeatureSet, separatorGapThin
//   app/renderer/mii-model.js: getAdditionalInfo, getSharedRenderer, createMiiModel
//   app/shaders/shader-registry.js: getRendererSetting, getShaderMaterialClass,
//                                   getCurrentShaderType
//   app/library/library.js: openMiiPicker, fetchLibrary, gk
//   app/ui/modal.js: closeModal, Modal
//   app/assets/models.js: getBodyModels, getDefaultBodyModelName
//   app/settings/settings.js: SETTINGS_SECTIONS, getSetting
//   app/renderer/mii-viewer.js: MiiViewer, G1
//   app/ui/html.js: Html
//   app/settings/palette-flags.js: getAlternatePaletteSetting
//   app/i18n/localization.js: getTranslator
//   … and 10 more files

var hk = 1009,
  fk = 1023,
  translate = getTranslator();
var EXPRESSIONS = [
  { name: "Normal", id: 0 },
  { name: "Smile", id: 1 },
  { name: "Anger", id: 2 },
  { name: "Sorrow", id: 3 },
  { name: "Surprise", id: 4 },
  { name: "Blink", id: 5 },
  { name: "Normal (open mouth)", id: 6 },
  { name: "Smile (open mouth)", id: 7 },
  { name: "Anger (open mouth)", id: 8 },
  { name: "Sorrow (open mouth)", id: 9 },
  { name: "Surprise (open mouth)", id: 10 },
  { name: "Blink (open mouth)", id: 11 },
  { name: "Wink (left eye open)", id: 12 },
  { name: "Wink (right eye open)", id: 13 },
  { name: "Wink (left eye and mouth open)", id: 14 },
  { name: "Wink (right eye and mouth open)", id: 15 },
  { name: "Wink (left eye open and smiling)", id: 16 },
  { name: "Wink (right eye open and smiling)", id: 17 },
  { name: "Frustrated", id: 18 },
  { name: "Bored", id: 19 },
  { name: "Bored open mouth", id: 20 },
  { name: "Sigh mouth straight", id: 21 },
  { name: "Sigh", id: 22 },
  { name: "Disgusted mouth straight", id: 23 },
  { name: "Disgusted", id: 24 },
  { name: "Love", id: 25 },
  { name: "Love mouth open", id: 26 },
  { name: "Determined mouth straight", id: 27 },
  { name: "Determined", id: 28 },
  { name: "Cry mouth straight", id: 29 },
  { name: "Cry", id: 30 },
  { name: "Big smile mouth straight", id: 31 },
  { name: "Big smile", id: 32 },
  { name: "Cheeky", id: 33 },
  { name: "Cheeky (mirror)", id: 34 },
  { name: "Resolve eyes funny mouth", id: 35 },
  { name: "Resolve eyes funny mouth open", id: 36 },
  { name: "Smug", id: 37 },
  { name: "Smug mouth open", id: 38 },
  { name: "Resolve", id: 39 },
  { name: "Resolve mouth open", id: 40 },
  { name: "Unbelievable", id: 41 },
  { name: "Cunning", id: 43 },
  { name: "Raspberry", id: 45 },
  { name: "Innocent", id: 47 },
  { name: "Innocent (mirror)", id: 48 },
  { name: "Cat", id: 49, modifier: 0 },
  { name: "Dog", id: 51, modifier: 0 },
  { name: "Tasty", id: 53 },
  { name: "Money mouth straight", id: 55 },
  { name: "Money", id: 56 },
  { name: "Confused mouth straight", id: 57 },
  { name: "Confused", id: 58 },
  { name: "Cheerful mouth straight", id: 59 },
  { name: "Cheerful", id: 60 },
  { name: "Blank", id: 61, modifier: 1 },
  { name: "Grumble mouth straight", id: 63 },
  { name: "Grumble", id: 64 },
  { name: "Moved mouth straight", id: 65 },
  { name: "Moved (aka pleading face)", id: 66 },
  { name: "Singing mouth small", id: 67 },
  { name: "Singing", id: 68 },
  { name: "Stunned", id: 69 },
  { name: "Demotivated", id: 70 },
  { name: "Cunning", id: 71 },
  { name: "Full", id: 72 },
  { name: "Sleepy", id: 73 },
  { name: "Sleepy(Right eye open)", id: 74 },
  { name: "Confused", id: 75 },
  { name: "Woozy", id: 76 },
  { name: "Wink (Joy)", id: 77 },
  { name: "Wink (Joy, mirrored)", id: 78 },
  { name: "Uninterested", id: 79 },
  { name: "Mischievous", id: 80 },
  { name: "Mad", id: 81 },
];
async function Sre() {
  if ((typeof navigator < "u" && /firefox/i.test(navigator.userAgent)) || typeof VideoEncoder > "u")
    return !1;
  return !0;
}
var pk = null,
  Mre = !1;
async function Ire() {
  if (Mre) return !1;
  if (pk) return !0;
  return ((pk = await dk()), !0);
}
function openCustomRenderDialog(e, t, r = !1) {
  return new Promise(async (n) => {
    let i = !1;
    async function o(xe = !0) {
      let pe = await localforage.default.getItem("settings_shaderTypeN");
      (await updatePaletteForShader(pe), n(xe));
    }
    getBodyModels().forEach((xe) => {
      xe.forEach((pe) => {
        if (pe) {
          if (pe.unBindPose) pe.unBindPose();
        }
      });
    });
    let s = !1,
      a = void 0;
    if (e.personality === 24) a = "miitomo";
    let l = Modal.modal(translate("Notice"), translate("Custom Render is loading, please wait...")),
      c = new Html("span").text(translate("Preparing..."));
    l.qs(".modal-body").append(c);
    let u = /*@__PURE__*/ new Map(),
      d = [],
      h = getShaderMaterialClass(a),
      f = {};
    if (e.personality === 24) f = { applyGhost: !0, additionalInfo: { ...getAdditionalInfo(e), applyGhost: !0 } };
    f.charInfo = toFFLCharInfo(e);
    let p = range(82 - 1),
      g = await getFFLModule()?.createFace(
        e,
        getSharedRenderer(),
        null,
        256,
        h,
        e.hatType > -1 ? (HAT_MODEL_INFO[e.hatType].mdlType === 1 ? 2 : 0) : 0,
        p,
        !1,
        f,
      ),
      m = [],
      A = !1,
      y = { c: 0, s: 0, p: 0, e: 0, a: 0 },
      x = "c",
      b = {
        camera: {
          label: translate("Camera"),
          header: new Html("span").html(
            translate(`Use mouse or touch to move the camera around. Try different input actions for new results!

If you like this site, consider giving credit when you post your renders, it helps out a lot!`),
          ),
          headerIsHtml: !0,
          items: [
            {
              type: 3,
              property: "fov",
              iconStart: translate("FOV"),
              iconEnd: "",
              min: 5,
              max: 27,
              part: 1,
            },
            {
              type: 5,
              html: new Html("div").class("flex-group", "col").appendMany(
                new Html("label").text(translate("Position")),
                new Html("div").class("flex-group").appendMany(
                  new Html("button").text(translate("Center X")).on("click", async () => {
                    let xe = await F.focusCamera(1, !0, !1, !0),
                      pe = new Vector3_2();
                    (te.getTarget(pe), (pe.x = xe.x), te.moveTo(pe.x, pe.y, pe.z));
                  }),
                  new Html("button").text(translate("Center Y")).on("click", async () => {
                    let xe = await F.focusCamera(1, !0, !1, !0),
                      pe = new Vector3_2();
                    (te.getTarget(pe), (pe.y = xe.y), te.moveTo(pe.x, pe.y, pe.z));
                  }),
                  new Html("button").text(translate("Center to body")).on("click", () => {
                    F.focusCamera(1, !0, !1);
                  }),
                  new Html("button").text(translate("Center to head")).on("click", () => {
                    let xe = F.getHead();
                    if (!xe) return;
                    let pe = new Box3_2().setFromObject(xe),
                      Ue = new Vector3_2();
                    (pe.getCenter(Ue), xe.localToWorld(Ue), te.moveTo(Ue.x, Ue.y + 2, Ue.z));
                  }),
                ),
                new Html("label").text(translate("Rotate")),
                new Html("div").class("flex-group").appendMany(
                  new Html("button").text(translate("Up")).on("click", () => {
                    F.getControls().rotateTo(te.azimuthAngle, te.polarAngle - he);
                  }),
                  new Html("button").text(translate("Down")).on("click", () => {
                    F.getControls().rotateTo(te.azimuthAngle, te.polarAngle + he);
                  }),
                  new Html("button").text(translate("Left")).on("click", () => {
                    F.getControls().rotateTo(te.azimuthAngle - he, te.polarAngle);
                  }),
                  new Html("button").text(translate("Right")).on("click", () => {
                    F.getControls().rotateTo(te.azimuthAngle + he, te.polarAngle);
                  }),
                  new Html("button").text(translate("Reset")).on("click", () => {
                    te.rotateTo(0, Math.PI / 2);
                  }),
                ),
              ),
              select() {},
            },
          ],
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "c"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
        scene: {
          label: translate("Scene"),
          header: translate("Adjust scene options to your liking."),
          items: m,
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "s"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
        pose: {
          label: translate("Pose"),
          header: translate(
            "Change the Body Model option in Settings to get many different options of poses!",
          ),
          items: [{ type: 0, value: 0, icon: "None", part: 0 }],
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "p"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
        expression: {
          label: translate("Expression"),
          items: [],
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "e"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
        animation: {
          label: translate("Animation"),
          header: translate("Control the animation speed."),
          items: [
            {
              type: 3,
              property: "animSpeed",
              part: 1,
              iconStart: "0x",
              iconEnd: "2x",
              min: 0,
              max: 200,
            },
          ],
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "a"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
        render: {
          label: translate("Render"),
          header: translate(`You can export animated renders here!
TIP: Set a background in the Scene tab to chroma-key exported videos!`),
          items: [
            {
              type: 5,
              html: new Html("button")
                .text(translate("Export animated video (MP4)"))
                .on("click", async () => {
                  E(3);
                }),
            },
            {
              type: 5,
              html: new Html("button")
                .text(translate("Export animated video (WebM)"))
                .on("click", async () => {
                  E(2);
                }),
            },
            {
              type: 5,
              html: new Html("button").text(translate("Export animated GIF")).on("click", async () => {
                E(0);
              }),
            },
            {
              type: 5,
              html: new Html("button")
                .text(translate("Export high-quality GIF (slow)"))
                .on("click", async () => {
                  E(1);
                }),
            },
          ],
          onBeforeChange(xe, pe) {
            return (
              (y[x] = Z.elm.scrollTop),
              requestAnimationFrame(() => {
                ((x = "a"), (Z.elm.scrollTop = y[x]));
              }),
              !0
            );
          },
        },
      };
    window.tabScrollPos = y;
    let v,
      _,
      w,
      S = (xe) => {
        let pe = new Quaternion_2(),
          Ue = new Vector3_2(),
          mt = void 0;
        return (
          xe.traverse((wt) => {
            if (mt) return;
            if (wt.isSkinnedMesh) mt = wt;
          }),
          () => {
            if ((xe.updateMatrixWorld(!0), mt)) mt.skeleton.update();
            let wt = xe.getObjectByName("head");
            if (wt === void 0) wt = xe.getObjectByName("Head");
            if (!wt) return;
            wt.updateMatrixWorld(!0);
            let yt = new Vector3_2();
            if ((wt.matrixWorld.decompose(yt, pe, Ue), v.getObjectByName("MiiHead"))) {
              (v.getObjectByName("MiiHead").position.copy(yt),
                v.getObjectByName("MiiHead").setRotationFromQuaternion(pe));
              let tr = v.getObjectByName("MiiHead");
              if (F.bodyModel === "miitomo")
                ((tr.rotation.z -= Math.PI / 2), (tr.position.y += 0.05));
            }
          }
        );
      };
    async function E(xe) {
      if (A) return;
      if (((A = !0), xe > 1)) {
        if (typeof re !== "string") {
          if (((re = "green"), le(), i === !1))
            ((i = !0),
              await Modal.alert(
                translate("Notice"),
                translate(`Video recording will NOT keep the transparent background.
For this, a color can be chosen in the Scene tab. I've set it to green for you!`),
              ));
        }
      }
      let pe = 512,
        Ue = 512,
        mt = new Html("span").text(translate("Initializing")),
        wt = Modal.modal(translate("Animation Exporter"), mt, "body");
      function yt(Ur) {
        mt.text(Ur);
      }
      let tr = Te(),
        nn = Mr().actions.get(tr),
        Zr = Mr().mixer,
        uo = nn.getClip().duration / nn.timeScale;
      if (uo < 0.1) {
        (Modal.alert(translate("Error"), "This animation is too short to export."), closeModal(wt), (A = !1));
        return;
      }
      if (xe === 2 || xe === 3) {
        if (!(await Sre())) {
          (Modal.alert(
            translate("Error"),
            `Your browser does not support video encoding.
Please use a Chromium-based browser for the best experience.`,
          ),
            closeModal(wt),
            (A = !1));
          return;
        }
      }
      if (xe === 1) {
        if (!(await Ire())) {
          (Modal.alert(translate("Error"), "An unknown error occurred while loading the GIF exporter."),
            closeModal(wt),
            (A = !1));
          return;
        }
      }
      (Mr().actions.forEach((Ur) => Ur.stop().reset()),
        nn.stop().reset(),
        (nn.paused = !0),
        (nn.time = 0));
      let Us = 60;
      if (xe > 0) {
        let Ur = await getRendererSetting("customRenderVideoFps");
        if (Ur > 10) Us = Ur;
      }
      let ho = xe < 2 ? 50 : Us,
        Eo = 1 / ho,
        hs = Math.round(uo * ho);
      (Zr.setTime(0), (F.stopAnimating = !0), F.getRenderer().setSize(pe, Ue, !1));
      for (let Ur of F.animateRef) cancelAnimationFrame(Ur);
      (await new Promise((Ur) => setTimeout(Ur, 16.67)),
        nn.play(),
        (nn.paused = !1),
        (v = F.getScene()),
        (_ = v.getObjectByName("m-body-root")),
        (w = v.getObjectByName("f-body-root")));
      let Da = S(Boolean(F.mii.gender) ? w : _),
        Na = () => {
          (Zr.update(Eo),
            F.boneScaler.get(F.mii.gender).apply(F.scaleFactors, { x: 1, y: 1, z: 1 }),
            Da());
        };
      try {
        if (xe > 1) {
          let Ur = xe === 3,
            qi = F.getRenderer().domElement,
            fo = Ur ? "mp4" : "webm",
            Ko = Ur ? "video/mp4" : "video/webm",
            Mn = Ur ? new L3() : new i0(),
            ti = new C_({ format: Mn, target: new ah() }),
            zi = new x_(qi, { codec: Ur ? "avc" : "vp9", quality: new oh("high") });
          (ti.addVideoTrack(zi), await ti.start());
          let q = 0,
            be = 0;
          while (q < uo) {
            (Na(), F.getRenderer().render(F.getScene(), F.getCamera()));
            let Le = 1 / ho,
              Ee = be * Le,
              lt = be % (ho * 2) === 0 ? { keyFrame: !0 } : void 0;
            (await zi.add(Ee, Le, lt), be++, (q += Eo));
            let xt = (be / hs) * 100;
            if ((yt(translate("Rendering Video... %1", `${xt.toFixed(1)}%`)), be % 5 === 0))
              await new Promise((Rt) => setTimeout(Rt, 0));
          }
          (yt(translate("Finalizing Video... Please wait.")), zi.close(), await ti.finalize());
          let Oe = ti.target.buffer;
          if (Oe) {
            let Le = new Blob([Oe], { type: Ko });
            downloadBlob(Le, translate(`%1_custom_render_%2.${fo}`, e.nickname, /*@__PURE__*/ new Date().toJSON()));
          } else throw Error("Failed to generate video buffer.");
        } else if (xe === 1) {
          let Ur = new WebGLRenderTarget_2(pe, Ue, { format: fk, type: hk, depthBuffer: !0, stencilBuffer: !1 }),
            qi = Math.round(1000 / ho),
            fo = pe * Ue * 4,
            Ko = new Uint8Array(hs * fo),
            Mn = 0,
            ti = 0;
          while (ti < uo && Mn < hs) {
            (Na(),
              F.getRenderer().setRenderTarget(Ur),
              F.getRenderer().render(F.getScene(), F.getCamera()),
              F.getRenderer().setRenderTarget(null));
            let zi = new Uint8Array(fo);
            if (
              (F.getRenderer().readRenderTargetPixels(Ur, 0, 0, pe, Ue, zi),
              k5(zi, pe, Ue),
              Ko.set(zi, Mn * fo),
              Mn++,
              (ti += Eo),
              Mn % 5 === 0)
            ) {
              let q = ((Mn / hs) * 100).toFixed(1);
              (yt(translate("Rendering Frames... %1", `${q}%`)),
                await new Promise((be) => setTimeout(be, 0)));
            }
          }
          if ((Ur.dispose(), Mn < 5)) {
            Modal.alert(translate("Error"), "We couldn't save the animation. Please try again later.");
            return;
          }
          yt(translate("Encoding GIF... Please wait."));
          try {
            await new Promise((q) => setTimeout(q, 16));
            let zi = ck(Ko, pe, Ue, qi, Mn);
            if (zi && zi.byteLength > 0)
              downloadBlob(
                new Blob([zi.buffer], { type: "image/gif" }),
                translate("%1_custom_render_%2.gif", e.nickname, /*@__PURE__*/ new Date().toJSON()),
              );
            else throw Error("Unexpected empty gif output.");
          } catch (zi) {
            Modal.alert(translate("Error"), "We couldn't save the GIF. Please try again later.");
          }
        } else {
          let Ur = new WebGLRenderTarget_2(pe, Ue, { format: fk, type: hk, depthBuffer: !0, stencilBuffer: !1 }),
            qi = [],
            fo = 0,
            Ko = 0;
          while (Ko < uo) {
            (Na(),
              F.getRenderer().setRenderTarget(Ur),
              F.getRenderer().render(F.getScene(), F.getCamera()),
              F.getRenderer().setRenderTarget(null));
            let lt = new Uint8Array(pe * Ue * 4);
            (F.getRenderer().readRenderTargetPixels(Ur, 0, 0, pe, Ue, lt),
              k5(lt, pe, Ue),
              qi.push(lt),
              fo++,
              (Ko += Eo));
            let xt = (fo / hs) * 100;
            yt(translate("Rendering Frames... %1", `${xt.toFixed(1)}%`));
          }
          if ((Ur.dispose(), fo < 5)) {
            Modal.alert(translate("Error"), "We couldn't save the animation. Please try again later.");
            return;
          }
          yt(translate("Finalizing GIF... Please wait."));
          let Mn = [0, Math.floor(qi.length * 0.33), Math.floor(qi.length * 0.66), qi.length - 1],
            ti = pe * Ue * 4,
            zi = new Uint8Array(Mn.length * ti);
          Mn.forEach((lt, xt) => {
            zi.set(qi[lt], xt * ti);
          });
          let q = typeof re !== "string",
            be = q ? "rgba4444" : "rgb565",
            Oe = G1.quantize(zi, 256, { format: be, oneBitAlpha: q }),
            Le = G1.GIFEncoder(),
            Ee = 1000 / ho;
          for (let lt = 0; lt < qi.length; lt++) {
            let xt = G1.applyPalette(qi[lt], Oe, be);
            if (
              (Le.writeFrame(xt, pe, Ue, {
                palette: Oe,
                delay: Ee,
                repeat: 0,
                transparent: q,
                transparentIndex: q ? 0 : void 0,
              }),
              lt % 5 === 0)
            ) {
              let Rt = ((lt / qi.length) * 100).toFixed(1);
              (yt(translate("Encoding GIF... %1", `${Rt}%`)),
                await new Promise(($t) => setTimeout($t, 0)));
            }
          }
          Le.finish();
          let Je = Le.bytes();
          if (Je instanceof Uint8Array)
            downloadBlob(
              new Blob([Je.buffer], { type: "image/gif" }),
              translate("%1_custom_render_%2.gif", e.nickname, /*@__PURE__*/ new Date().toJSON()),
            );
          else Modal.alert("Error", "We couldn't save the GIF. Please try again later.");
        }
      } catch (Ur) {
        await Modal.alert(translate("Error"), "An unexpected error occurred while exporting.");
      } finally {
        ((F.stopAnimating = !1),
          (F.animateAction = F.animate.bind(F)),
          (F.animateRef = []),
          F.animateRef.push(requestAnimationFrame(F.animateAction)),
          F.resize(!1),
          closeModal(wt),
          (A = !1));
      }
    }
    let T = {
        fov: 15,
        pose: 0,
        expression: "0",
        renderWidth: 720,
        renderHeight: 720,
        animSpeed: 100,
      },
      M = e.exportHex("studioData"),
      C = getDefaultBodyModelName(),
      R = getCurrentShaderType(),
      B = 0;
    if (C === "baby") {
      const babyBodyModel = getBodyModels().get("baby");
      const babyPoseNames = [
        ...(babyBodyModel?.get(0)?.model?.animations ?? []),
        ...(babyBodyModel?.get(1)?.model?.animations ?? []),
      ]
        .map((animation) => animation.name)
        .filter((name) => /^Pose\.\d{2}$/.test(name));

      B = new Set(babyPoseNames).size;
    } else if (C in Ma) {
      B = Ma[C].count + 1;
    }
    let L = Array(B).fill(0),
      k = L.length + EXPRESSIONS.length,
      z = 0;
    c.text(`${z}/${k}`);
    function X() {
      (z++, c.text(`${z}/${k}`));
    }
    let G = L.map(async (xe, pe) => {
        let Ue;
        if (isSafari())
          await new Promise((Zr) => {
            setTimeout(() => {
              Zr();
            }, pe * 100);
          });
        let mt = await createMiiModel({
            data: e.export("studioData"),
            charModel: g,
            drawBody: !0,
            type: ViewType.AllBodySugar,
            expression: xe,
            pose: "Pose." + (pe + 1).toString().padStart(2, "0"),
            module: getFFLModule(),
            renderer: getSharedRenderer(),
            size: 300,
            additionalInfo: getAdditionalInfo(e),
            preferPromise: !0,
            ...(a ? { shaderType: a } : {}),
          }),
          wt = URL.createObjectURL(mt.result);
        var yt = new Image(360, 360);
        yt.src = wt;
        let tr = await new Promise((Zr) => {
          yt.onload = async () => {
            Zr(await $f(yt));
          };
        });
        if (!u.has(C)) u.set(C, []);
        (u.get(C).push(tr),
          (Ue = `<img class="lazy" width=130 height=160 style="padding:6px;object-fit:contain;" src="${tr}" title="Pose ${pe + 1}">`));
        let nn = { type: 0, value: String(pe + 1), icon: Ue, part: 0 };
        ((b.pose.items[pe + 1] = nn), X());
      }),
      Q = EXPRESSIONS.map(async (xe, pe) => {
        let Ue = "";
        if (isSafari())
          await new Promise((tr) => {
            setTimeout(() => {
              tr();
            }, pe * 100);
          });
        let mt = { type: 0, value: String(xe.id), icon: Ue, part: 0 };
        b.expression.items[pe] = mt;
        let wt = await createMiiModel({
            data: e.export("studioData"),
            charModel: g,
            drawBody: !1,
            type: ViewType.MakeIcon,
            expression: xe.id,
            module: getFFLModule(),
            renderer: getSharedRenderer(),
            size: 128,
            additionalInfo: getAdditionalInfo(e),
            preferPromise: !0,
            useExperimentalRenderer: !1,
            ...(a ? { shaderType: a } : {}),
          }),
          yt = URL.createObjectURL(wt.result);
        (d.push(yt),
          (Ue = `<img class="lazy" width=128 height=128 src="${yt}" title="${xe.name}">`),
          (mt.icon = Ue),
          X());
      });
    (await Promise.all(G),
      await Promise.all(Q),
      setTimeout(() => {
        closeModal(l);
      }, 500));
    let de = Modal.modal("Custom Render", "", "body", {
        text: "Cancel",
        canClose() {
          if (r) {
            if (!s) return !1;
          }
          return !0;
        },
        callback(xe) {
          if (r) {
            if (!s)
              return (
                Modal.alert(
                  translate("Warning"),
                  translate("Please save at least one render before leaving the tutorial!"),
                ),
                !1
              );
            gk();
          }
          (F.shutdown(), d.forEach((pe) => URL.revokeObjectURL(pe)), K.cleanup(), o());
        },
      }),
      oe = de.qs(".modal-body").classOn("responsive-row-lg").clear();
    de.qs(".modal-content").styleJs({
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      backgroundColor: "var(--container-solid)",
    });
    let K = new Html("div")
        .style({
          display: "flex",
          flex: "1",
          background: "var(--container-alt,var(--container-solid))",
          "border-radius": "12px",
          "flex-shrink": "0",
          height: "100%",
          overflow: "hidden",
          "justify-content": "center",
          "align-items": "center",
        })
        .appendTo(oe),
      ae = new Html("div").style({ "aspect-ratio": "1 / 1", height: "100%" }).appendTo(K),
      Z = new Html("div")
        .classOn("tab-content")
        .style({ flex: "1", height: "100%", overflow: "auto", gap: "0.5rem" })
        .appendTo(oe),
      F = new MiiViewer(e, ae.elm, 1, (xe) => {}),
      te,
      he = Math.PI / 8,
      re = !1;
    function le() {
      var xe = !1;
      if (
        ([ue, I, N, Y, P, H].forEach((pe) => {
          pe.classOff("primary");
        }),
        re !== !1)
      ) {
        let pe = re;
        switch (re) {
          case "green":
            ((pe = "#00ff00"), I.classOn("primary"));
            break;
          case "blue":
            ((pe = "#0000ff"), N.classOn("primary"));
            break;
          case "white":
            ((pe = "#ffffff"), Y.classOn("primary"));
            break;
          case "black":
            ((pe = "#000000"), P.classOn("primary"));
            break;
          default:
            ((xe = !0), H.classOn("primary"));
        }
        F.getScene().background = new Color_2(pe).convertLinearToSRGB();
      } else ((F.getScene().background = null), ue.classOn("primary"));
    }
    let ue = new Html("button")
        .classOn("primary")
        .text("Transparent")
        .on("pointerup", () => {
          ((re = !1), le());
        }),
      I = new Html("button").text("Green").on("pointerup", () => {
        ((re = "green"), le());
      }),
      N = new Html("button").text("Blue").on("pointerup", () => {
        ((re = "blue"), le());
      }),
      Y = new Html("button").text("White").on("pointerup", () => {
        ((re = "white"), le());
      }),
      P = new Html("button").text("Black").on("pointerup", () => {
        ((re = "black"), le());
      }),
      H = new Html("button")
        .appendMany(
          new Html("input")
            .attr({ type: "color", id: "crc" })
            .style({ margin: "0", padding: "0", border: "0", width: "32px", height: "21px" })
            .on("change", (xe) => {
              ((re = xe.target.value), le());
            }),
          new Html("label").attr({ for: "crc" }).text("Custom"),
        )
        .on("click", (xe) => {
          var pe = xe.target.querySelector("input");
          if (!pe) return;
          pe.click();
        });
    function W(xe, pe, Ue, ...mt) {
      let wt = new Html("div")
        .class("col")
        .style({
          width: "100%",
          "border-bottom": "2px solid var(--stroke)",
          "padding-bottom": "12px",
        })
        .appendMany(
          new Html("label").text(xe).style({ "align-self": "center" }),
          new Html("small").text(pe).style({ "text-align": "center" }),
          new Html("div").class(Ue === !0 ? "flex-group" : Ue).appendMany(...mt),
        );
      return (m.push(separatorGapThin(), { type: 5, html: wt }), wt);
    }
    if (!r)
      W(
        translate("Change Mii"),
        translate("Here you can quickly swap Miis."),
        !0,
        new Html("button").text(translate("Choose")).on("pointerup", async () => {
          let xe = await fetchLibrary(),
            pe = [];
          if (xe === null) ((xe = []), (pe = await fetchLibrary()));
          else pe = xe;
          let Ue = await openMiiPicker(
            pe,
            !0,
            translate("Choose a Mii to replace with."),
            (wt, yt, tr) =>
              new Promise((nn) => {
                if (tr) closeModal(tr);
                nn(wt);
              }),
            !0,
            !0,
          );
          if (!Ue) return;
          (F.shutdown(), d.forEach((wt) => URL.revokeObjectURL(wt)), K.cleanup(), closeModal(de));
          let mt = je();
          openCustomRenderDialog(Ue, mt).then((wt) => {
            n(wt);
          });
        }),
      );
    W(translate("Background"), translate("Choose a background color."), !0, ue, I, N, Y, P, H);
    let V = !0;
    function ne() {
      var xe = F.getScene();
      let pe = F.type;
      if (V) {
        if (xe.getObjectByName(`${pe}-body-root`))
          xe.getObjectByName(`${pe}-body-root`).visible = !0;
      } else if (xe.getObjectByName(`${pe}-body-root`))
        xe.getObjectByName(`${pe}-body-root`).visible = !1;
    }
    let J = new Html("button").text(translate("Enable")).on("click", () => {
        ((V = !0), ne(), J.classOn("primary"), U.classOff("primary"));
      }),
      U = new Html("button").text(translate("Disable")).on("click", () => {
        ((V = !1), ne(), J.classOff("primary"), U.classOn("primary"));
      });
    (J.classOn("primary"),
      U.classOff("primary"),
      W(translate("Show body"), translate("Toggle visibility of the Mii's body"), !0, J, U));
    let D = [];
    if (SETTINGS_SECTIONS[1]) {
      if (SETTINGS_SECTIONS[1].items) {
        if (SETTINGS_SECTIONS[1].items.shaderTypeN)
          SETTINGS_SECTIONS[1].items.shaderTypeN.choices.forEach((xe) => {
            var pe = new Html("button");
            if (
              (pe.text(xe.label()),
              pe.on("click", async () => {
                (D.forEach((mt) => {
                  mt.classOff("primary");
                }),
                  pe.classOn("primary"));
                let Ue = xe.value;
                ((F.shaderType = Ue),
                  await updatePaletteForShader(Ue),
                  setTimeout(() => {
                    ne();
                  }),
                  await F.updateMiiHead(0),
                  await F.updateBody(1),
                  ne());
              }),
              R === xe.value)
            )
              pe.classOn("primary");
            D.push(pe);
          });
      }
    }
    (W(
      translate("Shader Type"),
      translate("Choose a shader type. You can choose the default shading used in Settings."),
      !0,
      ...D,
    ),
      getAlternatePaletteSetting());
    let ee = new Html("button")
        .attr({ disabled: "true" })
        .text(translate("Look at camera"))
        .on("click", () => {
          if (F.bodyModel !== "miitomo") {
            Modal.alert(translate("Notice"), translate('This option is only supported on the "Miitomo" body type.'));
            return;
          }
          var xe = F.mii.gender;
          if (!F.charModel) return;
          let pe = F.getScene(),
            Ue = pe.getObjectByName("m-body-root"),
            mt = pe.getObjectByName("f-body-root"),
            wt = xe ? mt : Ue,
            yt = wt.getObjectByName("head") ?? wt.getObjectByName("Head");
          if (!yt) return;
          let tr = null,
            nn = ["Spine_1", "chest", "body"];
          for (let Mn of nn) {
            if (tr) continue;
            let ti = wt.getObjectByName(Mn);
            if (ti) {
              tr = ti;
              break;
            }
          }
          if (!tr) {
            let Mn = yt.parent;
            while (Mn && Mn !== wt) {
              let ti = Mn.name.toLowerCase();
              if (ti.includes("spine") || ti.includes("body") || ti.includes("chest")) {
                tr = Mn;
                break;
              }
              Mn = Mn.parent;
            }
          }
          let Zr = new Vector3_2();
          yt.getWorldPosition(Zr);
          let Qn = new Vector3_2().subVectors(F.getCamera().position, Zr).normalize(),
            uo = new Vector3_2(0, 0, 1),
            Us = new Quaternion_2();
          if (tr)
            switch ((tr.getWorldQuaternion(Us), F.bodyModel)) {
              default:
                uo.set(0, 0, 1);
                break;
            }
          else yt.parent.getWorldQuaternion(Us);
          let ho = Us.clone().invert(),
            Eo = Qn.clone().applyQuaternion(ho),
            hs = Math.PI / 2.5;
          if (uo.angleTo(Eo) > hs) {
            let Mn = new Vector3_2().crossVectors(uo, Eo).normalize(),
              ti = new Quaternion_2().setFromAxisAngle(Mn, hs);
            Eo.copy(uo).applyQuaternion(ti);
          }
          let Na = new Quaternion_2().setFromUnitVectors(uo, Eo),
            Ur = new Quaternion_2();
          yt.parent.getWorldQuaternion(Ur);
          let qi = Ur.clone().invert(),
            fo = Us.clone().multiply(Na),
            Ko = qi.multiply(fo);
          yt.quaternion.copy(Ko);
        }),
      Ae = new Html("button")
        .attr({ disabled: "true" })
        .text(translate("Turn towards camera"))
        .on("click", () => {
          if (F.bodyModel !== "miitomo") {
            Modal.alert(translate("Notice"), translate('This option is only supported on the "Miitomo" body type.'));
            return;
          }
          var xe = F.mii.gender;
          if (!F.charModel) return;
          let pe = F.getScene(),
            Ue = pe.getObjectByName("m-body-root"),
            mt = pe.getObjectByName("f-body-root"),
            wt = xe ? mt : Ue,
            yt = wt.getObjectByName("head") ?? wt.getObjectByName("Head");
          if (!yt) return;
          let tr = null;
          for (let Zr of ["Spine_1", "chest", "body"]) {
            if (tr) continue;
            let Qn = wt.getObjectByName(Zr);
            if (Qn) {
              tr = Qn;
              break;
            }
          }
          if (!tr) {
            let Zr = yt.parent;
            while (Zr && Zr !== wt) {
              let Qn = Zr.name.toLowerCase();
              if (Qn.includes("spine") || Qn.includes("body") || Qn.includes("chest")) {
                tr = Zr;
                break;
              }
              Zr = Zr.parent;
            }
          }
          function nn() {
            let Zr = Mr();
            if (Zr !== null && Zr !== void 0) {
              if (Zr.actions) Zr.actions.get(F.currentAnim).time += 0.00001;
              if (Zr.mixer) Zr.mixer.update(0);
            }
            let Qn = new Vector3_2(0, 0, 1),
              uo = Math.PI / 6,
              Us = Math.PI / 4,
              ho = new Vector3_2();
            yt.getWorldPosition(ho);
            let Eo = new Vector3_2().subVectors(F.getCamera().position, ho).normalize();
            if (tr && tr.parent) {
              let Ko = new Quaternion_2();
              tr.parent.getWorldQuaternion(Ko);
              let Mn = Ko.clone().invert(),
                ti = Eo.clone().applyQuaternion(Mn),
                zi = Math.min(Qn.angleTo(ti), uo),
                q = new Vector3_2().crossVectors(Qn, ti);
              if (q.lengthSq() > 0.000001)
                (q.normalize(),
                  tr.quaternion.copy(new Quaternion_2().setFromAxisAngle(q, zi)),
                  tr.updateMatrixWorld(!0));
            }
            yt.getWorldPosition(ho);
            let hs = new Vector3_2().subVectors(F.getCamera().position, ho).normalize(),
              Da = new Quaternion_2();
            yt.parent.getWorldQuaternion(Da);
            let Na = Da.clone().invert(),
              Ur = hs.clone().applyQuaternion(Na),
              qi = Math.min(Qn.angleTo(Ur), Us),
              fo = new Vector3_2().crossVectors(Qn, Ur);
            if (fo.lengthSq() > 0.000001)
              (fo.normalize(), yt.quaternion.copy(new Quaternion_2().setFromAxisAngle(fo, qi)));
          }
          (nn(),
            setTimeout(() => {
              nn();
            }),
            requestAnimationFrame(() => {
              nn();
            }));
        });
    W(
      translate("Miscellaneous options"),
      translate(`This may help with posing or getting a specific angle.
Combining these options together may be useful.
(Note: Set either Animation speed to 0x or pause the animation to use these options!!)`),
      !0,
      ee,
      Ae,
    );
    let Re = {};
    if ("isSwitchShader" in getShaderMaterialClass().prototype) Re.additionalInfo = getAdditionalInfo(e);
    if (e.personality === 24) Re = { ...Re, ...(isGhostMii(h, getAdditionalInfo(e)) ? { applyGhost: !0 } : {}) };
    if (e.eyeSclera === 1) self.eyeScleraHack = !0;
    if (e.eyeSclera === 1) self.eyeScleraHack = !1;
    let _e = createFeatureSet({
      mii: T,
      miiIsNotMii: !0,
      entries: b,
      onChange(xe, pe, Ue) {
        ((T = xe), Ke(), (Xt = Object.assign({}, T)));
      },
    })
      .style({ height: "auto" })
      .appendTo(Z);
    if (_e.qs(".tab-list")) _e.qs(".tab-list").style({ position: "sticky", top: "0" });
    let ot = !0;
    function tt() {
      if (ot === !0 && T.animSpeed > 0) ((ee.elm.disabled = !0), (Ae.elm.disabled = !0));
      else ((ee.elm.disabled = !1), (Ae.elm.disabled = !1));
    }
    function Qe() {
      if (
        (getBodyModels()
          .get(C)
          .forEach((xe) => {
            if (xe) {
              if (xe.actions)
                for (let [pe, Ue] of xe.actions)
                  if (ot === !0) ((Ue.paused = !1), (Ue.timeScale = T.animSpeed / 100), Ue.play());
                  else Ue.paused = !0;
            }
          }),
        ot === !0)
      )
        (He.text(translate("Pause Animation")), tt());
      else (He.text(translate("Play Animation")), tt());
    }
    let pt = new Html("div")
        .style({
          background: "var(--container)",
          "border-top": "1px solid var(--stroke-dim)",
          display: "flex",
          "flex-direction": "column",
          gap: "0.5rem",
          position: "sticky",
          bottom: "0",
        })
        .appendTo(Z),
      He = addButtonSounds(
        new Html("button")
          .text(ot ? translate("Pause Animation") : translate("Pause Animation"))
          .on("click", () => {
            if (ot === !0) ot = !1;
            else ot = !0;
            Qe();
          })
          .appendTo(pt),
      );
    function je() {
      let xe = new Vector3_2();
      return JSON.stringify({
        camera: {
          fov: T.fov,
          azimuth: F.getControls().azimuthAngle,
          polar: F.getControls().polarAngle,
          target: F.getControls().getTarget(xe),
          distance: F.getControls().distance,
          position: F.getCamera().position.toArray(),
          rotation: F.getCamera().rotation.toArray(),
          originalBodyScale: F.scaleFactors,
        },
        state: {
          animSpeed: T.animSpeed,
          animState: ot,
          bodyModel: C,
          expression: T.expression,
          pose: T.pose,
          poseTime: Mr().actions.get(Te()).time,
          shaderType: getShaderMaterialClass(),
          headQuat: F.headBone.quaternion.toArray(),
          showBody: V,
          bgColor: re,
        },
      });
    }
    new Html("div")
      .style({ display: "flex", gap: "0.5rem" })
      .appendMany(
        new Html("button")
          .style({ flex: "1" })
          .text(translate("Copy State"))
          .on("click", () => {
            copyTextToClipboard(je());
          }),
        new Html("button")
          .style({ flex: "1" })
          .text(translate("Paste State"))
          .on("click", async () => {
            let xe = await readClipboard();
            Bt(xe);
          }),
      )
      .appendTo(pt);
    async function Bt(xe) {
      let pe = JSON.parse(xe);
      if (!pe) return;
      if (pe.camera !== void 0) {
        if (pe.camera.fov !== void 0) {
          let Ue = parseFloat(pe.camera.fov);
          ((Ue = Math.min(27, Math.max(5, Ue))), (T.fov = Ue));
        }
        if (pe.camera.target !== void 0) {
          let Ue = pe.camera.target.y;
          if (pe.camera.originalBodyScale !== void 0)
            ((Ue -= pe.camera.originalBodyScale.y * 10.3), (Ue += F.scaleFactors.y * 10.3));
          F.getControls().setTarget(pe.camera.target.x, Ue, pe.camera.target.z, !1);
        }
        if (pe.camera.azimuth !== void 0)
          F.getControls().azimuthAngle = parseFloat(pe.camera.azimuth);
        if (pe.camera.polar !== void 0) F.getControls().polarAngle = parseFloat(pe.camera.polar);
        if (pe.camera.distance !== void 0) F.getControls().distance = pe.camera.distance;
      }
      if (pe.state !== void 0) {
        let Ue = !0;
        if (pe.state.bodyModel !== C)
          Ue = await Modal.prompt(
            translate("Body model differences"),
            translate(
              "The preset you're trying to import uses a different body model, so the pose will be different. Continue importing?",
            ),
            void 0,
            !0,
          );
        if (pe.state.pose !== void 0 && Ue === !0)
          T.pose = Math.max(0, Math.min(B, parseInt(pe.state.pose)));
        if (pe.state.expression !== void 0) T.expression = String(pe.state.expression);
        if (pe.state.animSpeed !== void 0) T.animSpeed = parseInt(pe.state.animSpeed);
        if ((Ke(), pe.state.poseTime !== void 0 && Ue === !0))
          Mr().actions.get(Te()).time = pe.state.poseTime;
        if (pe.state.animState !== void 0) ((ot = Boolean(pe.state.animState)), Qe());
        if (pe.state.shaderType !== void 0)
          ((F.shaderType = pe.state.shaderType),
            await Promise.all([F.updateBody(1), F.updateMiiHead(0)]).then(() => {
              ne();
            }));
        let mt = 0;
        if (
          (F.animators.set("z-d", (wt, yt) => {
            if (((mt += yt), ot === !1 || !(T.animSpeed > 0))) {
              if (pe.state.headQuat !== void 0) {
                let tr = new Quaternion_2();
                (tr.fromArray(pe.state.headQuat), F.headBone.quaternion.copy(tr));
              }
            }
            if (mt > 1) F.animators.delete("z-d");
          }),
          pe.state.showBody !== void 0)
        )
          ((V = Boolean(pe.state.showBody)), ne());
        if (pe.state.bgColor !== void 0) ((re = pe.state.bgColor), le());
      }
    }
    new Html("button").text(translate("Save Render")).on("click", ze).appendTo(pt);
    function ut() {
      let { width: xe, height: pe } = ae.elm.getBoundingClientRect();
      if (xe < 1024) xe = 1024;
      if (pe < 1024) pe = 1024;
      (F.resize(!1, xe, pe),
        (F.getRendererElement().style.height = "100%"),
        (F.getRendererElement().style.width = "unset"));
    }
    (window.addEventListener("resize", () => {
      ut();
    }),
      (te = F.getControls()));
    let et = F.getCamera(),
      It = 30;
    (te.addEventListener("update", () => {
      let xe = et.position.length();
      ((et.near = Math.max(0.1, xe - It)), (et.far = xe + It), et.updateProjectionMatrix());
    }),
      await getSetting("customRenderGreenScreen"));
    let Xt = {
      fov: 15,
      pose: 0,
      expression: "0",
      renderWidth: 720,
      renderHeight: 720,
      animSpeed: 1,
    };
    function Mr() {
      return F.bodyModels.get(F.mii.gender);
    }
    let Te = () =>
      T.pose === 0 ? F.getWaitAnimation() : "Pose." + String(T.pose || 1).padStart(2, "0");
    function Ke() {
      if (
        ((F.getCamera().fov = T.fov),
        F.getCamera().updateProjectionMatrix(),
        parseInt(Xt.expression) === (L[Xt.pose - 1] || 0) && Xt.expression === T.expression)
      )
        T.expression = String(L[T.pose - 1] || 0);
      if (Xt.expression !== T.expression)
        F.traverseAddFaceMaterial(
          F.getHead(),
          `&data=${encodeURIComponent(M)}&expression=${T.expression}&width=896&verifyCharInfo=0`,
        );
      let xe = EXPRESSIONS.find((mt) => mt.id === parseInt(T.expression));
      if (xe)
        if (typeof xe.modifier < "u")
          switch (xe.modifier) {
            case 0:
              F.getHead().traverse((mt) => {
                if (mt.isMesh !== !0) return;
                let wt = mt,
                  yt = wt.geometry.userData.modulateType;
                if (yt === 2 || yt === 7) wt.visible = !1;
                else wt.visible = !0;
              });
              break;
            case 1:
              F.getHead().traverse((mt) => {
                if (mt.isMesh !== !0) return;
                let wt = mt,
                  yt = wt.geometry.userData.modulateType;
                if (yt === 6 || yt === 2 || yt === 7) wt.visible = !1;
                else wt.visible = !0;
              });
              break;
          }
        else
          F.getHead().traverse((mt) => {
            if (mt.isMesh !== !0) return;
            let wt = mt;
            wt.visible = !0;
          });
      let pe = Te();
      if (Mr().actions.has(pe)) {
        if ((F.swapAnimation(pe), ot === !1)) Mr().actions.forEach((mt) => (mt.paused = !0));
      } else if ((F.swapAnimation("Wait"), ot === !1))
        Mr().actions.forEach((mt) => (mt.paused = !0));
      if ((F.updateBody(0), ne(), T.animSpeed < 0)) T.animSpeed = 0;
      if (T.animSpeed > 200) T.animSpeed = 200;
      let Ue = T.animSpeed / 100;
      ((F.currentAnimTimescale = Ue),
        tt(),
        F.bodyModels.forEach((mt) => {
          if (!mt) return;
          if ((mt.setTimescale(F.currentAnimTimescale), mt.actions.has(pe)))
            mt.actions.get(pe).timeScale = Ue;
        }));
    }
    if (
      ((F.getRendererElement().style.opacity = "0"),
      F.init().then(async () => {
        if (
          ((F.getCamera().fov = T.fov),
          F.getCamera().updateProjectionMatrix(),
          (F.getRendererElement().style.opacity = "0"),
          (F.getRendererElement().style.opacity = "1"),
          await F.updateMiiHead(),
          await F.updateBody(2),
          F.focusCamera(1, !0, !1),
          ot === !1)
        )
          Qe();
        (setTimeout(() => {
          if (t) Bt(t);
        }, 250),
          ae.append(F.getRendererElement()),
          F.resize(),
          F.getScene().traverse((xe) => {
            if (xe.isMesh !== !0) return;
            let pe = xe;
            pe.frustumCulled = !1;
          }),
          (window.scene = F));
      }),
      g)
    )
      g.dispose();
    let Ne = F.getRendererElement();
    if (r)
      await Modal.alert(
        translate("Notice"),
        translate(`Welcome to Custom Render!
Here, you can create and share renders using different poses, expressions and more!
Experiment with each option and find out what you like the most.`),
        "body",
        !1,
        !0,
      );
    function ze() {
      ((s = !0),
        ut(),
        Ne.toBlob((xe) => {
          let pe = new Image(Ne.width, Ne.height);
          ((pe.src = URL.createObjectURL(xe)),
            (pe.onload = () => {
              downloadURL(
                pe.src,
                translate("%1_custom_render_%2.png", e.nickname, /*@__PURE__*/ new Date().toJSON()),
              );
            }));
        }));
    }
  });
}
