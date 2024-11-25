const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setMasterPassword: (password) => ipcRenderer.invoke('set-master-password', password),
  addPassword: (data) => ipcRenderer.invoke('add-password', data),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
});
