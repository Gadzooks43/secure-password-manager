const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setMasterPassword: (password) => ipcRenderer.invoke('set-master-password', password),
  addPassword: (data) => ipcRenderer.invoke('add-password', data),
  updatePassword: (data) => ipcRenderer.invoke('update-password', data),
  deletePassword: (data) => ipcRenderer.invoke('delete-password', data),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  isMasterPasswordSet: () => ipcRenderer.invoke('is-master-password-set'),
  setupMFA: () => ipcRenderer.invoke('setup-mfa'),
  verifyMFA: (token) => ipcRenderer.invoke('verify-mfa', token),
  isMFAEnabled: () => ipcRenderer.invoke('is-mfa-enabled'),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
});
