"use strict";
const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

function arg(name) {
  const p = "--" + name + "=";
  const a = process.argv.find((x) => x.startsWith(p));
  return a ? a.slice(p.length) : "";
}

const file = arg("sim-data-file");
const version = arg("sim-version");

let cache = "";
try { cache = fs.readFileSync(file, "utf8"); } catch (e) { cache = ""; }

contextBridge.exposeInMainWorld("simStore", {
  initial: () => cache,
  save: (s) => {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, s);
      cache = s;
      return true;
    } catch (e) { return false; }
  },
  openFolder: () => ipcRenderer.invoke("open-data-folder"),
  version: version
});
