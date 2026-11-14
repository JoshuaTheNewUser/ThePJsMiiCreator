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
      <h3>Mii ecosystem projects</h3>
      <div class="pj-toolkit-grid">
        <article class="pj-toolkit-card"><strong>MiiAnimator</strong><p>FK/IK posing, squash &amp; stretch, animation curves and .miianim clips. This creator's Pose Maker timeline is the native starting point for compatibility.</p><a href="https://github.com/patchzyy/MiiAnimator" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>MiiJS</strong><p>Broad Mii format conversion, QR and rendering ecosystem. Useful reference for future format coverage.</p><a href="https://github.com/Stewared/MiiJS" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>FFL.js</strong><p>JavaScript FFL bindings and Three.js rendering. AGPL-3.0; not copied into this project.</p><a href="https://github.com/ariankordi/FFL.js" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>FFL-Testing</strong><p>Native renderer sample and test resources. Its upstream dependencies and assets have separate terms.</p><a href="https://github.com/ariankordi/FFL-Testing" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>Mii Assets</strong><p>Archived Python extraction tools for Face Library textures and meshes; a future JS rewrite can be built from documented formats.</p><a href="https://github.com/jaames/mii-assets" target="_blank" rel="noopener noreferrer">Open repository ↗</a></article>
        <article class="pj-toolkit-card"><strong>Miipedia · The Mii Hub</strong><p>Community Mii sharing and discovery. Opens externally; this app does not upload your Miis there.</p><a href="https://miipedia.com/miis" target="_blank" rel="noopener noreferrer">Browse Mii gallery ↗</a></article>
      </div>
      <p><strong>Compatibility note:</strong> The supplied ariankordi/MiiPy URL currently returns 404. Send the corrected repository link if that was a different project. .miianim playback and FFL.js rendering are not claimed as integrated yet.</p>
    </section>`;
  document.body.appendChild(overlay);

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
