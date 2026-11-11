"use strict";
const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const dataDir = app.getPath("userData");                 // %APPDATA%\Sim Plan
const dataFile = path.join(dataDir, "veriler.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Sim Plan",
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false,
      spellcheck: false,
      additionalArguments: [
        "--sim-data-file=" + dataFile,
        "--sim-version=" + app.getVersion()
      ]
    }
  });
  Menu.setApplicationMenu(null);
  // kod korumasi: gelistirici araclarini acan kisayollari engelle
  win.webContents.on("before-input-event", (e, input) => {
    const k = (input.key || "").toLowerCase();
    if (k === "f12") e.preventDefault();
    if ((input.control || input.meta) && input.shift && (k === "i" || k === "j" || k === "c")) e.preventDefault();
    if ((input.control || input.meta) && k === "u") e.preventDefault();
  });
  // disa baglantilari varsayilan tarayicida ac
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) { shell.openExternal(url); return { action: "deny" }; }
    return { action: "allow" };
  });
  win.loadFile(path.join(__dirname, "..", "app", "index.html"));
}

ipcMain.handle("open-data-folder", async () => {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
  return shell.openPath(dataDir);
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
