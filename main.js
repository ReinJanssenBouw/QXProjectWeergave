const { app, BrowserWindow }        = require('electron');
const { autoUpdater }               = require('electron-updater');
const path                          = require('path');

// ─── Instellingen ────────────────────────────────────────────────────────────

autoUpdater.autoDownload         = false; // wij starten de download handmatig
autoUpdater.autoInstallOnAppQuit = true;  // fallback: installeer bij afsluiten
autoUpdater.allowPrerelease      = false;

app.setAppUserModelId('com.qxprojectweergave.app');

// ─── Windows ─────────────────────────────────────────────────────────────────

let splashWindow = null;
let mainWindow   = null;

function createSplash() {
  splashWindow = new BrowserWindow({
    width:          500,
    height:         500,
    frame:          false,
    resizable:      false,
    maximizable:    false,
    minimizable:    false,
    alwaysOnTop:    true,
    autoHideMenuBar:true,
    icon:           path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'update.html'));
}

function createMainWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width:          1400,
    height:         900,
    show:           false,        // toon pas als klaar met laden
    autoHideMenuBar:true,
    icon:           path.join(__dirname, 'icon.ico'),
    title:          'QXProjectWeergave',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration:  false,
      devTools:         false
    }
  });

  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, 'QXProjectWeergave.html'));

  // De weergave-app blijft op het lokale, alleen-lezen scherm.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

  // Sluit splash zodra de hoofdapp klaar is om te tonen
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC helper ──────────────────────────────────────────────────────────────

function send(data) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('update-status', data);
  }
}

// ─── Start ───────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createSplash();

  splashWindow.webContents.once('did-finish-load', () => {

    // In ontwikkelmodus: geen echte updatecheck — open hoofdapp na korte animatie
    if (!app.isPackaged) {
      send({ type: 'checking' });
      setTimeout(() => {
        send({ type: 'not-available' });
        setTimeout(createMainWindow, 1200);
      }, 1800);
      return;
    }

    // Productie: echte updatecheck
    send({ type: 'checking' });
    autoUpdater.checkForUpdates().catch(err => {
      send({ type: 'error', message: err.message || String(err) });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── autoUpdater events ───────────────────────────────────────────────────────

autoUpdater.on('checking-for-update', () => {
  send({ type: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  send({ type: 'update-available', version: info.version });
  // Kleine vertraging zodat de gebruiker de melding ziet, dan downloaden
  setTimeout(() => autoUpdater.downloadUpdate(), 800);
});

autoUpdater.on('update-not-available', () => {
  send({ type: 'not-available' });
  // update.html opent de hoofdapp zelf na de animatie (via IPC)
  // Fallback: open na 1.5 s ook vanuit main
  setTimeout(createMainWindow, 1500);
});

autoUpdater.on('download-progress', (progress) => {
  send({
    type:             'downloading',
    percent:          Math.round(progress.percent),
    transferred:      progress.transferred,
    total:            progress.total,
    bytesPerSecond:   progress.bytesPerSecond
  });
});

autoUpdater.on('update-downloaded', (info) => {
  send({ type: 'downloaded' });
  // Geef het scherm 1.8 s om "Update gereed" te tonen, dan installeren
  setTimeout(() => {
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (e) {
      console.error('[updater] quitAndInstall mislukt:', e.message);
      send({ type: 'error', message: e.message || String(e) });
      setTimeout(createMainWindow, 1200);
    }
  }, 1800);
});

autoUpdater.on('error', (err) => {
  console.error('[updater]', err);
  send({ type: 'error', message: err.message || String(err) });
  // Open hoofdapp na fout (kleine vertraging zodat gebruiker fout ziet)
  setTimeout(createMainWindow, 3000);
});
