// src/app/mii/mii-toolkit.js
// PJ Mii Toolkit: local Mii format inspector/converter and a curated Mii project hub.
// This module uses the creator's existing Mii parser/exporter; it does not vendor third-party code.

function installMiiToolkitHub() {
  if (document.getElementById("pj-mii-toolkit-launcher")) return;

  const style = document.createElement("style");
  style.textContent = `
    #pj-mii-toolkit-launcher{position:fixed;right:18px;bottom:76px;z-index:9998;padding:11px 15px;border:1px solid #86c99a;border-radius:999px;background:linear-gradient(135deg,#14532d,#15803d);color:#fff;font:800 13px Segoe UI,Arial;cursor:pointer;box-shadow:0 5px 20px #0004}
    #pj-mii-toolkit-overlay{position:fixed;inset:0;z-index:10020;background:#06140dcc;display:none;align-items:center;justify-content:center;padding:16px;font:14px Segoe UI,Arial;color:#e8f5eb}
    #pj-mii-toolkit-panel{width:min(760px,100%);max-height:min(88vh,900px);overflow:auto;background:linear-gradient(145deg,#10251b,#142d20);border:1px solid #4d8a61;border-radius:16px;box-shadow:0 20px 70px #0009;padding:20px}
    #pj-mii-toolkit-panel h2{margin:0 0 6px;font-size:22px;color:#b8f2c7}
    #pj-mii-toolkit-panel h3{margin:18px 0 8px;color:#b8f2c7;font-size:15px}
    #pj-mii-toolkit-panel p{color:#c5d9ca;line-height:1.5}
    #pj-mii-toolkit-panel .pj-toolkit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px}
    #pj-mii-toolkit-panel .pj-toolkit-card{background:#193b29;border:1px solid #386b49;border-radius:10px;padding:12px}
    #pj-mii-toolkit-panel .pj-toolkit-card a{color:#a7efbb;font-weight:700;text-decoration:none}
    #pj-mii-toolkit-panel .pj-toolkit-card a:hover{text-decoration:underline}
    #pj-mii-toolkit-panel button,#pj-mii-toolkit-panel select,#pj-mii-toolkit-panel input{font:inherit}
    #pj-mii-toolkit-panel button{border:1px solid #76b989;background:#236b3c;color:#fff;border-radius:8px;padding:8px 12px;cursor:pointer}
    #pj-mii-toolkit-panel button:disabled{opacity:.5;cursor:not-allowed}
    #pj-mii-toolkit-panel select,#pj-mii-toolkit-panel input[type=file]{max-width:100%;background:#edf7ef;color:#10251b;border:1px solid #9bbca4;border-radius:7px;padding:7px}
    #pj-mii-toolkit-panel .pj-toolkit-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}
    #pj-mii-toolkit-status{white-space:pre-wrap;background:#0b1c12;border:1px solid #31583d;border-radius:9px;padding:11px;color:#d6eadb;min-height:52px;overflow-wrap:anywhere}
    #pj-mii-toolkit-close{float:right;background:#344b3b!important;border-color:#688071!important}
    @media(max-width:520px){#pj-mii-toolkit-panel{padding:14px}#pj-mii-toolkit-launcher{right:10px;bottom:72px}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "pj-mii-toolkit-launcher";
  launcher.type = "button";
  launcher.textContent = "🧰 Mii Toolkit";
  document.body.appendChild(launcher);

  const overlay = document.createElement("div");
  overlay.id = "pj-mii-toolkit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Mii Toolkit");
  overlay.innerHTML = `
    <section id="pj-mii-toolkit-panel">
      <button id="pj-mii-toolkit-close" type="button">Close ✕</button>
      <h2>🧰 PJ Mii Toolkit</h2>
      <p>Inspect and convert Mii data with the creator's existing parser. Files are processed locally in this browser; nothing is uploaded by this toolkit.</p>
      <h3>Mii Format Lab</h3>
      <div class="pj-toolkit-row"><input id="pj-mii-toolkit-file" type="file" accept=".miic,.ffsd,.bin,.dat,.mii,.txt,.charinfo,.studio" aria-label="Choose a Mii data file"></div>
      <div class="pj-toolkit-row">
        <label for="pj-mii-toolkit-format">Export format</label>
        <select id="pj-mii-toolkit-format">
          <option value="miic">MIIC (creator format)</option>
          <option value="ffsd">FFSD</option>
          <option value="studioData">Mii Studio data</option>
          <option value="switchCharInfo">Switch CharInfo</option>
          <option value="rcd">Wii RCD</option>
          <option value="rsd">Wii RSD</option>
        </select>
        <button id="pj-mii-toolkit-export" type="button" disabled>Export converted file</button>
      </div>
      <div id="pj-mii-toolkit-status" aria-live="polite">Choose a supported Mii data file to inspect it.</div>
      <h3>FFL.js Renderer Preview</h3>
      <p>Runs the actual FFL.js Three.js renderer against files you select. The renderer bundle and loader are included with their AGPL-3.0 license; the matching WebAssembly binary is fetched from the upstream FFL.js release when initialized.</p>
      <div class="pj-toolkit-row"><label>FFL resource <input id="pj-ffljs-resource" type="file" accept=".dat,.bin" style="max-width:190px"></label></div>
      <div class="pj-toolkit-row"><label>Mii data <input id="pj-ffljs-mii" type="file" accept=".charinfo,.ffsd,.ffcd,.cfcd,.rsd,.rcd,.bin,.mii" style="max-width:190px"></label></div>
      <div class="pj-toolkit-row"><button id="pj-ffljs-render" type="button">Initialize FFL.js + Render Mii</button><button id="pj-ffljs-clear" type="button">Clear preview</button></div>
      <div id="pj-ffljs-preview" class="pj-toolkit-card" style="min-height:40px;display:flex;align-items:center;justify-content:center;overflow:hidden"></div>
      <div id="pj-ffljs-status" aria-live="polite" class="pj-toolkit-card">Select a compatible FFL resource archive and a Wii U / 3DS / Switch Mii data file.</div>
      <h3>MiiJS Extended Format Lab</h3>
      <p>Optional MiiJS 3.1.1 engine for broader Mii format detection, import, conversion, JSON export and QR image export. The engine is loaded online from jsDelivr only when you press Load MiiJS.</p>
      <div class="pj-toolkit-row">
        <button id="pj-miijs-load" type="button">Load MiiJS engine (online)</button>
        <button id="pj-miijs-import" type="button" disabled>Import Mii / QR image</button>
        <input id="pj-miijs-file" type="file" accept=".mii,.rcd,.rsd,.ncd,.nsd,.cfcd,.cfsd,.ffcd,.ffsd,.charinfo,.studio,.mnms,.ltd,.fedex,.fsdex,.png,.jpg,.jpeg,.webp,.bin" style="display:none">
      </div>
      <div class="pj-toolkit-row">
        <label for="pj-miijs-format">Output format</label>
        <select id="pj-miijs-format" disabled><option value="">Load MiiJS first</option></select>
      </div>
      <div class="pj-toolkit-row">
        <button id="pj-miijs-export" type="button" disabled>Export selected format</button>
        <button id="pj-miijs-json" type="button" disabled>Export Mii JSON</button>
        <button id="pj-miijs-qr" type="button" disabled>Export 3DS QR PNG</button>
      </div>
      <div id="pj-miijs-status" aria-live="polite" class="pj-toolkit-card">MiiJS is not loaded. The existing creator parser remains available without it.</div>
      <h3>FFL Resource Lab · JavaScript extractor</h3>
      <p>Extracts shape meshes as GLB and textures as PNG from a compatible FFRA resource archive. Everything runs locally in your browser.</p>
      <div class="pj-toolkit-row"><input id="pj-ffl-archive" type="file" accept=".dat,.bin,application/octet-stream" aria-label="Choose FFL resource archive"></div>
      <div class="pj-toolkit-row">
        <label>Texture entries <input id="pj-ffl-texture-count" type="number" min="1" max="4096" value="317" style="width:76px"></label>
        <label>Shape entries <input id="pj-ffl-shape-count" type="number" min="1" max="8192" value="857" style="width:76px"></label>
        <button id="pj-ffl-extract" type="button">Extract GLB + PNG ZIP</button>
      </div>
      <div id="pj-ffl-status" aria-live="polite" class="pj-toolkit-card">Choose an FFL resource archive. Default counts are for the common 317-texture / 857-shape layout.</div>
      <h3>Mii ecosystem projects</h3>
      <div class="pj-toolkit-grid">
        <article class="pj-toolkit-card"><strong>MiiAnimator</strong><p>Native .miianim v2 import and bone-track playback are now in Pose Maker, alongside basic two-bone IK controls. Multi-actor playback and particle effects remain future work.</p><a href="https://github.com/patchzyy/MiiAnimator" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>MiiPy</strong><p>Found a separate MIT-licensed MiiPy project: its two-bone IK and pose-rig ideas inspired the new live IK controls. Its native C++ backend and collision system are not ported.</p><a href="https://github.com/davitizhgenti/miipy" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>MiiJS</strong><p>Optional MiiJS 3.1.1 integration now provides broader format detection, conversion, JSON export and 3DS QR export. The engine loads online on request.</p><a href="https://github.com/Stewared/MiiJS" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>FFL.js</strong><p>Optional FFL.js Three.js renderer preview is integrated. The browser bundle, shader, loader and AGPL-3.0 license are included.</p><a href="https://github.com/ariankordi/FFL.js" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>FFL-Testing</strong><p>The native C++ test application is not ported, but this creator now has an FFL.js renderer preview and JavaScript resource diagnostics.</p><a href="https://github.com/ariankordi/FFL-Testing" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>Mii Assets</strong><p>The archive parser, shape-to-GLB exporter and texture-to-PNG extractor have been rewritten in JavaScript.</p><a href="https://github.com/jaames/mii-assets" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>Miipedia · The Mii Hub</strong><p>Community Mii sharing and discovery. Opens externally; this app does not upload your Miis there.</p><a href="https://miipedia.com/miis" target="_blank" rel="noopener noreferrer">Browse Mii gallery ↗</a></article>
        <article class="pj-toolkit-card"><strong>MiiInfoEditor</strong><p>JavaScript-based Wii Mii data editor and RKG ghost-data import reference; useful for expanding legacy Wii data support.</p><a href="https://github.com/kazuki-4ys/MiiInfoEditor" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>MiiStudioFixer</strong><p>Improves Mii Studio preview/render behavior. A reference for better preview accuracy and editor quality-of-life ideas.</p><a href="https://github.com/Stewared/MiiStudioFixer" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>NX Plaza</strong><p>StreetPass-inspired Mii cards, collections, mini-games and community features for Switch homebrew; inspiration for future offline card and collection tools.</p><a href="https://github.com/Insektaure/NX-Plaza" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>LTD Merge</strong><p>Manifest-driven Mii editor asset workflow. The validation and manifest concepts can inspire a future browser-based asset pack validator.</p><a href="https://github.com/crackheadakira/ltdmerge" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
      </div>
      <p><strong>Compatibility note:</strong> The supplied ariankordi/MiiPy URL returns 404. I found a separate project at davitizhgenti/miipy and used its MIT-licensed two-bone IK concepts as a reference; it may or may not be the project you intended. The native C++ backend, full collision resolver and webcam retargeter are not ported.</p>
    </section>`;
  document.body.appendChild(overlay);




  const ffljsResourceInput = overlay.querySelector("#pj-ffljs-resource");
  const ffljsMiiInput = overlay.querySelector("#pj-ffljs-mii");
  const ffljsRenderButton = overlay.querySelector("#pj-ffljs-render");
  const ffljsClearButton = overlay.querySelector("#pj-ffljs-clear");
  const ffljsPreview = overlay.querySelector("#pj-ffljs-preview");
  const ffljsStatus = overlay.querySelector("#pj-ffljs-status");
  let ffljsInstance = null, ffljsModel = null, ffljsRenderer = null, ffljsScene = null, ffljsCamera = null;
  const ffljsLoadScript = (src, key) => new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pj-ffljs="' + key + '"]');
    if (existing) { if (existing.dataset.loaded === "yes") resolve(); else { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); } return; }
    const script = document.createElement("script"); script.src = src; script.async = true; script.dataset.pjFfljs = key;
    script.onload = () => { script.dataset.loaded = "yes"; resolve(); }; script.onerror = () => reject(new Error("Could not load " + key));
    document.head.appendChild(script);
  });
  const clearFfljsPreview = () => {
    try { ffljsModel?.dispose?.(); } catch {}
    try { ffljsInstance?.dispose?.(); } catch {}
    ffljsModel = null; ffljsInstance = null;
    if (ffljsRenderer) { ffljsRenderer.dispose(); ffljsRenderer.domElement.remove(); }
    ffljsRenderer = null; ffljsScene = null; ffljsCamera = null;
    ffljsPreview.textContent = "FFL.js preview cleared.";
  };
  ffljsClearButton.addEventListener("click", clearFfljsPreview);
  ffljsRenderButton.addEventListener("click", async () => {
    const resourceFile = ffljsResourceInput.files && ffljsResourceInput.files[0];
    const miiFile = ffljsMiiInput.files && ffljsMiiInput.files[0];
    if (!resourceFile || !miiFile) { ffljsStatus.textContent = "Choose both an FFL resource archive and a Mii data file."; return; }
    ffljsRenderButton.disabled = true; ffljsStatus.textContent = "Loading FFL.js renderer…";
    try {
      clearFfljsPreview();
      const three = typeof getTHREE === "function" ? getTHREE() : window.THREE;
      if (!three) throw new Error("The app's Three.js namespace is unavailable.");
      window.THREE = three;
      const sourceRoot = new URL("../src/vendor/ffljs/", document.baseURI).href;
      await ffljsLoadScript(sourceRoot + "ffl-emscripten.cjs", "emscripten");
      await ffljsLoadScript(sourceRoot + "ffl.browser.js", "renderer");
      await ffljsLoadScript(sourceRoot + "FFLShaderMaterial.browser.js", "material");
      if (!window.ModuleFFL || !window.FFLjs) throw new Error("FFL.js globals were not initialized.");
      ffljsStatus.textContent = "Initializing WebAssembly and loading your FFL resource…";
      const wasmUrl = "https://raw.githubusercontent.com/ariankordi/FFL.js/v2.2.2/ffl-emscripten.wasm";
      const module = await window.ModuleFFL({ locateFile: () => wasmUrl });
      ffljsInstance = await window.FFLjs.FFL.initWithResource(new Uint8Array(await resourceFile.arrayBuffer()), module);
      const data = new Uint8Array(await miiFile.arrayBuffer());
      ffljsRenderer = new three.WebGLRenderer({ alpha: true, antialias: true });
      ffljsRenderer.setPixelRatio(1); ffljsRenderer.setSize(300, 300);
      ffljsScene = new three.Scene();
      ffljsCamera = window.FFLjs.ModelIcon.getCamera();
      ffljsModel = new window.FFLjs.CharModel(ffljsInstance, data, window.FFLjs.FFLCharModelDescDefault, (window.FFLShaderMaterial || three.MeshStandardMaterial), ffljsRenderer);
      ffljsScene.add(ffljsModel.meshes);
      ffljsPreview.appendChild(ffljsRenderer.domElement);
      ffljsRenderer.render(ffljsScene, ffljsCamera);
      ffljsStatus.textContent = "✓ FFL.js rendered " + miiFile.name + " using " + resourceFile.name + ".";
    } catch (error) {
      clearFfljsPreview();
      ffljsStatus.textContent = "FFL.js render failed: " + (error && error.message ? error.message : String(error));
    } finally { ffljsRenderButton.disabled = false; }
  });

  const miijsLoadButton = overlay.querySelector("#pj-miijs-load");
  const miijsImportButton = overlay.querySelector("#pj-miijs-import");
  const miijsFileInput = overlay.querySelector("#pj-miijs-file");
  const miijsFormatSelect = overlay.querySelector("#pj-miijs-format");
  const miijsExportButton = overlay.querySelector("#pj-miijs-export");
  const miijsJsonButton = overlay.querySelector("#pj-miijs-json");
  const miijsQrButton = overlay.querySelector("#pj-miijs-qr");
  const miijsStatus = overlay.querySelector("#pj-miijs-status");
  let miijsModule = null, miijsMii = null, miijsLoadPromise = null;
  const miijsDownload = (data, filename, mime = "application/octet-stream") => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  };
  miijsLoadButton.addEventListener("click", async () => {
    if (miijsModule) return;
    miijsLoadButton.disabled = true;
    miijsStatus.textContent = "Loading MiiJS 3.1.1 from jsDelivr…";
    try {
      miijsLoadPromise ||= import("https://cdn.jsdelivr.net/npm/miijs@3.1.1/dist/miijs.browser.js");
      miijsModule = await miijsLoadPromise;
      const formats = miijsModule.MiiFormats || {};
      const seen = new Set();
      miijsFormatSelect.innerHTML = "";
      for (const [name, value] of Object.entries(formats)) {
        if (typeof value !== "string" || seen.has(value)) continue;
        seen.add(value);
        const option = document.createElement("option"); option.value = value; option.textContent = name + " · " + value;
        miijsFormatSelect.appendChild(option);
      }
      if (!miijsFormatSelect.options.length) throw new Error("MiiJS did not expose its format list.");
      miijsFormatSelect.disabled = false;
      miijsImportButton.disabled = false;
      miijsStatus.textContent = "✓ MiiJS loaded. Supported formats: " + seen.size + ". Select a Mii file or a QR image.";
    } catch (error) {
      miijsLoadPromise = null;
      miijsStatus.textContent = "MiiJS could not load: " + (error && error.message ? error.message : String(error));
      miijsLoadButton.disabled = false;
    }
  });
  miijsImportButton.addEventListener("click", () => miijsFileInput.click());
  miijsFileInput.addEventListener("change", async () => {
    const file = miijsFileInput.files && miijsFileInput.files[0]; miijsFileInput.value = "";
    if (!file || !miijsModule) return;
    miijsStatus.textContent = "Detecting and decoding " + file.name + "…";
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const detected = miijsModule.detectMiiFormat ? miijsModule.detectMiiFormat(buffer) : [];
      miijsMii = await miijsModule.Mii.create(buffer);
      const fields = miijsMii.fields || {};
      const meta = fields.meta || {};
      miijsExportButton.disabled = false; miijsJsonButton.disabled = false; miijsQrButton.disabled = false;
      miijsStatus.textContent = "✓ Imported with MiiJS\\nName: " + (meta.name || "(unnamed)") +
        "\\nCreator: " + (meta.creatorName || "(not stored)") +
        "\\nDetected formats: " + (detected.length ? detected.join(", ") : "MiiJS recognized the data") +
        "\\nFields available for JSON export: " + Object.keys(fields).length;
    } catch (error) {
      miijsMii = null; miijsExportButton.disabled = true; miijsJsonButton.disabled = true; miijsQrButton.disabled = true;
      miijsStatus.textContent = "MiiJS import failed: " + (error && error.message ? error.message : String(error));
    }
  });
  miijsExportButton.addEventListener("click", async () => {
    if (!miijsMii) return;
    try {
      const format = miijsFormatSelect.value, data = await miijsMii.encode(format);
      miijsDownload(data, (miijsMii.fields?.meta?.name || "mii") + "." + format);
      miijsStatus.textContent += "\\n✓ Exported " + format + ".";
    } catch (error) { miijsStatus.textContent += "\\nExport failed: " + String(error?.message || error); }
  });
  miijsJsonButton.addEventListener("click", () => {
    if (!miijsMii) return;
    miijsDownload(JSON.stringify(miijsMii.toJSON(), null, 2), (miijsMii.fields?.meta?.name || "mii") + "-miijs.json", "application/json");
  });
  miijsQrButton.addEventListener("click", async () => {
    if (!miijsMii) return;
    try {
      const data = await miijsMii.toQR("3DS");
      miijsDownload(data, (miijsMii.fields?.meta?.name || "mii") + "-3ds-qr.png", "image/png");
      miijsStatus.textContent += "\\n✓ Generated a 3DS QR PNG.";
    } catch (error) { miijsStatus.textContent += "\\nQR export failed: " + String(error?.message || error); }
  });

  const fflFileInput = overlay.querySelector("#pj-ffl-archive");
  const fflExtractButton = overlay.querySelector("#pj-ffl-extract");
  const fflStatus = overlay.querySelector("#pj-ffl-status");
  fflExtractButton.addEventListener("click", async () => {
    const file = fflFileInput.files && fflFileInput.files[0];
    if (!file) { fflStatus.textContent = "Choose an FFL resource archive first."; return; }
    if (!window.PJFFLResourceTools) { fflStatus.textContent = "The JavaScript FFL extractor did not load."; return; }
    const textureCount = Number(overlay.querySelector("#pj-ffl-texture-count").value);
    const shapeCount = Number(overlay.querySelector("#pj-ffl-shape-count").value);
    if (!Number.isInteger(textureCount) || textureCount < 1 || !Number.isInteger(shapeCount) || shapeCount < 1) {
      fflStatus.textContent = "Enter valid positive texture and shape counts."; return;
    }
    fflExtractButton.disabled = true;
    fflStatus.textContent = "Reading archive and extracting resources…";
    try {
      const result = await window.PJFFLResourceTools.extract(await file.arrayBuffer(), {
        textureCount, shapeCount,
        onProgress: (kind, current, total) => { fflStatus.textContent = "Extracting " + kind + ": " + current + " / " + total; }
      });
      const blob = new Blob([result.zip], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = file.name.replace(/\.[^.]+$/, "") + "-ffl-extracted.zip";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      fflStatus.textContent = "✓ Extracted " + result.files.length + " resources from FFRA v" + result.archive.version.toString(16) + ". ZIP contains meshes/*.glb and textures/*.png.";
    } catch (error) {
      fflStatus.textContent = "Extraction failed: " + (error && error.message ? error.message : String(error));
    } finally { fflExtractButton.disabled = false; }
  });

  const fileInput = overlay.querySelector("#pj-mii-toolkit-file");
  const formatSelect = overlay.querySelector("#pj-mii-toolkit-format");
  const exportButton = overlay.querySelector("#pj-mii-toolkit-export");
  const status = overlay.querySelector("#pj-mii-toolkit-status");
  let activeMii = null;
  let activeName = "mii";

  function open() { overlay.style.display = "flex"; }
  function close() { overlay.style.display = "none"; }
  launcher.addEventListener("click", open);
  overlay.querySelector("#pj-mii-toolkit-close").addEventListener("click", close);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlay.style.display === "flex") close(); });

  function bytesToHexPreview(bytes) {
    return Array.from(bytes.slice(0, 12), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0];
    activeMii = null;
    exportButton.disabled = true;
    if (!file) { status.textContent = "Choose a supported Mii data file to inspect it."; return; }
    try {
      let parsed;
      if (file.name.toLowerCase().endsWith(".txt")) {
        parsed = new Mii((await file.text()).trim());
      } else {
        parsed = new Mii(new Uint8Array(await file.arrayBuffer()));
      }
      if (!parsed || typeof parsed.export !== "function") throw new Error("The file did not produce a valid Mii object.");
      const canonical = parsed.export("miic");
      activeMii = parsed;
      activeName = file.name.replace(/\.[^.]+$/, "") || "mii";
      exportButton.disabled = false;
      const originNames = {0:"Unknown",1:"Wii",2:"3DS",3:"Wii U",4:"Switch",5:"Mii Studio"};
      status.textContent = [
        "✓ Mii data parsed successfully",
        "Name: " + (parsed.nickname || "(unnamed)"),
        "Creator: " + (parsed.creator || "(not stored)"),
        "Origin: " + (originNames[parsed.originPlatform] || "Platform " + parsed.originPlatform),
        "Gender value: " + parsed.gender,
        "Height / build: " + parsed.height + " / " + parsed.build,
        "Canonical MIIC size: " + canonical.length + " bytes",
        "Input: " + file.name + " (" + file.size + " bytes)"
      ].join("\n");
    } catch (error) {
      status.textContent = "Could not parse this file as a supported Mii format.\n" + (error && error.message ? error.message : String(error));
    }
  });

  exportButton.addEventListener("click", () => {
    if (!activeMii) return;
    try {
      const format = formatSelect.value;
      const bytes = activeMii.export(format);
      const extensions = {miic:"miic",ffsd:"ffsd",studioData:"bin",switchCharInfo:"charinfo",rcd:"rcd",rsd:"rsd"};
      const blob = new Blob([bytes], {type:"application/octet-stream"});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = activeName + "." + (extensions[format] || "bin");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent += "\n\n✓ Exported " + format + " (" + bytes.length + " bytes).";
    } catch (error) {
      status.textContent += "\n\nExport failed: " + (error && error.message ? error.message : String(error));
    }
  });
}
