// src/app/export/model-export.js
// 3D model export dialog and exporter.
//
// Defines: E_, Fre, Dre, Nre, openModelExportDialog, exportMiiModel, Pre, kre, Ure
// Uses from other files:
//   app/renderer/mii-model.js: getAdditionalInfo, getSharedRenderer, createMiiModel
//   app/assets/models.js: jp, getBodyModels, getDefaultBodyModelName
//   app/export/model-export-utils.js: Ma, YD, Bb
//   app/items/item-lists.js: HAT_MODEL_INFO, getOutfitNames
//   app/renderer/texture-compositing.js: SL, OL
//   app/shaders/shader-registry.js: getRendererSetting, getShaderMaterialClass
//   app/util/download.js: downloadBlob, downloadBinary
//   app/ui/html.js: Html
//   app/i18n/localization.js: getTranslator
//   app/util/random.js: range
//   app/ui/modal.js: Modal
//   app/renderer/three-module.js: getTHREE
//   … and 7 more files

var translate = getTranslator(),
  E_;
var Fre = [
    { id: String(0), item: translate("Head only") },
    { id: String(1), item: translate("Head (No hat)") },
    { id: String(2), item: translate("Head (Hat cutout)") },
    { id: String(3), item: translate("Head (Face only)") },
    { id: String(4), item: translate("Head (Bald)") },
    { id: String(5), item: translate("Whole body") },
    { id: String(6), item: translate("Face only (texture)") },
  ],
  Dre = {
    [0]: "%1_head_%2.glb",
    [1]: "%1_head_no_hat_%2.glb",
    [2]: "%1_head_hat_%2.glb",
    [3]: "%1_head_faceonly_%2.glb",
    [4]: "%1_head_skinhead_%2.glb",
    [5]: "%1_all_body_%2.glb",
    [6]: "%1_mask_%2.glb",
  },
  Nre = [
    { id: String("wii"), item: translate("Wii") },
    { id: String("wiiu"), item: translate("Wii U") },
    { id: String("switch"), item: translate("Switch") },
    { id: String("miitomo"), item: translate("Miitomo") },
    { id: String("streetpass"), item: translate("StreetPass") },
  ],
  yk = !1;
async function openModelExportDialog(e, t) {
  let r = getTHREE(),
    n = await getRendererSetting("bodyModelN");
  function i(F) {
    if (F.target.closest(".popup-overlay") === null)
      Html.qsa(".popup-overlay") !== null && Html.qsa(".popup-overlay").forEach((te) => te.cleanup());
  }
  document.addEventListener("pointerdown", i);
  let o = Modal.modal(
      translate("Create 3D model"),
      translate("Please wait a moment..."),
      "body",
      {
        text: "Cancel",
        type: "danger",
        callback() {
          (document.removeEventListener("pointerdown", i), p.forEach((F) => F.dispose()));
        },
      },
      {
        text: translate("Export"),
        type: "primary",
        async callback() {
          (document.removeEventListener("pointerdown", i), p.forEach((he) => he.dispose()));
          let F = /*@__PURE__*/ new Date(),
            te = new Date(F.getTime() - F.getTimezoneOffset() * 60000);
          if (t && t.length > 0) {
            let he = new JSZip.default(),
              re = [e, ...t];
            for (let le = 0; le < re.length; le++) {
              let ue = `Uh oh ${le}`,
                I = `UHH-${le}`;
              try {
                let N = await exportMiiModel(m, re[le], void 0, m.main.exportMode === "animation" ? m.main.animation : null);
                if (N.name) I = N.name;
                if (N.data) ue = N.data;
              } catch (N) {}
              he.file(I, ue, { date: te });
            }
            await he.generateAsync({ type: "blob" }).then(function (le) {
              downloadBlob(le, `mii-creator-3d-models-${/*@__PURE__*/ new Date().toJSON()}.zip`);
            });
          } else
            try {
              let he = await exportMiiModel(m, e, c, m.main.exportMode === "animation" ? m.main.animation : null);
              if (!he?.data) throw new Error("The exporter returned no GLB data.");
              downloadBinary(he.data, he.name);
            } catch (he) {
              console.error("Mii GLB export failed:", he);
              Modal.alert(
                translate("Export failed"),
                String(he?.message || he || "Unknown GLB export error"),
                "body",
              );
            }
          if ((jp(n), !yk))
            (Modal.alert(
              translate("Notice"),
              translate(`Sometimes you may encounter issues when using the 3D export feature.
If the download does not start, there is a known solution that sometimes works:
Try changing something in your settings and downloading again.

This message will only appear once this session.`),
              "body",
              !0,
              !0,
            ),
              (yk = !0));
        },
      },
    ),
    s = o.qs("button.primary");
  if (s) ((s = Html.from(s.elm.parentElement)), s.style({ display: "none" }));
  if (e.eyeSclera) window.eyeScleraHack = !0;
  let a = getShaderMaterialClass(),
    l = range(82),
    c = await getFFLModule().createFace(
      e,
      getSharedRenderer(),
      null,
      256,
      a,
      e.hatType > -1 ? (HAT_MODEL_INFO[e.hatType].mdlType === 1 ? 2 : 0) : 0,
      l,
      !1,
      void 0,
    ),
    u = o.qs(".modal-body").classOn("modal-scroll"),
    d = () => ({ id: "t-pose-" + n, model: n, idNumerical: -1 }),
    h = [
      { model: null, id: "separator", idNumerical: -1 },
      { model: "wii", id: "t-pose-wii", idNumerical: -1 },
      ...range(Ma.wii.count).map((F) => ({ model: "wii", id: "wii" + (F + 1), idNumerical: F + 1 })),
      { model: null, id: "separator", idNumerical: -1 },
      { model: "wiiu", id: "t-pose-wiiu", idNumerical: -1 },
      ...range(Ma.wiiu.count).map((F) => ({
        model: "wiiu",
        id: "wiiu" + (F + 1),
        idNumerical: F + 1,
      })),
      { model: null, id: "separator", idNumerical: -1 },
      { model: "switch", id: "t-pose-switch", idNumerical: -1 },
      ...range(Ma.switch.count).map((F) => ({
        model: "switch",
        id: "switch" + (F + 1),
        idNumerical: F + 1,
      })),
      { model: null, id: "separator", idNumerical: -1 },
      { model: "miitomo", id: "t-pose-miitomo", idNumerical: -1 },
      ...range(Ma.miitomo.count).map((F) => ({
        model: "miitomo",
        id: "miitomo" + (F + 1),
        idNumerical: F + 1,
      })),
      { model: null, id: "separator", idNumerical: -1 },
      { model: "streetpass", id: "t-pose-streetpass", idNumerical: -1 },
      ...range(Ma.streetpass.count).map((F) => ({
        model: "streetpass",
        id: "streetpass" + (F + 1),
        idNumerical: F + 1,
      })),
    ],
    f = h.map((F) => ({
      id: F.id,
      item:
        F.id !== "separator"
          ? F.id.includes("t-pose")
            ? translate(`T-pose (${F.model})`)
            : F.model !== null
              ? `<img style='height:64px' src='./assets/images/poses/${F.model}/${String(F.idNumerical).padStart(2, "0")}.png'>`
              : "???"
          : "<hr>",
      ...(F.id === "separator" && { type: "separator" }),
    })),
    p = [];
  for (let F in EXPRESSIONS) {
    let te = await createMiiModel({
        data: e.export("studioData"),
        charModel: c,
        drawBody: !1,
        type: ViewType.MakeIcon,
        expression: EXPRESSIONS[F].id,
        module: getFFLModule(),
        renderer: getSharedRenderer(),
        size: 96,
        additionalInfo: getAdditionalInfo(e),
      }),
      he = URL.createObjectURL(te.result);
    p.push({
      url: he,
      dispose() {
        URL.revokeObjectURL(he);
      },
      name: EXPRESSIONS[F].name,
      id: EXPRESSIONS[F].id,
    });
  }
  let g = p
      .map((F) => ({
        id: String(F.id),
        item: `<img width=96 height=96 src="${F.url}" title="${F.name}" style="margin:-10px;pointer-events:none">`,
      }))
      .filter((F) => F !== void 0),
    animationClips = getBodyModels().get(n)?.get(e.gender === 0 ? 0 : 1)?.clips,
    defaultAnimation = animationClips?.has("Finish")
      ? "Finish"
      : animationClips?.has("Pose.01")
        ? "Pose.01"
        : animationClips?.keys().next().value || "Pose.01",
    m = {
      main: { type: 5, pose: d(), bodyModel: n, expression: 0, exportMode: "pose", animation: defaultAnimation },
      extras: {
        attachHead: !1,
        clothes: -1,
        unsetScale: !1,
        colorFix: !1,
        downscaleModel: !0,
        fixMirrorWrapping: !1,
      },
    },
    A = {
      main: {
        main: translate("Main"),
        type: translate("Model type"),
        pose: translate("Pose"),
        bodyModel: translate("Body model"),
        expression: translate("Expression"),
        exportMode: translate("Export mode"),
        animation: translate("Animation"),
      },
      extras: {
        extras: translate("Extras"),
        attachHead: translate("Weight-paint head"),
        attachHeadText: translate(`Rigs the head model to the head bone, instead of parenting it.
Can help in some programs (i.e. game engines).`),
        clothes: translate("Outfit override"),
        clothesText: translate("Select outfit type to override."),
        unsetScale: translate("Reset scale"),
        unsetScaleText: translate("Set scale of body to 1.0."),
        downscaleModel: translate("Scale down model"),
        downscaleModelText: translate(
          "Set the model to 0.014x scale as to not be too large in some 3D software.",
        ),
        fixMirrorWrapping: translate("Fix mirror wrapping"),
        fixMirrorWrappingText: translate(
          "This may fix texture issues in some programs (i.e. game engines).",
        ),
      },
    },
    y = o.qs(".modal-body .flex-group").elm,
    x = new Html("div"),
    b = new Html("div").class("col").appendTo(x);
  new Html("hr").style({ margin: "1rem 0", "border-color": "var(--stroke)" }).appendTo(x);
  let v = new Html("div").class("col").appendTo(x),
    _ = null,
    w = null,
    S = null,
    E = null,
    T = null,
    M = null,
    C = null,
    R = null,
    P0 = null,
    P1 = null,
    P2 = null,
    B = new Html("div").class("input-group").appendTo(b);
  (B.append(new Html("span").text(A.main.type)),
    createDropdown(
      B,
      Fre,
      (F) => {
        let te = parseInt(F);
        switch (((m.main.type = te), m.main.type)) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 6:
            (S.style({ display: "none" }),
              E.style({ display: "none" }),
              z.style({ display: "none" }),
              T.style({ display: "none" }),
              M.style({ display: "none" }),
              C.style({ display: "none" }),
              R.style({ display: "none" }),
              P0.style({ display: "none" }),
              P1.style({ display: "none" }),
              P2.style({ display: "none" }));
            break;
          case 5:
            (S.style({ display: "flex" }),
              E.style({ display: "flex" }),
              z.style({ display: "flex" }),
              T.style({ display: "flex" }),
              M.style({ display: "flex" }),
              C.style({ display: "flex" }),
              R.style({ display: "flex" }),
              P0.style({ display: "flex" }),
              P1.style({ display: m.main.exportMode === "pose" ? "flex" : "none" }),
              P2.style({ display: m.main.exportMode === "animation" ? "flex" : "none" }));
            break;
        }
      },
      String(m.main.type),
      "180px",
      "?",
      void 0,
      !0,
    ));
  let L = new Html("div").class("input-group").appendTo(b);
  (L.append(new Html("span").text(A.main.expression)),
    createDropdown(
      L,
      g,
      (F) => {
        let te = parseInt(F);
        m.main.expression = te;
      },
      String(m.main.expression),
      "180px",
      "?",
    ));
  function k(F) {
    if ((_(F), F === "miitomo")) (C.style({ display: "flex" }), R.style({ display: "flex" }));
    else (C.style({ display: "none" }), R.style({ display: "none" }));
  }
  let z = new Html("div").class("input-group").appendTo(b);
  (z.append(new Html("span").text(A.main.bodyModel)),
    createDropdown(
      z,
      Nre,
      (F) => {
        let te = h.findIndex((re) => re.id === m.main.pose.id);
        if (te === -1) return;
        let he = h[te];
        if (((m.main.bodyModel = F), he.id !== "t-pose" && he.model !== F)) m.main.pose = he;
        if (F === "miitomo") (C.style({ display: "flex" }), R.style({ display: "flex" }));
        else (C.style({ display: "none" }), R.style({ display: "none" }));
      },
      String(m.main.bodyModel),
      "180px",
      "?",
      (F) => {
        _ = (te) => {
          F(te);
        };
      },
    ),
    (P0 = new Html("div").class("input-group").appendTo(b)),
    P0.append(new Html("span").text(A.main.exportMode)),
    createDropdown(
      P0,
      [
        { id: "pose", item: translate("Static pose") },
        { id: "animation", item: translate("Animated GLB") },
      ],
      (F) => {
        m.main.exportMode = F;
        P1.style({ display: F === "pose" ? "flex" : "none" });
        P2.style({ display: F === "animation" ? "flex" : "none" });
      },
      m.main.exportMode,
      "180px",
    ),
    (P1 = new Html("div").class("input-group").appendTo(b)),
    P1.append(new Html("span").text(A.main.pose)),
    createDropdown(
      P1,
      f,
      (F) => {
        let te = h.find((re) => re.id === F);
        if (te && te.id !== "separator") m.main.pose = te;
      },
      m.main.pose.id,
      "180px",
      "?",
    ),
    (P2 = new Html("div").class("input-group").appendTo(b)),
    P2.append(new Html("span").text(A.main.animation)),
    createDropdown(
      P2,
      (() => {
        let F = animationClips ? Array.from(animationClips.keys()) : [];
        if (!F.length) F = ["Pose.01"];
        return [
          ...F.map((he) => ({ id: he, item: he })),
          { id: "__all__", item: translate("All animations (single GLB)") },
        ];
      })(),
      (F) => {
        m.main.animation = F;
      },
      defaultAnimation,
      "180px",
    ),
    P1.style({ display: "flex" }),
    P2.style({ display: "none" }),
    (S = new Html("div").class("flex-group").style({ "justify-content": "flex-start" }).appendTo(v)));
  let X = Math.random();
  (S.appendMany(
    new Html("input")
      .attr({ type: "checkbox", id: X, ...(m.extras.attachHead && { checked: !0 }) })
      .on("change", (F) => {
        let te = F.target.checked;
        m.extras.attachHead = te;
      }),
    new Html("label").attr({ for: X }).text(A.extras.attachHead),
  ),
    (E = new Html("small")
      .style({ margin: "-12px 0 -6px 0" })
      .text(A.extras.attachHeadText)
      .appendTo(v)),
    (C = new Html("div").class("input-group").style({ height: "26px" }).appendTo(v)),
    C.append(new Html("span").text(A.extras.clothes)),
    createDropdown(
      C,
      [
        { id: "-1", item: translate("Disabled") },
        ...range(getOutfitNames().length).map((F) => ({ id: String(F), item: getOutfitNames()[F] })),
      ],
      (F) => {
        let te = parseInt(F);
        m.extras.clothes = te;
      },
      "-1",
      "180px",
    ).style({ position: "relative", top: "10px" }),
    (R = new Html("small").style({ margin: "-12px 0 -6px 0" }).text(A.extras.clothesText).appendTo(v)),
    (T = new Html("div").class("flex-group").style({ "justify-content": "flex-start" }).appendTo(v)));
  let Q = Math.random();
  (T.appendMany(
    new Html("input")
      .attr({ type: "checkbox", id: Q, ...(m.extras.unsetScale && { checked: !0 }) })
      .on("change", (F) => {
        let te = F.target.checked;
        m.extras.unsetScale = te;
      }),
    new Html("label").attr({ for: Q }).text(A.extras.unsetScale),
  ),
    (M = new Html("small")
      .style({ margin: "-12px 0 -6px 0" })
      .text(A.extras.unsetScaleText)
      .appendTo(v)));
  let de = new Html("div").class("flex-group").style({ "justify-content": "flex-start" }).appendTo(v),
    oe = Math.random();
  (de.appendMany(
    new Html("input")
      .attr({ type: "checkbox", id: oe, ...(m.extras.downscaleModel && { checked: !0 }) })
      .on("change", (F) => {
        let te = F.target.checked;
        m.extras.downscaleModel = te;
      }),
    new Html("label").attr({ for: oe }).text(A.extras.downscaleModel),
  ),
    v.append(new Html("small").style({ margin: "-12px 0 -6px 0" }).text(A.extras.downscaleModelText)));
  let K = new Html("div").class("flex-group").style({ "justify-content": "flex-start" }).appendTo(v),
    ae = Math.random();
  if (
    (K.appendMany(
      new Html("input")
        .attr({ type: "checkbox", id: ae, ...(m.extras.fixMirrorWrapping && { checked: !0 }) })
        .on("change", (F) => {
          let te = F.target.checked;
          m.extras.fixMirrorWrapping = te;
        }),
      new Html("label").attr({ for: ae }).text(A.extras.fixMirrorWrapping),
    ),
    v.append(
      new Html("small").style({ margin: "-12px 0 -6px 0" }).text(A.extras.fixMirrorWrappingText),
    ),
    o.qs(".modal-body").elm.insertBefore(x.elm, y),
    o.qs(".modal-body span").text(translate("Configure 3D model export options.")),
    s)
  )
    s.style({ display: "flex" });
}
function exportMiiModel(e, t, r, animationName, i) {
  return new Promise(async (o, reject) => {
    let s = await getRendererSetting("modelExportTexResolution");
    if (((s = Number(s)), isNaN(s))) s = 1024;
    let a = await getRendererSetting("modelExportMaterialType"),
      l = 1,
      c = 1,
      u = !1;
    switch (a) {
      case "flat":
        ((u = !0), (l = 1), (c = 0.5));
        break;
      case "simple":
        ((l = 0.25), (c = 0.75));
        break;
      case "shiny":
        ((l = 0.25), (c = 0.5));
        break;
      case "bright":
        ((l = 0), (c = 0.5));
        break;
    }
    let d = getTHREE(),
      h = getSharedRenderer();
    if (h.getContext()?.isContextLost()) h.forceContextRestore();
    if (e.main.type === 6) {
      let S = await Bb(t, getSharedRenderer(), e.main.expression, s),
        E = S.img,
        T = document.createElement("canvas");
      ((T.width = s), (T.height = s));
      let M = T.getContext("2d"),
        C = E.image.data,
        R = E.type,
        B = M.createImageData(s, s),
        L = B.data;
      if (R === d.UnsignedByteType) for (let k = 0; k < L.length; k++) L[k] = C[k];
      else if (R === d.FloatType)
        for (let k = 0; k < L.length; k++) L[k] = Math.min(255, Math.max(0, C[k] * 255));
      else return;
      if (
        (M.putImageData(B, 0, 0),
        T.toBlob(function (k) {
          downloadBlob(k, translate("%1_render_face_%2.png", t.nickname, /*@__PURE__*/ new Date().toJSON()));
        }, "image/png"),
        S.model)
      )
        S.model.dispose();
      return;
    }
    if (r !== void 0) r.dispose();
    if (t.eyeSclera) window.eyeScleraHack = !0;
    let f = 0;
    var { hairType: p, hatType: g } = t;
    if (e.main.type > 0 && e.main.type < 5)
      switch (e.main.type) {
        case 1:
          t.hatType = -1;
          break;
        case 2:
          ((f = 2), (t.hatType = -1));
          break;
        case 3:
          f = 3;
          break;
        case 4:
          t.hairType = 30;
          break;
      }
    let m = t.hairFlip;
    if (e.extras.attachHead && t.hairFlip === 1) t.hairFlip = 0;
    let A = await getFFLModule().createFace(
      t,
      getSharedRenderer(),
      null,
      s,
      d.MeshStandardMaterial,
      f === 0 ? (t.hatType > -1 ? (HAT_MODEL_INFO[t.hatType].mdlType === 1 ? 2 : 0) : 0) : f,
      e.main.expression,
      !1,
      void 0,
    );
    ((t.hairFlip = m),
      (t.hairType = p),
      (t.hatType = g),
      jp(e.main.bodyModel),
      await new Promise((S) => {
        setTimeout(() => {
          S();
        }, 10);
      }));
    let y = getAdditionalInfo(t);
    y.outfitType = e.extras.clothes === -1 ? t.outfitType : e.extras.clothes;
    let x = getBodyModels().get(e.main.bodyModel),
      b = null;
    if (x) {
      if (((b = x.has(t.gender === 0 ? 0 : 1) ? x.get(t.gender === 0 ? 0 : 1) : null), b)) {
        if (b.unBindPose) b.unBindPose();
      }
    }
    let v = await createMiiModel({
      data: t.exportHex("studioData"),
      drawBody: e.main.type === 5,
      expression: e.main.expression,
      module: getFFLModule(),
      renderer: h,
      type: 0,
      isTemporary: !1,
      additionalInfo: y,
      texResolution: s,
      bodyModelType: e.main.bodyModel,
      shaderType: "three_standard",
      charModel: A,
      for3DExport: !0,
      for3DExportClone: !1,
      ignoreBodyScale: e.extras.unsetScale,
      pose: e.main.pose.id.includes("t-pose")
        ? "t"
        : "Pose." + e.main.pose.idNumerical.toString().padStart(2, "0"),
      textureBake: !0,
    });
    OL(A, getSharedRenderer());
    let _ = new ResourceTracker();
    if (
      (v.headModel.traverse((S) => {
        if (S.isMesh) {
          let E = S;
          if (E.geometry.name === "") E.geometry.name = E.name;
          if (E.geometry.userData) {
            if (E.geometry.userData.modulateMode !== void 0) {
              if (typeof E.geometry.userData.doNotDequantize > "u") {
                if ((YD(E.geometry), E.geometry.userData.modulateMode > 1))
                  E.geometry.userData.modulateMode = 1;
              }
              if (E.material) {
                let T = E.material,
                  M = E.material.map,
                  C = "",
                  R = "";
                switch (E.geometry.userData.modulateType) {
                  case 0:
                    ((C = "FclTex"), (R = "Faceline"));
                    break;
                  case 1:
                    R = "Beard";
                    break;
                  case 2:
                    R = "Nose";
                    break;
                  case 3:
                    R = "Forehead";
                    break;
                  case 4: {
                    if (((C = "HairTex"), (R = "Hair"), t.hairTipColor > -1)) {
                      let X = function (de) {
                          let oe = [0, 1.5, 1, 0.5, 0, -0.5, -1, -1.5];
                          if (!k) k = new d.Vector3(-0.2, 0.7, 0.2);
                          k.x = oe[de % oe.length];
                        },
                        G = function (de) {
                          let oe = [0, -0.5, -0.25, -0.1, 0, 0.1, 0.25, 0.5];
                          if (!k) k = new d.Vector3(-0.2, 0.7, 0.2);
                          k.z = oe[de % oe.length];
                        },
                        B = Math.max(Math.min(t.hairColor, 99), 0),
                        L = Math.max(Math.min(t.hairTipColor, 99), 0),
                        k = new d.Vector3(-0.2, 0.7, 0.2),
                        z = 45;
                      if (t.hatType > -1) {
                        if (HAT_MODEL_INFO[t.hatType].mdlType === 1) z = 39;
                      }
                      (X(t.hairTipX), G(t.hairTipY));
                      let Q = SL(E, new d.Vector3(...COMMON_COLOR_TABLE[B]), new d.Vector3(...COMMON_COLOR_TABLE[L]), k, z);
                      ((E.geometry = Q.geometryWithUVs),
                        (T.map = Q.texture),
                        (T.color = new d.Color(16777215)),
                        (T.modulateMode = 1),
                        (E.geometry.userData.modulateMode = 1));
                    }
                    break;
                  }
                  case 5:
                    ((C = "CapTex"), (R = "Cap"));
                    break;
                  case 6:
                    ((C = "MaskTex"), (R = "Mask"));
                    break;
                  case 7:
                    ((C = "NslTex"), (R = "Noseline"));
                    break;
                  case 8:
                    ((C = "GlassTex"), (R = "Glass"));
                    break;
                  default:
                    ((C = M.name), (R = T.name));
                    break;
                }
                if (E.material.map) E.material.map.name = C;
                ((T.name = R), (E.name = R));
              }
            }
          }
        }
      }),
      _.track(v.miiGroup),
      (v.headModel.name = "headModel"),
      (v.headModel.children[0].name = "miiHead"),
      v.headModel.children[1])
    )
      v.headModel.children[1].name = "miicHat";
    if (e.main.type === 5)
      ((v.bodyModel.name = "bodyModel"),
        (v.bodyModelBody.name = "bodyModelBody"),
        (v.bodyModelLegs.name = "bodyModelLegs"));
    if (((v.miiGroup.name = "miiGroup"), e.main.type === 5)) {
      let S = Pre(v.miiGroup, v.boneScaler, translate("%1 (Full-body)", t.nickname));
      if (S) ((v.miiGroup = S[0]), (v.miiGroup.msh = S[1]), (v.miiGroup.isWindow = !0));
      let E = v.miiGroup.getObjectByName("head");
      if (E === void 0) E = v.miiGroup.getObjectByName("Head");
      if (E === void 0) throw "Couldn't find head bone.";
      E.attach(v.headModel);
    } else ((v.miiGroup = v.headModel), (v.headModel.name = translate("%1 (Head)", t.nickname)));
    if (
      e.main.type === 5 &&
      !(e.main.exportMode === "pose" && e.main.pose.id.includes("t-pose"))
    ) {
      let S = v.miiGroup,
        E = new d.AnimationMixer(S),
        poseClipName =
          e.main.exportMode === "pose"
            ? "Pose." + e.main.pose.idNumerical.toString().padStart(2, "0")
            : "Pose.01",
        T = b.clips.get(poseClipName) || b.clips.get("Pose.01"),
        M = _k(T, "skl_root", "nw4f_root"),
        C = E.clipAction(M);
      if ((C.play(), (C.timeScale = 0), (C.time = 0), E.update(0), e.main.bodyModel)) {
        let R = "nw4f_root",
          B = "Skl_Root",
          L = 0;
        switch (e.main.bodyModel) {
          case "wii": {
            ((R = "all_root"), (B = "skl_root"), (L = Math.PI / 2));
            break;
          }
          case "wiiu": {
            ((R = "all_root"), (B = "skl_root"), (L = Math.PI));
            break;
          }
          case "switch": {
            ((R = "TopL"), (B = "skl_root"), (L = Math.PI / 2));
            break;
          }
          case "streetpass": {
            ((R = "rootPs"), (B = "bodyPs"), (L = Math.PI / 2));
            break;
          }
        }
        let k = S.getObjectByName(R),
          z = S.getObjectByName(B);
        if (k && L !== 0) (k.rotateX(L), k.updateMatrix());
        S.updateMatrixWorld(!0);
        let G = new d.Box3().setFromObject(S).min.y,
          Q = G < 0 ? Math.abs(G) : 0,
          de = new d.Vector3();
        z.getWorldPosition(de);
        let oe = de.clone();
        oe.y += Q;
        let K = oe.clone();
        z.parent.worldToLocal(K);
        let ae = _k(T, "skl_root", "nw4f_root", K);
        if (
          (E.uncacheClip(M),
          (E = new d.AnimationMixer(S)),
          (C = E.clipAction(ae)),
          C.play(),
          (C.timeScale = 0),
          (C.time = 0),
          E.update(0),
          k)
        ) {
          if ((k.position.set(0, 0, 0), L !== 0)) (k.rotateX(L), k.updateMatrix());
        }
        (S.updateMatrixWorld(!0),
          S.traverse((Z) => {
            if (Z.isSkinnedMesh) {
              let F = Z;
              (F.updateMatrixWorld(!0), F.bind(F.skeleton, new d.Matrix4().identity()));
            }
          }),
          S.updateMatrixWorld(!0));
      }
    }
    if (
      (v.miiGroup.traverse((S) => {
        let E = S;
        if (E.isMesh) {
          let T = E.material;
          if (T.map) {
            if (E.geometry.userData) {
              if (E.geometry.userData.modulateType) {
                if (E.geometry.userData.modulateType === 10)
                  ((T.map.minFilter = 1006), (T.map.magFilter = 1006));
              }
            }
          }
          if (u)
            ((E.material = new d.MeshPhysicalMaterial({
              map: T.map,
              color: new d.Color(0),
              roughness: 1,
              metalness: 0,
              emissive: T.color,
              emissiveMap: T.map,
              emissiveIntensity: 1,
              transparent: T.transparent,
              opacity: T.opacity,
              ior: 1,
            })),
              (E.material.userData = { gltfExtensions: { KHR_materials_ior: { ior: 1 } } }));
          else if (!T.isMeshStandardMaterial)
            ((E.material = new d.MeshStandardMaterial({
              color: T.color,
              roughness: c,
              metalness: l,
              map: T.map,
              transparent: T.transparent,
            })),
              T.dispose());
          else ((T.roughness = c), (T.metalness = l));
        }
      }),
      e.extras.fixMirrorWrapping)
    ) {
      let S = v.headModel,
        E = /*@__PURE__*/ new Set(),
        T = S.getObjectByName("Faceline");
      if (T && T.isMesh)
        (W6(T.geometry),
          E.add(T.geometry.uuid),
          (Array.isArray(T.material) ? T.material : [T.material]).forEach((R) => {
            if (R && "map" in R && R.map) {
              let B = R.map;
              ((B.wrapS = d.MirroredRepeatWrapping),
                (B.wrapT = d.MirroredRepeatWrapping),
                (B.needsUpdate = !0));
            }
          }));
      let M = S.getObjectByName("Glass");
      if (M && M.isMesh && M.material)
        ((Array.isArray(M.material) ? M.material : [M.material]).forEach((R) => {
          if (R && "map" in R && R.map) {
            let B = kre(R.map);
            if (B) R.map = B;
          }
        }),
          Ure(M.geometry),
          E.add(M.geometry.uuid));
      if (v.hatModel)
        v.hatModel.traverse((C) => {
          if (C && C.isMesh && C.material) {
            if (!E.has(C.geometry.uuid)) {
              let B = W6(C.geometry);
              E.add(C.geometry.uuid);
            }
            (Array.isArray(C.material) ? C.material : [C.material]).forEach((B) => {
              if (B && "map" in B && B.map)
                ((B.map.wrapS = d.RepeatWrapping),
                  (B.map.wrapT = d.RepeatWrapping),
                  (B.map.needsUpdate = !0));
            });
          }
        });
      if (v.miiGroup.isWindow && Array.isArray(v.miiGroup.msh))
        v.miiGroup.msh.forEach((C) => {
          if (C && C.isMesh) {
            if (!E.has(C.geometry.uuid)) {
              let B = W6(C.geometry);
              E.add(C.geometry.uuid);
            }
            (Array.isArray(C.material) ? C.material : [C.material]).forEach((B) => {
              if (B && "map" in B && B.map)
                ((B.map.wrapS = d.RepeatWrapping),
                  (B.map.wrapT = d.RepeatWrapping),
                  (B.map.needsUpdate = !0));
            });
          }
        });
      await new Promise((C) => {
        setTimeout(() => {
          C();
        }, 10);
      });
    }
    if (i) await i(v);
    (v.miiGroup.traverse((S) => {
      if (S.isMesh && S.geometry) {
        if (S.geometry.userData.modulateType)
          for (let E in S.geometry.userData) S.userData[E] = S.geometry.userData[E];
        else
          switch (S.name) {
            case "Faceline":
              S.userData.modulateType = 0;
              break;
            case "Beard":
              S.userData.modulateType = 1;
              break;
            case "Nose":
              S.userData.modulateType = 2;
              break;
            case "Forehead":
              S.userData.modulateType = 3;
              break;
            case "Hair":
              S.userData.modulateType = 4;
              break;
            case "Cap":
              S.userData.modulateType = 5;
              break;
            case "Mask":
              S.userData.modulateType = 6;
              break;
            case "Noseline":
              S.userData.modulateType = 7;
              break;
            case "Glass":
              S.userData.modulateType = 8;
              break;
          }
        if (!S.userData.modulateMode && S.material.map)
          ((S.userData.modulateMode = 1), (S.userData.modulateColor = S.material.color));
      }
    }),
      new Rp().parse(
        v.miiGroup,
        async (S) => {
          try {
          if (S instanceof ArrayBuffer) {
            setTimeout(() => {
              getBodyModels().forEach((L) => {
                L.forEach((k) => {
                  if (!k) return;
                  if (!k.setPose) return;
                  let z = "Pose.01",
                    X = 0;
                  if (getDefaultBodyModelName() === "miitomo") {
                    if (t.personality) {
                      if (t.personality === 24) ((z = "GWait"), (X = 0.83));
                    }
                  }
                  k.setPose(z, X);
                });
              });
            }, 100);
            let T = new Uint8Array(S);
            if (!E_) E_ = new eE().registerExtensions([Xf]);
            let M = await E_.readBinary(T),
              C = M.getRoot(),
              R = /*@__PURE__*/ new Set();
            for (let L of C.listSkins()) for (let k of L.listJoints()) if (k) R.add(k);
            if ((await M.transform(WD(), zD()), e.main.type === 5 && e.extras?.attachHead))
              await M.transform((L) => {
                let k = L.getRoot(),
                  z = k.listScenes()[0] || k.getDefaultScene(),
                  X = k.listNodes().find((Q) => Q.getName() === "head" || Q.getName() === "Head"),
                  G = k
                    .listNodes()
                    .find((Q) => Q.getName() === "headModel" || Q.getName() === v.headModel?.name);
                if (X && G) {
                  let Q = k.listSkins().find((de) => de.listJoints().includes(X));
                  if (Q) {
                    let de = Q.listJoints().indexOf(X),
                      oe = [];
                    G.listChildren().forEach((F) => {
                      let te = F.getName() || "headGroup",
                        he = (re) => {
                          if (re.getMesh())
                            oe.push({ node: re, parentName: te, worldMatrix: re.getWorldMatrix() });
                          re.listChildren().forEach(he);
                        };
                      if (F.getMesh())
                        oe.push({
                          node: F,
                          parentName: G.getName() || "headModel",
                          worldMatrix: F.getWorldMatrix(),
                        });
                      F.listChildren().forEach(he);
                    });
                    let K = null;
                    for (let F of k.listMeshes()) {
                      let te = k.listNodes().find((he) => he.getMesh() === F);
                      if (te && te.getSkin()) {
                        K = te.getParentNode();
                        break;
                      }
                    }
                    let ae = L.createNode(G.getName() || "headModel")
                      .setTranslation([0, 0, 0])
                      .setRotation([0, 0, 0, 1])
                      .setScale([1, 1, 1]);
                    if (K) K.addChild(ae);
                    else z.addChild(ae);
                    let Z = /*@__PURE__*/ new Map();
                    (oe.forEach(({ node: F, parentName: te, worldMatrix: he }) => {
                      let re = F.getMesh();
                      if (!re) return;
                      let le = V1();
                      (Lre(le, he),
                        Ore(le, le),
                        re.listPrimitives().forEach((I) => {
                          let N = I.getAttribute("POSITION"),
                            Y = I.getAttribute("NORMAL"),
                            P = I.getAttribute("TANGENT");
                          if (N)
                            for (let H = 0; H < N.getCount(); H++) {
                              let W = N.getElement(H, []),
                                V = W[0],
                                ne = W[1],
                                J = W[2],
                                U = he[0] * V + he[4] * ne + he[8] * J + he[12],
                                D = he[1] * V + he[5] * ne + he[9] * J + he[13],
                                ee = he[2] * V + he[6] * ne + he[10] * J + he[14];
                              N.setElement(H, [U, D, ee]);
                            }
                          if (Y)
                            for (let H = 0; H < Y.getCount(); H++) {
                              let W = Y.getElement(H, []),
                                V = le[0] * W[0] + le[4] * W[1] + le[8] * W[2],
                                ne = le[1] * W[0] + le[5] * W[1] + le[9] * W[2],
                                J = le[2] * W[0] + le[6] * W[1] + le[10] * W[2],
                                U = Math.sqrt(V * V + ne * ne + J * J);
                              if (U > 0) Y.setElement(H, [V / U, ne / U, J / U]);
                            }
                          if (P)
                            for (let H = 0; H < P.getCount(); H++) {
                              let W = P.getElement(H, []),
                                V = le[0] * W[0] + le[4] * W[1] + le[8] * W[2],
                                ne = le[1] * W[0] + le[5] * W[1] + le[9] * W[2],
                                J = le[2] * W[0] + le[6] * W[1] + le[10] * W[2],
                                U = Math.sqrt(V * V + ne * ne + J * J);
                              if (U > 0) P.setElement(H, [V / U, ne / U, J / U, W[3]]);
                            }
                          if (!I.getAttribute("JOINTS_0")) {
                            let H = N.getCount(),
                              W = new Uint16Array(H * 4),
                              V = new Float32Array(H * 4);
                            for (let U = 0; U < H; U++) ((W[U * 4] = de), (V[U * 4] = 1));
                            let ne = L.createAccessor()
                                .setType("VEC4")
                                .setArray(W)
                                .setBuffer(N.getBuffer()),
                              J = L.createAccessor()
                                .setType("VEC4")
                                .setArray(V)
                                .setBuffer(N.getBuffer());
                            (I.setAttribute("JOINTS_0", ne), I.setAttribute("WEIGHTS_0", J));
                          }
                        }),
                        F.setTranslation([0, 0, 0]),
                        F.setRotation([0, 0, 0, 1]),
                        F.setScale([1, 1, 1]),
                        F.setSkin(Q));
                      let ue = Z.get(te);
                      if (!ue)
                        ((ue = L.createNode("_" + te)
                          .setTranslation([0, 0, 0])
                          .setRotation([0, 0, 0, 1])
                          .setScale([1, 1, 1])),
                          ae.addChild(ue),
                          Z.set(te, ue));
                      ue.addChild(F);
                    }),
                      G.dispose());
                  }
                }
              });
            if (e.extras && e.extras.downscaleModel)
              await M.transform((L) => {
                let k = L.getRoot(),
                  z = 0.014,
                  X = /*@__PURE__*/ new Set();
                for (let de of k.listMeshes())
                  for (let oe of de.listPrimitives()) {
                    let K = oe.getAttribute("POSITION");
                    if (K) X.add(K);
                    for (let ae of oe.listTargets()) {
                      let Z = ae.getAttribute("POSITION");
                      if (Z) X.add(Z);
                    }
                  }
                for (let de of X)
                  for (let oe = 0; oe < de.getCount(); oe++) {
                    let K = de.getElement(oe, []);
                    de.setElement(oe, [K[0] * 0.014, K[1] * 0.014, K[2] * 0.014]);
                  }
                for (let de of k.listNodes()) {
                  let oe = de.getTranslation();
                  de.setTranslation([oe[0] * 0.014, oe[1] * 0.014, oe[2] * 0.014]);
                }
                let G = /*@__PURE__*/ new Set();
                for (let de of k.listAnimations())
                  for (let oe of de.listChannels())
                    if (oe.getTargetPath() === "translation") {
                      let K = oe.getSampler();
                      if (K) {
                        let ae = K.getOutput();
                        if (ae) G.add(ae);
                      }
                    }
                for (let de of G)
                  for (let oe = 0; oe < de.getCount(); oe++) {
                    let K = de.getElement(oe, []);
                    de.setElement(oe, [K[0] * 0.014, K[1] * 0.014, K[2] * 0.014]);
                  }
                let Q = /*@__PURE__*/ new Set();
                for (let de of k.listSkins()) {
                  let oe = de.getInverseBindMatrices();
                  if (oe) Q.add(oe);
                }
                for (let de of Q)
                  for (let oe = 0; oe < de.getCount(); oe++) {
                    let K = de.getElement(oe, []);
                    ((K[12] *= 0.014), (K[13] *= 0.014), (K[14] *= 0.014), de.setElement(oe, K));
                  }
              });
            for (let L of C.listScenes()) for (let k of L.listChildren()) P3(k, V1(), R);
            for (let L of M.getRoot().listMeshes())
              for (let k of L.listPrimitives()) {
                let z = k.getAttribute("__COLOR");
                if (z) (k.setAttribute("__COLOR", null), k.setAttribute("_COLOR", z));
              }
            if (e.extras.attachHead && t.hairFlip === 1)
              Modal.alert(
                translate("Warning"),
                translate(`Hair flipping does not work with the weighted head option.
Please use a 3D software to flip the hair and forehead manually!`),
              );
            M.getRoot().getAsset().generator = `Mii Creator (mii.nxw.pw) ${APP_CONFIG.version.string()} - Three.js/glTF-Transform`;
            var E = "";
            for (let L of t.createId) E += L.toString(16);
            M.getRoot().getAsset().extras = {
              additionalInfo: {
                birthDay: t.birthDay,
                birthMonth: t.birthMonth,
                build: t.build,
                createID: E,
                creator: t.creator,
                facelineType: t.facelineType,
                favoriteColor: t.favoriteColor,
                fontRegion: t.fontRegion,
                gender: t.gender,
                hairFlip: t.hairFlip,
                hairType: t.hairType,
                height: t.height,
                name: t.nickname,
                skinColor: A.facelineColor.toArray(),
              },
              miiData: t.exportBase64("miic"),
              partsTransform: structuredClone(A.partsTransform),
            };
            let B = await E_.writeBinary(M);
            (o({
              data: B,
              name: translate(Dre[e.main.type], t.nickname, /*@__PURE__*/ new Date().toJSON()),
            }),
              setTimeout(() => {
                _.dispose();
              }));
          }
          } catch (error) {
            console.error("Animated GLB export processing failed:", error);
            reject(error);
          }
        },
        (S) => {
          console.error("GLB exporter failed:", S);
          reject(S instanceof Error ? S : new Error(String(S)));
        },
        {
          binary: !0,
          animations: (() => {
            let names =
              animationName === "__all__"
                ? Array.from(b?.clips?.keys() || [])
                : [animationName];
            return names
              .filter((name) => name && b?.clips?.has(name))
              .map((name) => _k(b.clips.get(name), "skl_root", "nw4f_root", null, !0));
          })(),
        },
      ));
  });
}
function Pre(e, t, r) {
  let n = getTHREE(),
    i = [];
  if (
    (e.traverseVisible((g) => {
      if (g.isSkinnedMesh) i.push(g);
    }),
    i.length === 0)
  )
    return null;
  e.updateMatrixWorld(!0);
  let s = i[0].skeleton.bones,
    a = s.map((g) => {
      let m = new n.Bone();
      return ((m.name = g.name), m);
    }),
    l = {};
  a.forEach((g) => (l[g.name] = g));
  let c = new n.Group();
  c.name = r;
  let u = s[0].parent ? s[0].parent.matrixWorld : new n.Matrix4().identity(),
    d = {},
    h = {};
  for (let g = 0; g < s.length; g++) {
    let m = s[g],
      A = m.name.toLowerCase(),
      y = t.lastWorldMatrices[A],
      x = new n.Matrix4();
    if (y) x.copy(u).multiply(y);
    else x.copy(m.matrixWorld);
    d[m.name] = x;
    let b = new n.Vector3(),
      v = new n.Quaternion(),
      _ = new n.Vector3();
    x.decompose(b, v, _);
    let w = new n.Matrix4().compose(b, v, new n.Vector3(1, 1, 1));
    h[m.name] = w;
  }
  for (let g = 0; g < s.length; g++) {
    let m = s[g],
      A = a[g],
      y = h[m.name];
    if (m.parent && m.parent.isBone) {
      let x = l[m.parent.name];
      if (x) {
        x.add(A);
        let b = h[m.parent.name];
        (new n.Matrix4().copy(b).invert().multiply(y).decompose(A.position, A.quaternion, A.scale),
          A.scale.set(1, 1, 1));
      }
    } else (c.add(A), y.decompose(A.position, A.quaternion, A.scale), A.scale.set(1, 1, 1));
  }
  let f = new n.Skeleton(a);
  (c.updateMatrixWorld(!0), f.calculateInverses());
  let p = i.map((g) => {
    let m = g.geometry,
      A = m.attributes.position,
      y = m.attributes.normal,
      x = m.attributes.skinIndex,
      b = m.attributes.skinWeight,
      v = A.count,
      _ = new Float32Array(v * 3),
      w = y ? new Float32Array(v * 3) : null,
      S = g.bindMatrix || new n.Matrix4().identity(),
      E = [];
    if (x && b)
      for (let R = 0; R < g.skeleton.bones.length; R++) {
        let B = g.skeleton.bones[R],
          L = g.skeleton.boneInverses[R],
          k = d[B.name];
        E[R] = new n.Matrix4().multiplyMatrices(k, L).multiply(S);
      }
    for (let R = 0; R < v; R++) {
      let B = new n.Vector3().fromBufferAttribute(A, R),
        L = y ? new n.Vector3().fromBufferAttribute(y, R) : null,
        k = new n.Vector3(),
        z = new n.Vector3();
      if (x && b) {
        let X = new n.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        for (let G = 0; G < 4; G++) {
          let Q = b.getComponent(R, G);
          if (Q === 0) continue;
          let de = x.getComponent(R, G),
            oe = E[de];
          for (let K = 0; K < 16; K++) X.elements[K] += oe.elements[K] * Q;
        }
        if ((k.copy(B).applyMatrix4(X), L)) {
          let G = new n.Matrix3().getNormalMatrix(X);
          z.copy(L).applyMatrix3(G).normalize();
        }
      } else if ((k.copy(B).applyMatrix4(g.matrixWorld), L)) {
        let X = new n.Matrix3().getNormalMatrix(g.matrixWorld);
        z.copy(L).applyMatrix3(X).normalize();
      }
      if ((k.toArray(_, R * 3), w)) z.toArray(w, R * 3);
    }
    let T = new n.BufferGeometry();
    if ((T.setAttribute("position", new n.BufferAttribute(_, 3)), w))
      T.setAttribute("normal", new n.BufferAttribute(w, 3));
    if (x) T.setAttribute("skinIndex", x.clone());
    if (b) T.setAttribute("skinWeight", b.clone());
    if (m.attributes.uv) T.setAttribute("uv", m.attributes.uv.clone());
    if (m.index) {
      let R = m.index.array,
        B = new Uint32Array(R.length),
        L = g.matrixWorld.determinant() < 0;
      for (let k = 0; k < R.length; k += 3)
        if (L) ((B[k] = R[k]), (B[k + 1] = R[k + 2]), (B[k + 2] = R[k + 1]));
        else ((B[k] = R[k]), (B[k + 1] = R[k + 1]), (B[k + 2] = R[k + 2]));
      T.setIndex(new n.BufferAttribute(B, 1));
    }
    let M = Array.isArray(g.material) ? g.material.map((R) => R.clone()) : g.material.clone(),
      C = new n.SkinnedMesh(T, M);
    return ((C.name = g.name), C.bind(f, new n.Matrix4().identity()), C);
  });
  return (p.forEach((g) => c.add(g)), [c, p]);
}
function bk(e, t = 0.00001) {
  let r = Math.round(e);
  return Math.abs(e - r) < t ? r : e;
}
function W6(e) {
  let t = e.attributes.uv;
  if (!t) return !1;
  for (let r = 0; r < t.count; r++) {
    let n = bk(t.getX(r)),
      i = bk(t.getY(r)),
      o = Math.floor(n),
      s = n - o;
    if (Math.abs(o % 2) === 1) n = 1 - s;
    else n = s;
    let a = Math.floor(i),
      l = i - a;
    if (Math.abs(a % 2) === 1) i = 1 - l;
    else i = l;
    ((n = Math.max(0, Math.min(1, n))), (i = Math.max(0, Math.min(1, i))), t.setXY(r, n, i));
  }
  return ((t.needsUpdate = !0), !0);
}
function kre(e) {
  let t = getTHREE(),
    r = e.source.data.data,
    n = e.source.data.width,
    i = e.source.data.height,
    o = 4,
    s = n * 2,
    a = new Uint8Array(s * i * o);
  for (let c = 0; c < i; c++) {
    let u = c * n * o,
      d = c * s * o,
      h = d + n * o;
    for (let f = 0; f < n; f++) {
      let p = d + f * o,
        g = u + f * o;
      ((a[p] = r[g]), (a[p + 1] = r[g + 1]), (a[p + 2] = r[g + 2]), (a[p + 3] = r[g + 3]));
      let m = h + f * o,
        A = u + (n - 1 - f) * o;
      ((a[m] = r[A]), (a[m + 1] = r[A + 1]), (a[m + 2] = r[A + 2]), (a[m + 3] = r[A + 3]));
    }
  }
  let l = new t.DataTexture(a, s, i, t.RGBAFormat);
  if (
    ((l.colorSpace = e.colorSpace),
    (l.wrapS = t.ClampToEdgeWrapping),
    (l.wrapT = e.wrapT || t.ClampToEdgeWrapping),
    (l.minFilter = e.minFilter || t.LinearFilter),
    (l.magFilter = e.magFilter || t.LinearFilter),
    l.minFilter !== t.NearestFilter && l.minFilter !== t.LinearFilter)
  )
    l.generateMipmaps = !0;
  else l.generateMipmaps = !1;
  return ((l.needsUpdate = !0), l);
}
function Ure(e) {
  let t = e.attributes.uv;
  for (let r = 0; r < t.count; r++) {
    let n = t.getX(r);
    t.setX(r, n * 0.5);
  }
  t.needsUpdate = !0;
}
function P3(e, t, r) {
  function n(a) {
    return r.has(a);
  }
  let i = e.getMatrix(),
    o = V1();
  if ((Bre(o, t, i), n(e))) {
    for (let a of e.listChildren()) P3(a, V1(), r);
    return;
  }
  if (e.getSkin() !== null) {
    for (let a of e.listChildren()) P3(a, V1(), r);
    return;
  }
  let s = e.getMesh();
  if (s) {
    (GD(s, o), e.setTranslation([0, 0, 0]), e.setRotation([0, 0, 0, 1]), e.setScale([1, 1, 1]));
    for (let a of e.listChildren()) P3(a, V1(), r);
  } else {
    for (let a of e.listChildren()) P3(a, o, r);
    (e.setTranslation([0, 0, 0]), e.setRotation([0, 0, 0, 1]), e.setScale([1, 1, 1]));
  }
}
function _k(e, t = "skl_root", r = "nw4f_root", n = null, preservePositions = !1) {
  let i = getTHREE();
  if (n == null) n = new i.Vector3();
  let o = [];
  for (let s of e.tracks) {
    let a = s.name.split("."),
      l = a[0],
      c = a[1],
      u = l.toLowerCase() === t.toLowerCase() || l.toLowerCase() === r.toLowerCase();
    if (c === "scale") continue;
    if ((!preservePositions && c === "position") || (u && (c === "position" || c === "quaternion"))) continue;
    o.push(s.clone());
  }
  return new i.AnimationClip(e.name + "_Baked", e.duration, o);
}
