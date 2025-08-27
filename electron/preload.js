const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("API", {
  getAllUsers: async (table) => ipcRenderer.invoke("db:getAllUsers", table),
  getViewData: async (view) => ipcRenderer.invoke("db:getViewData", view),
  getViewDataWithFilter: async (view, column, value) =>
    ipcRenderer.invoke("db:getViewDataWithFilter", view, column, value),
});
