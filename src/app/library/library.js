// src/app/library/library.js
// The library screen: icons, /api/library requests, Mii pickers, Personal Mii.
//
// Defines: I_, ZH, cce, renderMiiIcon, refreshLibrary, getRefreshLibrary, libraryApiRequest,
//          openMiiPicker, openPersonalMiiPicker, showPersonalMiiConfirm, fetchLibrary, JH,
//          renderLibraryIcon, openLibrary
// Uses from other files:
//   app/mii/colors.js: FAVORITE_COLOR_GRADIENTS, Z9, wv
//   app/ui/modal.js: defaultModalButtons, closeModal, Modal
//   app/renderer/mii-model.js: getAdditionalInfo, getSharedRenderer, createMiiModel
//   app/renderer/ffl-resources.js: getFFLModule, Pd, waitForFFLResources
//   app/items/item-lists.js: getHatNames, getOutfitNames
//   app/util/random.js: range, randomInt
//   app/util/colors-and-bytes.js: bytesToBase64, decodeHexOrBase64
//   app/settings/settings-dialog.js: openSettingsDialog, qD
//   app/ui/html.js: Html
//   app/audio/sound-effects.js: playSound
//   app/i18n/localization.js: getTranslator
//   app/mii/mii.js: Mii
//   … and 16 more files

var translate = getTranslator();
var I_ = () => {
    setTimeout(() => {
      if (randomInt(2) !== 0) return;
      playSound(`load${randomInt(4) + 1}`);
    }, randomInt(200));
  },
  ZH = [
    (e, t) => e.index - t.index,
    (e, t) => e.mii.nickname.localeCompare(t.mii.nickname),
    (e, t) => e.mii.favoriteColor - t.mii.favoriteColor,
    (e, t) => e.mii.gender - t.mii.gender,
  ],
  $H = [
    (e) => (t) => t.mii.favoriteColor === e,
    (e) => (t) => t.mii.hatType === e,
    (e) => (t) => t.mii.outfitType === e,
    (e) => (t) => t.mii.gender === e,
    (e) => {
      switch (e) {
        case 1:
          return (t) => t.mii.special === 1;
        case 2:
          return (t) => t.mii.transferred === 1;
        case 3:
          return (t) => Number(t.special) === 1;
        default:
        case 0:
          return (t) => t.mii.favorite === 1;
      }
    },
  ];
function cce(e) {
  return new Promise((t) => {
    var r = new FileReader();
    ((r.onload = function (n) {
      t(n.target.result);
    }),
      r.readAsDataURL(e));
  });
}
var renderMiiIcon = async (
    e,
    t = "unknown",
    r = "variableiconbody",
    n = 180,
    i = 0,
    o = !0,
    s = !0,
    a,
    l = !1,
    c = void 0,
    u,
  ) => {
    await waitForFFLResources();
    let d = "",
      h = !0,
      f = ViewType.Face;
    switch (r) {
      case "creditIcon":
        f = ViewType.CreditIcon;
        break;
      case "face":
      case "variableiconbody":
        f = ViewType.Face;
        break;
      case "fflmakeicon":
        ((f = ViewType.MakeIcon), (h = !1));
        break;
      case "all_body":
        f = ViewType.AllBody;
        break;
      case "all_body_sugar":
        f = ViewType.AllBodySugar;
        break;
    }
    let p = "undefined",
      g,
      m,
      A;
    if (typeof e === "string") ((m = decodeHexOrBase64(e)), (A = new Mii(m)), (m = A.export("miic")));
    else ((m = e.export("miic")), (A = e));
    let y = u,
      x = void 0;
    if (!l) {
      if (((c = await getRendererSetting("shaderTypeIcon")), f === ViewType.Face)) ((y = "streetpass"), (x = !0));
    }
    let b = await createMiiModel({
        data: m,
        type: f,
        expression: i,
        module: getFFLModule(),
        renderer: getSharedRenderer(),
        texResolution: 512,
        preferPromise: !0,
        additionalInfo: getAdditionalInfo(A),
        drawBody: h,
        size: n,
        isTemporary: s,
        pose: a,
        ...(c ? { shaderType: c } : {}),
        ...(y ? { bodyModelType: y } : {}),
        ...(x ? { lowQuality: !0 } : {}),
      }),
      v,
      _,
      w = b.result;
    if (o) v = URL.createObjectURL(w);
    else v = await cce(w);
    return ((_ = () => URL.revokeObjectURL(v)), { url: v, blob: w, dispose: _ });
  },
  eG = "wiiu";
document.addEventListener("library-shader-update", async () => {
  eG = await getSetting("shaderTypeN");
});
var tG = "wiiu";
document.addEventListener("library-body-update", async () => {
  tG = await getSetting("bodyModelN");
});
var refreshLibrary = async () => {},
  getRefreshLibrary = () => refreshLibrary;
function libraryApiRequest(e, t, r) {
  return new Promise((n) => {
    let i = "/api/library",
      o,
      s = null;
    switch (e) {
      case 0:
        o = "GET";
        break;
      case 5:
      case 1:
        ((o = "PUT"), (s = { data: t }));
        break;
      case 2:
        ((i += `/${t}`), (o = "PATCH"), (s = { data: r }));
        break;
      case 6:
        ((o = "DELETE"), (s = { data: t }));
        break;
      case 3:
        ((i += `/${t}`), (o = "DELETE"));
        break;
      case 4:
        ((i += "_sort"), (o = "PATCH"), (s = { sort: t }));
        break;
      default:
        throw Error("Failed checking action");
    }
    fetch(i, {
      method: o,
      ...(s !== null
        ? { headers: { "content-type": "application/json" }, body: JSON.stringify(s) }
        : {}),
    })
      .then(async (a) => {
        if (!a.ok) {
          let l = await a.text();
          if (l.startsWith("{")) {
            if (((l = JSON.parse(l)), l.message)) l = l.message;
          }
          (alert("REQ FAILED - Unable to perform action: " + l), n(null));
        }
        a.json()
          .then((l) => n(l))
          .catch((l) => n(l));
      })
      .catch((a) => {
        (alert("REQ FAILED - Unable to perform action: " + a.message), n(null));
      });
  });
}
function openMiiPicker(e, t = !1, r, n, i = !0, o = !1) {
  return new Promise((s) => {
    let a = Modal.modal(
      translate("Notice"),
      null,
      "body",
      { text: translate("Confirm") },
      {
        text: "Cancel",
        callback(p) {
          s(!1);
        },
      },
    );
    a.classOn("random-mii-grid");
    let l = a.qs(".modal-header button");
    if (!t) l.cleanup();
    let c = a.qs(".modal-body");
    c.qsa("span,.flex-group,.flex-group *").forEach((p) => p.style({ display: "none" }));
    let u = new Html("input").attr({ type: "text", placeholder: translate("Search your library...") });
    (c.prepend(u),
      u.on("input", (p) => {
        let g = u.getValue();
        if (g.length > 10 || g.length === 0) {
          h.forEach((A) => A.b.style({ display: "flex" }));
          return;
        }
        let m = fm(g);
        for (let A = 0; A < h.length; A++) {
          let y = h[A].m,
            x = fm(y.nickname),
            b = fm(y.creator);
          if (x.includes(m) || b.includes(m)) h[A].b.style({ display: "flex" });
          else h[A].b.style({ display: "none" });
        }
      }),
      c.prepend(
        new Html("span")
          .style({
            width: "100%",
            padding: "14px 18px",
            background: "var(--hover)",
            color: "var(--text)",
            border: "1px solid var(--stroke)",
            "border-radius": "6px",
            "flex-shrink": "0",
          })
          .text(translate(r)),
      ));
    let d = new Html("div").class("random-mii-container").style({ overflow: "auto" }).appendTo(c),
      h = [],
      f = 0;
    for (let p of e) {
      let g = new Html("button")
          .append(
            new Html("img").style({ opacity: "0", width: "100%", height: "100%" }).attr({ src: "" }),
          )
          .appendTo(d),
        m = new Mii(p.data);
      h.push({ b: g, m });
      async function A() {
        let y = g.qs("img");
        y.attr({ src: m.gender ? SVG_ICONS.loading_icon_f : SVG_ICONS.loading_icon });
        function x() {
          renderMiiIcon(
            m,
            "library",
            "variableiconbody",
            196 * Math.max(1, window.devicePixelRatio) * 2,
            0,
            !0,
            i,
          )
            .then(async (v) => {
              if ((y.attr({ src: v.url }).style({ opacity: "1" }).on("load", v.dispose), v.blob))
                (await localforage.default.removeItem(`icon-${p.id}`),
                  IconCache.cacheIcon(v.blob, p.id, m.exportBase64("miic")));
            })
            .catch((v) => {
              Notify.show(translate("Notice"), translate("Failed to load %1's icon", m.nickname));
            });
        }
        let b = await IconCache.getCachedIcon(p.id);
        if (o) {
          if (b === null) {
            y.attr({ src: SVG_ICONS.loading_icon });
            return;
          }
          let v = URL.createObjectURL(b.icon);
          y.attr({ src: v })
            .style({ opacity: "1" })
            .on("load", () => {
              URL.revokeObjectURL(v);
            });
          return;
        }
        if (b === null) x();
        else {
          if (new Mii(b.curData).exportBase64("miic") !== m.exportBase64("miic")) return x();
          let _ = URL.createObjectURL(b.icon);
          y.attr({ src: _ })
            .style({ opacity: "1" })
            .on("load", () => {
              URL.revokeObjectURL(_);
            });
        }
      }
      if (
        (g.on("click", async () => {
          n(m, p, a).then((y) => {
            if (y) s(y);
          });
        }),
        window.browserMitigations !== void 0)
      )
        setTimeout(async () => {
          A();
        }, f * 50);
      else
        setTimeout(async () => {
          A();
        }, 0);
      f++;
    }
  });
}
function openPersonalMiiPicker(e, t = !1) {
  return openMiiPicker(
    e,
    t,
    "Choose a Mii to be your Personal Mii, which can be used across apps. This can always be changed later in Settings.",
    showPersonalMiiConfirm,
  );
}
function showPersonalMiiConfirm(e, t, r) {
  return new Promise((n) => {
    let i = new Html("img").style({
      opacity: "0",
      width: "210px",
      height: "210px",
      transition: "opacity 0.35s ease",
    });
    (renderMiiIcon(e, "personal_mii_preview", "all_body_sugar", 210).then((o) => {
      i.attr({ src: o.url }).style({ opacity: "1" }).on("load", o.dispose);
    }),
      Modal.modal(
        translate("Is this OK?"),
        new Html("div")
          .style({
            margin: "0 auto",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
          })
          .classOn("col")
          .append(i)
          .prepend(new Html("span").text(translate("This will be set as your Personal Mii."))),
        "body",
        {
          text: "Cancel",
          callback() {
            n(!1);
          },
        },
        {
          text: translate("Close"),
          callback() {
            n(!1);
          },
        },
        {
          text: translate("Confirm"),
          type: "primary",
          async callback(o) {
            if (r) closeModal(r);
            (await fetch("/api/personal_mii", {
              body: JSON.stringify({ id: t.id }),
              method: "POST",
              headers: { "content-type": "application/json" },
            }).catch(void 0),
              n(!0));
          },
        },
      ));
  });
}
async function fetchLibrary() {
  return new Promise((e, t) => {
    fetch("/api/library", { method: "GET" })
      .then((r) => r.json())
      .then((r) => {
        e(r);
      })
      .catch((r) => t(r));
  });
}
var JH = (e) => {
  if (e.g) return { g: e.g, i: e.i.map((t) => t.id) };
  return e.id;
};
var ds = void 0,
  rG = new Jp();
rG.link = function (e) {
  return '<a target="_blank" href="' + e.href + '" title="' + e.text + '">' + e.text + "</a>";
};
var f9 = !1;
async function renderLibraryIcon(e, t, r) {
  function n() {
    return renderMiiIcon(t, "library", "variableiconbody", 196 * Math.max(1, window.devicePixelRatio) * 2, 0)
      .then(
        async (o) =>
          new Promise((s) => {
            r.attr({ src: o.url })
              .style({ opacity: "1" })
              .on("load", async () => {
                if ((o.dispose(), o.blob))
                  (await localforage.default.removeItem(`icon-${e.id}`),
                    await IconCache.cacheIcon(o.blob, e.id, t.exportBase64("miic")));
                s();
              });
          }),
      )
      .catch((o) => {
        Notify.show(translate("Notice"), translate("Failed to load %1's icon", t.nickname));
      });
  }
  let i = await IconCache.getCachedIcon(e.id);
  if (i === null) await n();
  else {
    if (new Mii(i.curData).exportBase64("miic") !== t.exportBase64("miic")) {
      await n();
      return;
    }
    await new Promise((s) => {
      let a = URL.createObjectURL(i.icon);
      r.attr({ src: a })
        .style({ opacity: "1" })
        .on("load", () => {
          (URL.revokeObjectURL(a), s());
        });
    });
  }
}
function fm(e) {
  return e
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
var gk = () => nG(),
  nG = () => {},
  iG = (e) => {
    nG = e;
  };
function openLibrary(e, t = !1, r = !1) {
  return new Promise(async (n) => {
    ((f9 = !0), (eG = await getSetting("shaderTypeN")), (tG = await getSetting("bodyModelN")));
    function i() {
      return new Promise((G) => {
        ((f9 = !1),
          o.class("fadeOut"),
          setTimeout(() => {
            (o.cleanup(), G());
          }, 500));
      });
    }
    refreshLibrary = i;
    let o = new Html("div").class("mii-library").appendTo("body"),
      s;
    if (!t)
      ((s = new Html("div").class("library-sidebar").appendTo(o)),
        s.append(new Html("h1").text("Mii Creator")),
        (document.title = "Mii Creator"));
    let a = new Html("div").class("library-list").appendTo(o),
      l = null;
    if (!r) l = new Html("div").class("library-list-header").appendTo(a);
    let c = new Html("div").class("library-list-content").appendTo(a),
      u = null,
      d = null;
    if (!r)
      ((u = new Html("input")
        .attr({ type: "text", placeholder: translate("Search your library...") })
        .style({ flex: "1" })
        .appendTo(l)),
        (d = addButtonSounds(new Html("button").style({ "min-width": "unset" }).html(SVG_ICONS.filters).prependTo(l))));
    let h = null,
      f;
    if (!t && !r)
      ((h = new Html("button").text(translate("Rearrange")).appendTo(l)),
        (f = new Html("button").text(translate("Multi-select")).appendTo(l)));
    let p = { filters: /*@__PURE__*/ new Map(), sort: 0 };
    if (d)
      d.on("click", async () => {
        function G(Y) {
          if (Y.target.closest(".popup-overlay") === null)
            Html.qsa(".popup-overlay") !== null && Html.qsa(".popup-overlay").forEach((P) => P.cleanup());
        }
        document.addEventListener("pointerdown", G);
        let Q = Pd(),
          de = Modal.modal(
            translate("Filters"),
            translate("Set filter options here."),
            "body",
            {
              text: "Cancel",
              callback(Y) {
                document.removeEventListener("pointerdown", G);
              },
            },
            {
              text: translate("OK"),
              callback(Y) {
                if (
                  (document.removeEventListener("pointerdown", G),
                  g(),
                  p.filters.size > 0 || p.sort > 0)
                )
                  d.classOn("primary");
                else d.classOff("primary");
              },
            },
          );
        de.qs(".modal-content").style({ width: "360px", "max-height": "600px" });
        let oe = de.qs(".modal-body span");
        if (oe) oe.cleanup();
        let K = de.qs(".modal-body .flex-group").elm,
          ae = new Html("div");
        Html.from("body").style({
          "--icon-hat-fill": "#d21e14",
          "--icon-hat-stroke": "#630e09",
          "--icon-custom-hat-fill": "rgb(210, 30, 20)",
          "--icon-custom-hat-stroke": "rgb(140, 20, 13)",
          "--icon-custom-hat-secondary": "rgb(140, 20, 13)",
          "--icon-custom-hat-tertiary": "rgb(237, 78, 69)",
          "--icon-custom-hat-secondary-stroke":
            "rgb(70.30434782608691,10.043478260869568,6.695652173913046)",
          "--icon-custom-hat-tertiary-stroke": "rgb(210,29.999999999999986,19.99999999999997)",
          "--icon-custom-hat-quaternary": "#fff",
          "--icon-custom-hat-quaternary-stroke": "#ccc",
          "--icon-custom-hat-quinary": "#8B4F00",
          "--icon-custom-hat-quinary-stroke": "#582900",
        });
        let Z = new Html("div").class("col").appendTo(ae),
          F = new Html("div").class("col").appendTo(ae);
        function te(Y) {
          return {
            id: `${Y}`,
            item: `<span style='display:block;border-radius:6px;width:26px;height:26px;background-color:${FAVORITE_COLOR_GRADIENTS[Y].top}'></span>`,
          };
        }
        new Html("h3").text("Filters").appendTo(Z);
        let he = new Html("div").class("input-group").appendTo(Z);
        (he.append(new Html("span").text(translate("Favorite Color"))),
          createDropdown(
            he,
            [{ id: "-1", item: translate("Disabled") }, ...range(12).map((Y) => te(Y))],
            (Y) => {
              let P = parseInt(Y);
              if (P === -1) p.filters.delete(0);
              else p.filters.set(0, P);
            },
            String(p.filters.has(0) ? p.filters.get(0) : -1),
            "180px",
            "?",
            void 0,
            !1,
            200,
          ));
        let re = new Html("div").class("input-group").appendTo(Z);
        (re.append(new Html("span").text(translate("Hat type"))),
          createDropdown(
            re,
            [
              { id: "-1", item: translate("Disabled") },
              ...getHatNames().map((Y, P) => ({ id: `${P}`, item: Q.hat[P] ? Q.hat[P] : getHatNames()[P] })),
            ],
            (Y) => {
              let P = parseInt(Y);
              if (P === -1) p.filters.delete(1);
              else p.filters.set(1, P);
            },
            String(p.filters.has(1) ? p.filters.get(1) : -1),
            "180px",
            "?",
            void 0,
            !1,
            360,
          ));
        let le = new Html("div").class("input-group").appendTo(Z);
        (le.append(new Html("span").text(translate("Outfit type"))),
          createDropdown(
            le,
            [
              { id: "-1", item: translate("Disabled") },
              ...getOutfitNames().map((Y, P) => ({ id: `${P}`, item: getOutfitNames()[P] })),
            ],
            (Y) => {
              let P = parseInt(Y);
              if (P === -1) p.filters.delete(2);
              else p.filters.set(2, P);
            },
            String(p.filters.has(2) ? p.filters.get(2) : -1),
            "180px",
            "?",
            void 0,
            !1,
            360,
          ));
        let ue = new Html("div").class("input-group").appendTo(Z);
        (ue.append(new Html("span").text(translate("Style"))),
          createDropdown(
            ue,
            [
              { id: "-1", item: translate("Disabled") },
              { id: "0", item: SVG_ICONS.genderMale },
              { id: "1", item: SVG_ICONS.genderFemale },
            ],
            (Y) => {
              let P = parseInt(Y);
              if (P === -1) p.filters.delete(3);
              else p.filters.set(3, P);
            },
            String(p.filters.has(3) ? p.filters.get(3) : -1),
            "180px",
            "?",
          ));
        let I = new Html("div").class("input-group").appendTo(Z);
        (I.append(new Html("span").text(translate("Priority"))),
          createDropdown(
            I,
            [
              { id: "-1", item: translate("Disabled") },
              { id: "0", item: translate("Favorite") },
              { id: "1", item: translate("Special") },
              { id: "2", item: translate("Transferred") },
              { id: "3", item: translate("Mii Creator Special Mii") },
            ],
            (Y) => {
              let P = parseInt(Y);
              if (P === -1) p.filters.delete(4);
              else p.filters.set(4, P);
            },
            String(p.filters.has(4) ? p.filters.get(4) : -1),
            "180px",
            "?",
            void 0,
            !0,
          ),
          new Html("h3").text(translate("Arrangement")).appendTo(Z));
        let N = new Html("div").class("input-group").appendTo(Z);
        (N.append(new Html("span").text(translate("Sort by.."))),
          createDropdown(
            N,
            [
              { id: "0", item: translate("Custom Sort (Default)") },
              { id: "1", item: translate("Alphabetical") },
              { id: "2", item: translate("Favorite Color") },
              { id: "3", item: translate("Style") },
            ],
            (Y) => {
              let P = parseInt(Y);
              p.sort = P;
            },
            String(p.sort),
            "180px",
            "?",
          ),
          de.qs(".modal-body").elm.insertBefore(ae.elm, K));
      });
    function g() {
      let G = [];
      p.filters.forEach((F, te) => {
        if ($H[te]) G.push($H[te](F));
      });
      function Q(F) {
        return G.every((he) => he(F));
      }
      let de;
      function oe(F, te) {
        return de(F, te);
      }
      if (ZH[p.sort]) de = ZH[p.sort];
      let K = _.map((F, te) => ({ index: te, id: F.id, mii: k[te], special: F.special })),
        Z = K.filter(Q)
          .sort(oe)
          .map((F) => {
            let te = K.indexOf(F);
            return z[te];
          });
      if (
        (z.forEach((F) => {
          if (F.elm.parentElement) F.elm.parentElement.removeChild(F.elm);
        }),
        Z.length === 0)
      ) {
        let F = new Html("div")
          .style({ position: "absolute", top: "2rem", left: "2rem" })
          .text(translate("No Miis were found in your library that match the selected filters."));
        c.append(F);
      } else c.html("");
      Z.forEach((F) => {
        c.append(F);
      });
    }
    let m = !1,
      A,
      y;
    if (!t && !r)
      ((m = !1),
        (A = /*@__PURE__*/ new Map()),
        (y = () => {
          f.classOn("primary").text(
            A.size > 0 ? translate("Multi-select actions...") : translate("Cancel selection"),
          );
        }),
        f.on("click", () => {
          if (x) return;
          if (((m = !m), m))
            (A.clear(),
              y(),
              c.classOn("selection-mode"),
              z.forEach((G) => {
                G.style({ opacity: "0.5" });
              }));
          else if (
            (f.classOff("primary").text(translate("Multi-select")),
            c.classOff("selection-mode"),
            z.forEach((G) => {
              G.style({ opacity: "1.0" }).classOff("selected");
            }),
            A.size > 0)
          )
            openSelectionActionsMenu(A, _);
        }));
    if (!r) {
      if (u)
        u.on("input", (G) => {
          let Q = u.getValue();
          if (Q.length > 10 || Q.length === 0) {
            z.forEach((oe) => oe.style({ display: "flex" }));
            return;
          }
          let de = fm(Q);
          for (let oe = 0; oe < _.length; oe++) {
            let K = k[oe],
              ae = fm(K.nickname),
              Z = fm(K.creator);
            if (ae.includes(de) || Z.includes(de)) z[oe].style({ display: "flex" });
            else z[oe].style({ display: "none" });
          }
        });
    }
    let x = !1;
    if (!r) {
      let G, Q, de, oe;
      h.on("click", () => {
        if (m) return;
        if (oe === void 0) oe = _.slice();
        if (((x = !x), x))
          (h.classOn("primary").text(translate("Done Rearranging")),
            c.style({ opacity: "0.8" }),
            (Q = _.map(JH)),
            (de = Q),
            (G = new yF(c.elm, {
              animation: 150,
              onEnd: function (K) {
                (oe.splice(K.newIndex, 0, oe.splice(K.oldIndex, 1)[0]), (de = oe.map(JH)));
              },
            })));
        else if (
          (h.classOff("primary").text(translate("Rearrange")),
          c.style({ opacity: "1" }),
          G.destroy(),
          !de.every((K, ae) => K === Q[ae]))
        )
          libraryApiRequest(4, JSON.stringify(de));
      });
    }
    let b = Zp(),
      v;
    v = await fetch("/api/library", { headers: { accept: "application/json" } }).then((G) =>
      G.json(),
    );
    let _ = [];
    if (v === null) ((v = []), (_ = await fetchLibrary()));
    else _ = v;
    if (_.length === 0)
      c.append(
        new Html("div")
          .style({ position: "absolute", top: "2rem", left: "2rem" })
          .text(translate("You don't have any Miis. Create one to get started!")),
      );
    else {
      let G = await fetch("/api/personal_mii");
      if (!G.ok) await openPersonalMiiPicker(_);
      ds = await G.json();
    }
    await IconCache.purgeIconCache(_);
    let w = [],
      S = () => new Promise((G) => requestAnimationFrame(G));
    async function E(G, Q = 8) {
      let de = G.length;
      if (de === 0) return;
      let oe = 0;
      (M(), C(0, de));
      let K = /*@__PURE__*/ new Set();
      for (let ae of G) {
        let Z = (async () => {
          if (!f9) return;
          try {
            await renderLibraryIcon(ae.mii, ae.miiData, ae.miiImage);
          } catch (F) {
          } finally {
            (oe++, C(oe, de));
          }
        })();
        if ((K.add(Z), Z.then(() => K.delete(Z)), K.size >= Q))
          (await Promise.race(K), await new Promise((F) => requestAnimationFrame(F)));
      }
      (await Promise.all(K), R());
    }
    let T = new Html("div").style({ position: "fixed", bottom: "50px", right: "50px" }).appendTo(a);
    function M() {
      let G = T.elm;
      if (G) G.style.display = "block";
    }
    function C(G, Q) {
      let de = Math.round((G / Q) * 100),
        oe = T.elm;
      if (oe) oe.innerText = `Creating icons... ${G}/${Q} (${de}%)`;
    }
    function R() {
      let G = T.elm;
      if (G)
        setTimeout(() => {
          G.style.display = "none";
        }, 500);
    }
    let B = 0,
      L = 0,
      k = [],
      z = [];
    for (let G of _) {
      let Q = new Html("div").class("library-list-mii");
      ((z[L] = Q), addButtonSounds(Q));
      let de = null;
      try {
        ((de = new Mii(G.data)), (k[L] = de), de.validate());
        let oe = !1;
        if (G.special)
          (Q.classOn("highlight").style({ "--selection-color": "#ffbf00" }), (oe = !0));
        Q.style({ "--color": FAVORITE_COLOR_GRADIENTS[de.favoriteColor % Object.keys(FAVORITE_COLOR_GRADIENTS).length].top });
        let K = new Html("img")
          .attr({ draggable: "false" })
          .style({ opacity: "0", transition: "opacity 0.3s ease" });
        if (window.browserMitigations !== void 0)
          setTimeout(() => {
            w.push({ mii: G, miiData: de, miiImage: K });
          }, L * 100);
        else w.push({ mii: G, miiData: de, miiImage: K });
        if (
          de.special === 1 ||
          de.favorite === 1 ||
          oe ||
          (ds !== void 0 && typeof ds.id < "u" && ds.id === G.id)
        ) {
          let he = new Html("i")
            .style({ position: "absolute", top: "-22px", right: "-18px", "pointer-events": "none" })
            .appendTo(Q);
          if (de.favorite === 1) he.html(SVG_ICONS.favorite).style({ color: Z9 });
          if (de.special === 1 || oe) he.html(SVG_ICONS.special).style({ color: wv });
          if (ds) {
            if (ds.id) {
              if (ds.id === G.id) he.html(SVG_ICONS.personal).style({ color: wv });
            }
          }
        }
        let ae = new Html("span").text(de.nickname),
          Z;
        if (r) {
          if (ds) {
            if (ds.id) {
              if (ds.id === G.id) Z = createSaveHandler(G, de, Q, oe, !0);
            }
          }
        } else if (!t) Z = createSaveHandler(G, de, Q, oe);
        else
          Z = async () => {
            try {
              de.validate();
            } catch (le) {
              return Modal.alert(translate("Warning"), translate("This Mii might be corrupted."), "body");
            }
            let he = Modal.modal(
                de.nickname,
                "Do you want to choose this Mii?",
                "body",
                {
                  text: translate("Select"),
                  async callback() {
                    n({ mii: G, miiData: de });
                  },
                },
                { text: "Cancel" },
              ),
              re = new Html("img").style({
                "object-fit": "cover",
                width: "240px",
                height: "240px",
                margin: "-26px auto -26px",
                transition: "opacity 0.3s ease",
                opacity: "0",
              });
            (renderMiiIcon(de, "preview", "all_body_sugar", 480).then((le) => {
              re.attr({ src: le.url }).style({ opacity: "1" }).on("load", le.dispose);
            }),
              he
                .qs(".modal-body")
                .elm.insertBefore(re.elm, he.qs(".modal-content .flex-group").elm));
          };
        let F = L;
        if (
          (Q.on("click", async () => {
            if (x) return;
            if (m) {
              if (A.has(_[F].id))
                (Q.style({ opacity: "0.5" }).classOff("selected"), A.delete(_[F].id));
              else
                (Q.style({ opacity: "1" }).classOn("selected"),
                  A.set(_[F].id, { ..._[F], html: z[F] }));
              if (y) y();
              return;
            }
            Z && Z();
          }),
          r)
        ) {
          if (ds) {
            if (ds.id) {
              if (ds.id !== G.id) Q.style({ opacity: "0.25" });
            }
          }
        }
        let ttsAction = null;
        if (!r && !t) {
          ttsAction = new Html("button").text("🔊 Mii TTS Generator").style({
            width: "100%", "margin-top": "6px", padding: "7px 9px", "font-size": "0.78rem",
            "border-radius": "7px", border: "1px solid var(--stroke)", background: "var(--container)",
            color: "var(--text)", cursor: "pointer",
          });
          ttsAction.elm.addEventListener("click", (event) => {
            event.stopPropagation();
            openMiiTTSGenerator(de, G);
          });
        }
        let te = !1;
        (K.on("error", () => {
          if (te === !0) return;
          (K.attr({ src: "data:image/svg+xml," + encodeURIComponent(SVG_ICONS.error) }), (te = !0));
        }),
          K.on("load", () => {
            I_();
          }),
          Q.appendMany(...(ttsAction ? [K, ae, ttsAction] : [K, ae])).appendTo(c),
          setTimeout(() => {
            let he = e;
            if (r) {
              if (ds) {
                if (ds.id) {
                  if (ds.id === G.id) he = G.id;
                }
              }
            }
            if (he !== void 0) {
              if (he === G.id) {
                (Q.classOn("highlight"),
                  setTimeout(() => {
                    if (oe === !1) Q.classOff("highlight");
                  }, 2000));
                let re = Q.elm;
                re.closest(".library-list-content").scroll({
                  top: re.getBoundingClientRect().top + re.getBoundingClientRect().height,
                  behavior: "smooth",
                });
              }
            }
          }, 500));
      } catch (oe) {
        B++;
        let K = new Html("img").attr({ src: "data:image/svg+xml," + encodeURIComponent(SVG_ICONS.error) }),
          ae = new Html("span").text(translate("?"));
        if (de !== null) {
          if (de.nickname.trim() !== "") ae.text(de.nickname);
        }
        (Q.appendMany(K, ae).appendTo(c),
          Q.on("click", async () => {
            Modal.modal(
              translate("Warning"),
              translate("This Mii might be corrupted. Choose an option below."),
              "body",
              { text: "Cancel" },
              {
                text: translate("Download a copy"),
                callback(Z) {
                  downloadBinary(decodeHexOrBase64(G.data).buffer, G.id + ".miic");
                },
              },
              {
                text: translate("Download a copy (Base64 encoded)"),
                callback(Z) {
                  downloadBinary(bytesToBase64(decodeHexOrBase64(G.data)), G.id + ".miic.txt");
                },
              },
              {
                text: translate("Delete"),
                callback(Z) {
                  Modal.modal(
                    translate("Warning"),
                    translate("Are you sure you want to delete this Mii?"),
                    "body",
                    {
                      async callback(F) {
                        (await libraryApiRequest(3, G.id), await refreshLibrary(), openLibrary());
                      },
                      text: translate("Yes"),
                      type: "danger",
                    },
                    { text: translate("No") },
                  );
                },
              },
            );
          }));
      }
      L++;
    }
    if ((E(w), B > 0))
      Modal.modal(
        translate("Error"),
        translate(
          `It appears that %1 of your Miis have failed to load. Their data may be corrupted.

If you'd like to try and recover the Mii data, you can select the Miis with errors and choose to either save a copy or delete them.`,
          B,
        ),
        "body",
        ...defaultModalButtons(),
      );
    let X;
    if (r)
      X = new Html("button")
        .text(translate("Create Mii"))
        .attr({ disabled: !0 })
        .prepend(new Html("span").style({ display: "inline-flex" }).html(SVG_ICONS.main_menu_create));
    else
      X = new Html("button")
        .text(translate("Create Mii"))
        .prepend(new Html("span").style({ display: "inline-flex" }).html(SVG_ICONS.main_menu_create))
        .on("click", async () => {
          openCreateMiiDialog();
        });
    if (!t)
      s.appendMany(
        new Html("div").class("sidebar-buttons").appendMany(
          addButtonSounds(X),
          addButtonSounds(
            new Html("button")
              .text(translate("Settings"))
              .prepend(new Html("span").style({ display: "inline-flex" }).html(SVG_ICONS.main_menu_settings))
              .on("click", async () => {
                openSettingsDialog();
              }),
          ),
          new Html("div").style({ display: "flex", gap: "0.5rem" }).appendMany(
            addButtonSounds(
              new Html("button")
                .style({ flex: "1 1 0%" })
                .text(translate("Home"))
                .prepend(new Html("span").style({ display: "inline-flex" }).html(SVG_ICONS.main_menu_home))
                .on("click", () => {
                  location.href = "/";
                }),
            ),
            addButtonSounds(
              new Html("button")
                .style({ flex: "1 1 0%" })
                .text(translate("Credits"))
                .prepend(new Html("span").style({ display: "inline-flex" }).html(SVG_ICONS.main_menu_credits))
                .on("click", async () => {
                  let G = new Html("div").html(await jB(CREDITS_MARKDOWN, { renderer: rG }));
                  Modal.modal(
                    translate("Credits"),
                    G,
                    "body",
                    { callback() {}, text: "Cancel" },
                    {
                      async callback() {
                        let de = new Html("div").text(THIRD_PARTY_NOTICES);
                        Modal.modal(translate("Third-Party Licenses"), de, "body", ...defaultModalButtons())
                          .qs(".modal-content")
                          .classOn("md")
                          .style({ "max-width": "720px", "max-height": "600px" });
                      },
                      text: translate("Third-Party Licenses"),
                    },
                  )
                    .qs(".modal-content")
                    .classOn("md")
                    .style({ "max-width": "700px", "max-height": "600px" });
                }),
            ),
          ),
        ),
        new Html("div").class("sidebar-credits").appendMany(
          new Html("strong").text(translate("This site is not affiliated with Nintendo.")),
          new Html("small")
            .html(
              translate(
                "Mii Creator %1 by kat21 (<b>%2</b>)<br>Built on %3",
                APP_CONFIG.version.string(),
                APP_CONFIG.version.name(),
                "October 21, 2026 at 10:05 AM UTC",
              ),
            )
            .style({ cursor: "pointer" })
            .on("click", () => {
              qD();
            }),
          addButtonSounds(
            new Html("a")
              .html(
                `<img style='height:48px' src="./assets/images/charline.png">${translate("Check out our YouTube channel!")}`,
              )
              .attr({ href: "https://youtube.com/@MiiCreatorREAL", target: "_blank" })
              .styleJs({ gap: "12px", display: "flex", alignItems: "center", cursor: "pointer" }),
          ),
        ),
      );
  });
}
