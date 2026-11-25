"use strict";
// sim-plan.html icindeki uygulama script'inin kontrolu (derlemeden once calisir; hata varsa derleme durur).
//  1) Sozdizimi (kesin): Node'un kendi ayristiricisi. Hata satiri sim-plan.html'deki satir numarasiyla gosterilir.
//  2) "Yutulmus kod" uyarisi: satir ortasina yazilan // yorumu satirin geri kalanini yoruma cevirebilir.
//     Sozdizimi bozulmasa bile kod sessizce kaybolur. Icinde kod gibi gorunen yorumlar listelenir.
//     (acorn varsa calisir; javascript-obfuscator ile birlikte gelir. Yoksa bu adim atlanir.)
// Kullanim: node scripts/check.js [dosya ...]  (varsayilan: sim-plan.html; .js/.mjs dosyalari ES modulu olarak kontrol edilir)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Yorum metni kod gibi mi? Kod belirteclerini sayar; dogal dil aciklamalari bu esigi asmaz.
function codeScore(text) {
  const pats = [/=>/g, /===|!==/g, /&&|\|\|/g, /\)\s*[{;,]/g, /\b(const|let|var|return)\s+[\w$]/g,
    /[\w$\])]\s*=(?![=>])\s*[\w$("'[!{-]/g, /\w\.\w+\(/g, /[;}]\s*[\w$]+\s*[=(.]/g, /[\w$]\(\)\s*;/g];
  return pats.reduce((n, re) => n + (text.match(re) || []).length, 0);
}
// Tek basina bile kesin kod olan kaliplar: degisken tanimi, fonksiyon, return ...;, cagri(); ve x=[];
// (Dogal dil aciklamalarinda gecmez; tek bir yutulmus ifadeyi de yakalar.)
const STRONG = /\b(const|let|var)\s+[\w$]+\s*=|\bfunction\s*[\w$]*\s*\(|\breturn\b[^.]*;|\w\([^()]*\)\s*;|[\w$\]]\s*=\s*\[\s*\]\s*;/;
const looksLikeCode = (text) => codeScore(text) >= 3 || STRONG.test(text);

function run(file) {
  const src = fs.readFileSync(file, "utf8"), isModule = /\.(m?js|cjs)$/i.test(file);
  let code = src, lineOffset = 0;
  if (!isModule) {
    const m = src.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) return { ok: false, errors: [path.basename(file) + " icinde <script> bulunamadi"], warnings: [] };
    code = m[1];
    lineOffset = src.slice(0, m.index + "<script>".length).split("\n").length - 1; // script'in dosyadaki baslangic satiri
  }
  const lines = src.split("\n");
  const errors = [], warnings = [];
  let acorn = null;
  try { acorn = require("acorn"); } catch (e) { /* yok: yorum kontrolu atlanir */ }

  // 1) sozdizimi
  const syntaxErr = (msg, ln) => errors.push("SOZDIZIMI HATASI: " + msg + (ln ? "  (satir " + ln + ")\n    " + (lines[ln - 1] || "").trim().slice(0, 200) : ""));
  if (isModule) {
    if (acorn) { try { acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" }); } catch (e) { syntaxErr(e.message, e.loc && e.loc.line); } }
    else { const r = require("child_process").spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
      if (r.status) { const ln = (/:(\d+)\s*$/m.exec(r.stderr) || [])[1]; syntaxErr((r.stderr.split("\n").find((x) => /Error/.test(x)) || "").trim(), ln && +ln); } }
  } else {
    try {
      new vm.Script(code, { filename: path.basename(file), lineOffset });
    } catch (e) {
      const at = /:(\d+)\s*$/m.exec(String(e.stack).split("\n")[0]);
      syntaxErr(e.message, at ? +at[1] : null);
    }
  }

  // 2) yutulmus kod — belirtec taramasi (tokenizer) parantez dengesi bozuk olsa da calisir
  if (acorn) {
    const comments = [];
    try { for (const _ of acorn.tokenizer(code, { ecmaVersion: "latest", sourceType: isModule ? "module" : "script", onComment: comments })) { /* yalnizca yorumlari topla */ } }
    catch (e) { /* belirtec hatasi: yorumlar toplandigi yere kadar degerlendirilir */ }
    for (const c of comments) {
      if (c.type !== "Line") continue;
      const before = code.slice(code.lastIndexOf("\n", c.start - 1) + 1, c.start);
      if (!before.trim()) continue; // satir basindaki yorumlar zararsiz
      if (looksLikeCode(c.value)) {
        const ln = code.slice(0, c.start).split("\n").length + lineOffset;
        warnings.push("YORUMA DONMUS KOD OLABILIR (satir " + ln + "): //" + c.value.trim().slice(0, 160));
      }
    }
    if (errors.length && warnings.length) errors.push("Muhtemel sebep: asagidaki satir(lar)da satir ortasina yazilmis // yorumu kodun geri kalanini yutmus olabilir.");
  }
  return { ok: !errors.length, errors, warnings, checkedComments: !!acorn };
}

module.exports = { run, codeScore, looksLikeCode };

// Dosyalari kontrol eder, sonucu yazar; sorun varsa false dondurur (derleme betikleri bunu kullanir)
function checkFiles(files) {
  let ok = true;
  for (const f of files) {
    const r = run(f);
    r.errors.forEach((e) => console.error("✗ " + e));
    r.warnings.forEach((w) => console.error("⚠ " + w));
    if (!r.ok || r.warnings.length) { console.error("Kontrol BASARISIZ: " + path.basename(f)); ok = false; }
    else console.log("✓ Kontrol tamam: " + path.basename(f) + " (sozdizimi" + (r.checkedComments ? " + yorum" : "; acorn yok, yorum kontrolu atlandi") + ")");
  }
  return ok;
}
module.exports.checkFiles = checkFiles;

if (require.main === module) {
  const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : [path.join(__dirname, "..", "sim-plan.html")];
  if (!checkFiles(files)) process.exit(1);
}
