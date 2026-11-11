"use strict";
// sim-plan.html icindeki script'i karistirip (obfuscation) app/index.html olarak yazar.
const fs = require("fs");
const path = require("path");
const Obf = require("javascript-obfuscator");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "sim-plan.html"), "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) throw new Error("sim-plan.html icinde <script> bulunamadi");

const obf = Obf.obfuscate(m[1], {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  debugProtection: false,
  stringArray: true,
  stringArrayThreshold: 0.8,
  stringArrayEncoding: ["base64"],
  splitStrings: false,
  numbersToExpressions: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: true,
  unicodeEscapeSequence: false
}).getObfuscatedCode();

const out = html.replace(m[0], "<script>" + obf + "</script>");
fs.mkdirSync(path.join(root, "app"), { recursive: true });
fs.writeFileSync(path.join(root, "app", "index.html"), out);
console.log("app/index.html yazildi (" + out.length + " bytes, script " + obf.length + ")");
