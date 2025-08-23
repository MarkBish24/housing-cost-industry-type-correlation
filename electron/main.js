import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import { getAllUsers, getViewData } from "./dbUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // In dev mode, load React Vite server
  win.loadURL("http://localhost:5173");

  // In production, load the built frontend
  // win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
}

app.whenReady().then(async () => {
  try {
    await connectDB();
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("db:getAllUsers", async (_, table) => {
  return await getAllUsers(table);
});

ipcMain.handle("db:getViewData", async (_, view) => {
  return await getViewData(view);
});
