const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('oceanCinemas', {
  platform: 'desktop'
});
