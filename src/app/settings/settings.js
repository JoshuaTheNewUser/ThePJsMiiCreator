// src/app/settings/settings.js
// SETTINGS_SECTIONS (everything in Settings), getSetting(), setSetting().
//
// Defines: SETTINGS_SECTIONS, getSetting, setSetting
// Uses from other files:
//   app/renderer/mii-model.js: getAdditionalInfo, getSharedRenderer, createMiiModel
//   app/renderer/ffl-resources.js: getFFLModule, l1, waitForFFLResources
//   app/library/library.js: renderMiiIcon, openPersonalMiiPicker, fetchLibrary
//   app/ui/html.js: Html
//   app/i18n/localization.js: getTranslator
//   app/items/item-lists.js: HAT_MODEL_INFO
//   app/mii/mii.js: Mii
//   app/ui/icons.js: SVG_ICONS
//   app/ui/modal.js: Modal
//   app/renderer/ffl/face-builder.js: toFFLCharInfo
//   app/shaders/switch-shader.js: SwitchShader
//   app/util/platform.js: Zp
//   … and 4 more files

var localforage = In(Hs(), 1);
var JSZip = In(Cm(), 1);
var H5 = [
  "BAM5i2G9mwPpOoAAAADs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEEAAAAAAAAACAAAAAAAQAMDCAYEBgIKCAQEAgIMBAAAAP8ABAAACAQACggARP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAOFdPR8ZsuhdoAAAAHs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEIAAAAAAAAACAAAAAAAQAMDBgYEBgIKDAQEAgIMAAAAAP8ABQAACAQACgYAN////0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAM2I3afbKlshYAAAALs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEMAAAAAAAAACAAAAAAAQAMDAQYEBgIKCAQEAgIMAQAAAP8AAAAACAQACgEAIf///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAN9s2CERcxd8IAAAAPs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEQAAAAAAAAACAAAAAAAQAMDCAYEAAIKCAMEBAIMAgAAAP8AAgABCAQACggAGP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAP3BYyHQ6gZsoAAAATs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEUAAAAAAAAACAAAAAAAQAMDBwYEAAIKDQMEBAIMAAAAAP8ABgABCAQACgcADv///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BANfFfqpycZfsoAAAAXs/4LSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEYAAAAAAAAACAAAAAAAQAMDAQYEAAIKCAMEBAIMAAAAAP8ABwABCAQACgEADP///0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAA==",
  "BAXGigDvV8wSNID/cJl869TJwxYAAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEcAAAAAAAAACAAAAAAAQAMDCgYEBgIKCAQEAgIMBgAAAP8AAQAACAQACgoAc////0AABAACFAMTBBcNBAAKBAEJ//8A/wAAAP////8=",
  "BABEp+/5p6E6GoDfGZofZsl0BT8AAAAAAAAAAAAAAAAAAAAAAAAAAEcAdQBlAHMAdAAgAEgAAAAAAAAACAAAAAAAQAMDCAYEAAIKCAMEBAIMCAAAAP8AAwABCAQACggAB////0D/BAACFAMTBBcNBAAKBAEJ//8A/wAAAP////8=",
];
var translate = getTranslator();
translate("Low");
translate("Middle");
translate("High");
var eb = null,
  SETTINGS_SECTIONS = [
    {
      name: () => translate("Profile"),
      items: {
        personalMii: {
          type: 2,
          label: () => translate("Personal Mii"),
          description: () => translate("Manage your choice of Personal Mii."),
          choices: [
            {
              label: () => translate("Choose"),
              async select() {
                let e = await fetchLibrary();
                await openPersonalMiiPicker(e, !0);
              },
            },
          ],
          async render(e, t) {
            if (Zp() !== !0) {
              (e.qsa("*").forEach((n) => {
                n.elm.disabled = !0;
              }),
                e.prepend(
                  new Html("span").text("You can't set a Personal Mii when logged in as a guest."),
                ));
              return;
            }
            if (t) {
              let o = function () {
                  renderMiiIcon(n, "aaa", "fflmakeicon", 128)
                    .then(async (l) => {
                      (i.attr({ src: l.url }).style({ opacity: "1" }).on("load", l.dispose),
                        IconCache.cacheIcon(l.blob, "pmii0", t.data));
                    })
                    .catch((l) => {
                      Notify.show(translate("Notice"), translate("Failed to load %1's icon", n.nickname));
                    });
                },
                n = new Mii(t.data);
              await waitForFFLResources();
              let i = new Html("img").style({ opacity: "0" }),
                s = await IconCache.getCachedIcon("pmii0");
              if (s === null) o();
              else if (!s.curData) o();
              else if (s.curData !== t.data) o();
              else if (s.shaderType !== (await getSetting("shaderTypeN"))) o();
              else {
                let l = URL.createObjectURL(s.icon);
                i.attr({ src: l })
                  .style({ opacity: "1" })
                  .on("load", () => {
                    URL.revokeObjectURL(l);
                  });
              }
              let a = new Html("div")
                .classOn("flex-group")
                .style({ "justify-content": "flex-start" })
                .appendMany(
                  i.style({ width: "96px", height: "96px" }),
                  new Html("div")
                    .classOn("col")
                    .appendMany(
                      new Html("small").text(translate("Personal Mii")),
                      new Html("label").text(n.nickname),
                    ),
                );
              e.elm.insertBefore(a.elm, e.qs(".flex-group").elm);
            }
          },
        },
        logoutPlease: {
          type: 2,
          label: () => translate("Account and settings management"),
          description: () => translate("Manage things with your account here."),
          choices: [
            {
              label: () => translate("Log out"),
              type: "danger",
              async select() {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate("Are you sure you want to log out?"),
                    "body",
                    !0,
                  ))
                )
                  return;
                location.href = "/logout";
              },
            },
            {
              label: () => translate("Delete Account"),
              type: "danger",
              async select() {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate(`Are you sure you want to delete your account?
You will lose the following:

* Your Personal Mii
* All Mii data in your library

This cannot be undone.
All data is permanently lost and cannot be recovered!`),
                    "body",
                    !0,
                    !0,
                  ))
                )
                  return;
                (await fetch("/api/account/delete", { method: "POST" }),
                  (location.href = "/logout"));
              },
            },
          ],
        },
      },
    },
    {
      name: () => translate("Display"),
      items: {
        languageN: {
          type: 1,
          label: () => translate("Language"),
          default: null,
          description: () => translate("Change the preferred language."),
          choices: [
            { label: () => translate("English"), value: "en" },
            { label: () => translate("Español"), value: "es-ES" },
            { label: () => translate("Français"), value: "fr-FR" },
            { label: () => translate("Nederlands"), value: "nl-NL" },
          ],
        },
        theme: {
          type: 1,
          label: () => translate("Theme"),
          default: "sw2",
          description: () =>
            translate(
              "Certain themes will use the Color Scheme preference to change the background color.",
            ),
          choices: [
            { label: () => translate("Classic"), value: "classic" },
            { label: () => translate("Switch 2"), value: "sw2" },
            { label: () => translate("Space"), value: "space" },
            { label: () => translate("Wii"), value: "wii" },
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Miitomo"), value: "miitomo" },
          ],
        },
        colorScheme: {
          type: 1,
          label: () => translate("Color Scheme"),
          default: "auto",
          description: () =>
            translate(
              "Choose the color scheme you want to use. 'Auto' will use your device's color scheme preferences.",
            ),
          choices: [
            { label: () => translate("Auto"), value: "auto" },
            { label: () => translate("Light"), value: "light" },
            { label: () => translate("Dark"), value: "dark" },
          ],
          condition(e) {
            if (e.theme === "space" || e.theme === "wii" || e.theme === "wiiu") return !1;
            return !0;
          },
        },
        colorSchemeSpace: {
          type: 1,
          label: () => translate("Color Scheme"),
          default: "auto",
          description: () =>
            translate("Choose the color scheme you want to use. (New colors exclusive to Space theme)"),
          choices: [
            { label: () => translate("Amethyst"), value: "auto" },
            { label: () => translate("Sapphire"), value: "sapphire" },
            { label: () => translate("Gold"), value: "gold" },
            { label: () => translate("Emerald"), value: "emerald" },
            { label: () => translate("Azure"), value: "azure" },
            { label: () => translate("Ruby"), value: "ruby" },
            { label: () => translate("Rhodonite"), value: "rhodonite" },
            { label: () => translate("Moon"), value: "moon" },
          ],
          condition(e) {
            if (e.theme === "space") return !0;
            return !1;
          },
        },
        shaderTypeN: {
          type: 1,
          label: () => translate("Shader Type"),
          description: () => translate("Change the lighting used in renders and the editor."),
          default: "switch",
          choices: [
            { label: () => translate("No Lighting"), value: "lightDisabled" },
            { label: () => translate("Mii Channel"), value: "wii" },
            { label: () => translate("Wii Play"), value: "wii_alt" },
            { label: () => translate("Resort"), value: "wii_alt_5" },
            { label: () => translate("Wii Room"), value: "wii_alt_4" },
            { label: () => translate("Simple"), value: "wii_simple" },
            { label: () => translate("Simple+"), value: "wii_alt_2" },
            { label: () => translate("Toon"), value: "toon" },
            { label: () => translate("3DS"), value: "3ds" },
            { label: () => translate("Tomodachi Life"), value: "3ds_alt" },
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Wii U (Bright)"), value: "wiiu_ffliconwithbody" },
            { label: () => translate("Switch"), value: "switch" },
            { label: () => translate("Miitomo"), value: "miitomo" },
          ],
          async render(e, t) {
            return (
              (eb = (async () => {
                let r = null,
                  n = !1;
                if (t) ((r = new Mii(t.data)), (n = !0));
                let i = this.choices.map((h) => h.value),
                  o = e.qsa("button"),
                  s = n,
                  a = [];
                if (s)
                  for (let h = 0; h < o.length; h++) {
                    let f = "pmii" + i[h],
                      p = await IconCache.getCachedIcon(f);
                    if (!p || !p.curData || p.curData !== t.data) {
                      s = !1;
                      break;
                    }
                    a.push(p);
                  }
                if (s && a.length === o.length) {
                  o.forEach((h, f) => {
                    h.style({ overflow: "clip", "justify-content": "space-between" });
                    let p = a[f],
                      g = URL.createObjectURL(p.icon);
                    new Html("img")
                      .attr({ src: g })
                      .style({
                        width: "86px",
                        height: "86px",
                        margin: "-14px",
                        "pointer-events": "none",
                      })
                      .prependTo(h)
                      .on("load", () => URL.revokeObjectURL(g));
                  });
                  return;
                }
                await waitForFFLResources();
                let l = 0;
                if (r) l = r.hatType > -1 ? (HAT_MODEL_INFO[r.hatType].mdlType === 1 ? 2 : 0) : 0;
                let c = r.hatType;
                if (l === 2) ((r.hatType = -1), (l = 0));
                let u, d;
                if (
                  ((u = await l1()?.createFace(r, getSharedRenderer(), null, 256, void 0, l, 0, !1)),
                  r.facelineMake > 0 || r.facelineWrinkle > 0 || r.beardType >= 4)
                )
                  d = await l1()?.createFace(r, getSharedRenderer(), null, 256, SwitchShader, l, 0, !1, {
                    charInfo: toFFLCharInfo(r),
                    additionalInfo: getAdditionalInfo(r),
                  });
                for (let h = 0; h < o.length; h++) {
                  let f = o[h];
                  f.style({ overflow: "clip", "justify-content": "space-between" });
                  let p = r;
                  if (!n || !p) p = new Mii(H5[h % H5.length]);
                  let g = document.createElement("canvas");
                  ((g.width = 256), (g.height = 256));
                  let m = await createMiiModel({
                    data: p.export("studioData"),
                    drawBody: !1,
                    expression: 0,
                    module: getFFLModule(),
                    renderer: getSharedRenderer(),
                    size: 172,
                    type: 0,
                    shaderType: i[h],
                    charModel: n ? (i[h] === "switch" ? d || u : u) : void 0,
                    additionalInfo: getAdditionalInfo(p),
                    texResolution: 256,
                    canvas: g,
                    responseType: "canvas",
                    forceUpdateShaderMaterials: !0,
                  });
                  if (n && m) {
                    let A = "pmii" + i[h];
                    await new Promise((y) => {
                      g.toBlob(async (x) => {
                        if (x) await IconCache.cacheIcon(x, A, t.data, !0);
                        y();
                      }, "image/png");
                    });
                  }
                  Html.from(m)
                    .style({
                      width: "86px",
                      height: "86px",
                      margin: "-14px",
                      "pointer-events": "none",
                    })
                    .prependTo(f);
                }
                r.hatType = c;
              })()),
              eb
            );
          },
        },
        alternateDefaultPalette: {
          type: 0,
          label: () => translate("Use alternate default color palette (Some shaders only)"),
          default: !0,
          description: () =>
            translate(`Replaces default colors with equivalent Wii ones. Can be useful in some cases.
* Only available in some shader types.`),
          condition(e) {
            return (
              e.shaderTypeN === "wii" ||
              e.shaderTypeN === "wii_alt" ||
              e.shaderTypeN === "wii_alt_2" ||
              e.shaderTypeN === "wii_alt_3" ||
              e.shaderTypeN === "wii_alt_4" ||
              e.shaderTypeN === "wii_alt_5" ||
              e.shaderTypeN === "wii_simple" ||
              e.shaderTypeN === "three_toon" ||
              e.shaderTypeN === "lightDisabled"
            );
          },
        },
        alternateHairShadow: {
          type: 0,
          label: () => translate("Additional hair shadows (Some shaders only)"),
          default: !1,
          description: () =>
            translate(`Darken inner parts of the hair.
* Only available in some shader types.`),
          condition(e) {
            return (
              e.shaderTypeN === "wii" ||
              e.shaderTypeN === "wii_alt" ||
              e.shaderTypeN === "wii_alt_2" ||
              e.shaderTypeN === "wii_alt_3" ||
              e.shaderTypeN === "wii_alt_4" ||
              e.shaderTypeN === "wii_alt_5" ||
              e.shaderTypeN === "wii_simple" ||
              e.shaderTypeN === "three_toon" ||
              e.shaderTypeN === "lightDisabled" ||
              e.shaderTypeN === "3ds" ||
              e.shaderTypeN === "3ds_alt"
            );
          },
        },
        bodyModelN: {
          type: 1,
          label: () => translate("Body Model"),
          description: () =>
            translate("Pose selections are different depending on the body model you use."),
          default: "miitomo",
          choices: [
            { label: () => translate("Wii"), value: "wii" },
            { label: () => translate("Baby"), value: "baby" }
            { label: () => translate("MAE"), value: "wii" }
            { label: () => translate("Wii Play"), value: "wiiplay" }
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Switch"), value: "switch" },
            { label: () => translate("Miitomo"), value: "miitomo", headerIcon: SVG_ICONS.clothesSm },
            { label: () => translate("StreetPass"), value: "streetpass" },
          ],
          render(e, t) {
            let r = e.qsa("button");
            if (r.length > 0)
              r.forEach((n, i) => {
                if (!n) return;
                let o = new Html("div").classOn("flex-group");
                (n.classOn("col"),
                  n.qsa("span").forEach((s) => {
                    s && s.appendTo(o);
                  }),
                  n
                    .prepend(
                      new Html("img")
                        .attr({ src: `./assets/images/bodyPreview_${this.choices[i].value}.png` })
                        .style({ height: "120px", "pointer-events": "none" }),
                    )
                    .append(o));
              });
          },
        },
        alternateIdlePoseN: {
          type: 0,
          label: () => translate("Use alternate idle pose (Wii body only)"),
          default: !0,
          description: () =>
            translate(`Changes the idle animation to an alternative one.
* Wii body only.`),
          condition(e) {
            return e.bodyModelN === "wii";
          },
        },
        headScaleSmall: {
          type: 0,
          label: () => translate("Small head in scene"),
          default: !1,
          description: () => translate("Makes head smaller in 3d"),
        },
        useExperimentalGradient: {
          type: 0,
          label: () => translate("Use experimental gradient design"),
          default: !0,
          description: () =>
            translate(
              "Adds animated gradients to selected elements, based on Switch 2. May decrease performance.",
            ),
          condition(e) {
            return e.theme === "sw2";
          },
        },
      },
    },
    {
      name: () => translate("Editor"),
      items: {
        accessibilityFeature: {
          type: 0,
          label: () => translate("Enable accessibility features"),
          default: !1,
          description: () => translate("The editor UI will be tweaked to be more accessible."),
        },
        editLimits: {
          type: 1,
          label: () => translate("Editor Limits"),
          default: "miic",
          description: () =>
            translate(`This setting limits the options available in the editor if you want to limit your selection to ones on consoles.
* Note: Selecting anything other than "Mii Creator" will lock you out of using any custom features.`),
          choices: [
            { label: () => translate("Wii/DS"), value: "wii" },
            { label: () => translate("3DS/Wii U"), value: "3ds_wiiu" },
            { label: () => translate("Switch/Switch 2"), value: "switch" },
            { label: () => translate("Mii Creator"), value: "miic" },
          ],
        },
        useEditorShadow: {
          type: 0,
          label: () => translate("Enable shadow in editor"),
          default: !0,
          description: () => translate("Show a shadow underneath the Mii in the editor."),
        },
      },
    },
    {
      name: () => translate("Sound"),
      items: {
        bgm: {
          type: 0,
          label: () => translate("Enable background music"),
          default: !0,
          description: () => translate("Toggle background music depending on the theme."),
        },
        bgmType: {
          type: 1,
          label: () => translate("Background music type"),
          default: "auto",
          description: () =>
            translate(
              "Choose the background music you want to use. 'Auto' will use the theme's default background music.",
            ),
          choices: [
            { label: () => translate("Auto"), value: "auto" },
            { label: () => translate("Mii Creator (Classic)"), value: "classic" },
            { label: () => translate("Mii Creator (Switch 2)"), value: "sw2" },
            { label: () => translate("Space"), value: "space" },
            { label: () => translate("Wii"), value: "wii" },
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Miitomo"), value: "miitomo" },
          ],
        },
        bgmLoseFocus: {
          type: 0,
          label: () => translate("Background music fades out when focus lost"),
          default: !0,
          description: () => translate("Background music will fade out when you move away from this tab."),
        },
        sfx: {
          type: 0,
          label: () => translate("Enable sound effects"),
          default: !0,
          description: () => translate("Toggle sound effects for buttons and inputs."),
        },
        sfxType: {
          type: 1,
          label: () => translate("Sound effects type"),
          default: "auto",
          description: () =>
            translate("Choose the UI sounds you want to use. 'Auto' will use the theme's default sounds."),
          choices: [
            { label: () => translate("Auto"), value: "auto" },
            { label: () => translate("Mii Creator (Classic)"), value: "classic" },
            { label: () => translate("Mii Creator (Switch 2)"), value: "sw2" },
            { label: () => translate("Space"), value: "space" },
            { label: () => translate("Wii"), value: "wii" },
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Miitomo"), value: "miitomo" },
          ],
        },
        bgmVolume: {
          type: 3,
          label: () => translate("Background music volume"),
          default: 100,
          min: 0,
          max: 175,
          description: () => translate("Change the volume of background music."),
        },
        sfxVolume: {
          type: 3,
          label: () => translate("Sound effect volume"),
          default: 100,
          min: 0,
          max: 175,
          description: () => translate("Change the volume of UI sounds."),
        },
      },
    },
    {
      name: () => translate("Miscellaneous"),
      items: {
        replayTutorial: {
          type: 2,
          label: () => translate("Replay Tutorial"),
          description: () => translate("This will show the tutorial screen again."),
          choices: [
            {
              label: () => translate("Perform Tutorial Again"),
              async select() {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate("Are you sure you want to do this? The page will reload."),
                    "body",
                  ))
                )
                  return;
                (localforage.default.removeItem("settings_tutorialClear"), location.reload());
              },
            },
          ],
        },
        _s_rendering: { type: 4, heading: translate("Rendering") },
        resourceType: {
          type: 1,
          label: () => translate("Resource Type"),
          default: String(APP_CONFIG.renderer.fflResourcePath.length - 1),
          description: () =>
            translate(`This changes model/texture quality.
* Low resource cannot use some shader features.`),
          choices: [
            ...APP_CONFIG.renderer.fflResourcesNames.map((e, t) => ({
              label: () => translate(e),
              value: String(t),
            })),
          ],
        },
        _s_customrender: { type: 4, heading: translate("Custom Render") },
        customRenderVideoFps: {
          type: 1,
          label: () => translate("Custom Render export video FPS"),
          default: "60",
          description: () =>
            translate("Change FPS for exported videos. Higher is better, at the cost of file size."),
          choices: [
            { label: () => translate("30"), value: "30" },
            { label: () => translate("45"), value: "45" },
            { label: () => translate("60"), value: "60" },
            { label: () => translate("120"), value: "120" },
          ],
        },
        _s_3d: { type: 4, heading: translate("3D Export") },
        modelExportTexResolution: {
          type: 1,
          label: () => translate("3D model export texture resolution"),
          default: "1024",
          description: () =>
            translate(
              "This changes texture quality for 3D export. Higher resolutions will look better, at the cost of file size.",
            ),
          choices: [
            { label: () => translate("384px (Wii)"), value: "384" },
            { label: () => translate("512px"), value: "512" },
            { label: () => translate("768px"), value: "768" },
            { label: () => translate("1024px"), value: "1024" },
          ],
        },
        modelExportMaterialType: {
          type: 1,
          label: () => translate("3D model export material type"),
          default: "shiny",
          description: () =>
            translate(
              "Choose the type of material used in 3D exports. Some options may look better depending on the software used.",
            ),
          choices: [
            { label: () => translate("Flat"), value: "flat" },
            { label: () => translate("Simple"), value: "simple" },
            { label: () => translate("Shiny"), value: "shiny" },
            { label: () => translate("Bright"), value: "bright" },
          ],
          render(e, t) {
            let r = e.qsa("button");
            if (r.length > 0)
              r.forEach((n, i) => {
                if (!n) return;
                let o = new Html("div").classOn("flex-group");
                (n.classOn("col").style({ gap: "8px" }),
                  n.qsa("span").forEach((s) => {
                    s && s.appendTo(o);
                  }),
                  n
                    .prepend(
                      new Html("img")
                        .attr({ src: `./assets/images/matPreview_${this.choices[i].value}.png` })
                        .style({ height: "120px", "pointer-events": "none" }),
                    )
                    .append(o));
              });
          },
        },
        _s_misc: { type: 4, heading: translate("Other") },
        shaderTypeIcon: {
          type: 1,
          label: () => translate("Icon Shader Type"),
          description: () => translate("Change the lighting used in icons."),
          default: "switch",
          choices: [
            { label: () => translate("No Lighting"), value: "lightDisabled" },
            { label: () => translate("Mii Channel"), value: "wii" },
            { label: () => translate("Wii Play"), value: "wii_alt" },
            { label: () => translate("Resort"), value: "wii_alt_5" },
            { label: () => translate("Wii Room"), value: "wii_alt_4" },
            { label: () => translate("Simple"), value: "wii_simple" },
            { label: () => translate("Simple+"), value: "wii_alt_2" },
            { label: () => translate("Toon"), value: "toon" },
            { label: () => translate("3DS"), value: "3ds" },
            { label: () => translate("Tomodachi Life"), value: "3ds_alt" },
            { label: () => translate("Wii U"), value: "wiiu" },
            { label: () => translate("Wii U (Bright)"), value: "wiiu_ffliconwithbody" },
            { label: () => translate("Switch"), value: "switch" },
            { label: () => translate("Miitomo"), value: "miitomo" },
          ],
          async render(e, t) {
            if (eb)
              try {
                await eb;
              } catch (i) {}
            let r = this.choices.map((i) => i.value),
              n = e.qsa("button");
            if (!t) return;
            for (let i = 0; i < n.length; i++) {
              let o = n[i],
                s = "pmii" + r[i],
                a = await IconCache.getCachedIcon(s);
              if (a && a.curData === t.data) {
                o.style({ overflow: "clip", "justify-content": "space-between" });
                let l = URL.createObjectURL(a.icon);
                new Html("img")
                  .attr({ src: l })
                  .style({
                    width: "86px",
                    height: "86px",
                    margin: "-14px",
                    "pointer-events": "none",
                  })
                  .prependTo(o)
                  .on("load", () => URL.revokeObjectURL(l));
              }
            }
          },
        },
        autoCloseQrScan: {
          type: 0,
          label: () => translate("Auto-close QR scan menu"),
          default: !0,
          description: () => translate("The QR code scanner will disappear after a successful scan."),
        },
        allowQrCamera: {
          type: 0,
          label: () => translate("Allow using camera in QR scanner"),
          default: !0,
          description: () =>
            translate("When this is disabled, the camera won't be used and some errors may not appear."),
        },
        cutsceneSkipN: {
          type: 0,
          label: () => translate("Skip cutscene animations"),
          default: !0,
          description: () =>
            translate(
              "Don't show cutscene animations when making a copy of a Mii, importing a Mii from a QR code, or exporting a Mii to a QR code.",
            ),
        },
        exportData: {
          type: 2,
          label: () => translate("Export Mii data"),
          description: () => translate("You can download an archive containing all of your Miis here."),
          choices: [
            {
              label: () => translate("Download"),
              async select() {
                let e = new JSZip.default(),
                  t = await fetch("/api/library").then((i) => i.json()),
                  r = /*@__PURE__*/ new Date(),
                  n = new Date(r.getTime() - r.getTimezoneOffset() * 60000);
                for (let i = 0; i < t.length; i++) {
                  let o = t[i],
                    s = new Mii(o.data);
                  e.file(`${i}-${s.nickname}.miic`, o.data, { base64: !0, date: n });
                }
                await e.generateAsync({ type: "blob" }).then(function (i) {
                  downloadBlob(i, `mii-creator-mii-data-${/*@__PURE__*/ new Date().toJSON()}.zip`);
                });
              },
            },
          ],
        },
        purgeCache: {
          type: 2,
          label: () => translate("Purge Icon Cache"),
          description: () => translate("This requires a reload."),
          choices: [
            {
              label: () => translate("Purge Icon Cache"),
              type: "danger",
              async select() {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate("Are you sure you want to do this? The page will reload."),
                    "body",
                    !0,
                  ))
                )
                  return;
                (await IconCache.purgeIconCache(void 0, !0), location.reload());
              },
            },
          ],
        },
      },
    },
  ],
  getSetting = async (e) => {
    let t = await localforage.default.getItem("settings_" + e);
    if (t === null) {
      for (let r in SETTINGS_SECTIONS) if (SETTINGS_SECTIONS[r].items[e]) return SETTINGS_SECTIONS[r].items[e].default;
      return null;
    } else return t;
  },
  setSetting = async (e, t) => await localforage.default.setItem("settings_" + e, t);
