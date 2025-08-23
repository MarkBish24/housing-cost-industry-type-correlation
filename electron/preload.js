const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("API", {
  getAllUsers: async (table) => ipcRenderer.invoke("db:getAllUsers", table),
  getViewData: async (view) => ipcRenderer.invoke("db:getViewData", view),
});
