import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("API", {
  getUsers: async (table) => ipcRenderer.invoke("db:getAllUsers"),
  getView: async (view) => ipcRenderer.invoke("db:getView"),
});
