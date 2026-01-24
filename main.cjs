const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const tcpPortUsed = require('tcp-port-used')

// Define se é produção (pacote instalado) ou desenvolvimento
const isPackaged = app.isPackaged
const isDev = !isPackaged
const PORT = 3000
const DB_FILENAME = 'dev.db' 

function setupDatabase() {
  const userDataPath = app.getPath('userData')
  const finalDbPath = path.join(userDataPath, DB_FILENAME)

  // Variáveis globais para o processo
  process.env.DATABASE_URL = `file:${finalDbPath}`
  process.env.NEXTAUTH_URL = `http://localhost:${PORT}`
  // Em produção real, idealmente isso viria de um .env seguro, mas para app desktop local funciona
  process.env.NEXTAUTH_SECRET = "secret-fixa-prod-123"

  if (!fs.existsSync(finalDbPath)) {
    // Procura o banco "virgem" dentro do pacote
    let sourcePath = isDev 
      ? path.join(__dirname, DB_FILENAME) 
      : path.join(process.resourcesPath, DB_FILENAME)
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, finalDbPath)
        console.log('Banco de dados inicializado com sucesso.')
      } catch (err) {
        console.error('Erro ao copiar banco:', err)
      }
    }
  }
}

let mainWindow
let serverProcess = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Cash Flow",
    icon: path.join(__dirname, 'public/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const startServer = () => {
  if (isDev) return

  const appPath = app.getAppPath() 
  const unpackedPath = appPath.replace('app.asar', 'app.asar.unpacked')
  const serverPath = path.join(unpackedPath, 'standalone_app/server.js')
  const cwdPath = path.join(unpackedPath, 'standalone_app')

  if (!fs.existsSync(serverPath)) {
    console.error('ERRO FATAL: server.js não encontrado!')
    return
  }
  
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: cwdPath,
    env: { 
      ...process.env, 
      ELECTRON_RUN_AS_NODE: '1', 
      PORT: PORT.toString(), 
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL
    }
  })

  // Redireciona logs internos (opcional, só aparece se rodar via terminal)
  serverProcess.stdout?.on('data', (data) => console.log(`[Next]: ${data}`))
  serverProcess.stderr?.on('data', (data) => console.error(`[Next Err]: ${data}`))
}

app.on('ready', async () => {
  setupDatabase()
  startServer()

  try {
    // Tenta conectar por 20 segundos
    await tcpPortUsed.waitUntilUsed(PORT, 500, 20000) 
    createWindow()
  } catch (err) {
    console.error('Erro: Servidor demorou demais para responder.')
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill()
    app.quit()
  }
})