"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
const http = require('http');
const https = require('https');

// 判断是否为开发环境
const isDev = !electron_1.app.isPackaged;

// 创建代理服务器
function createProxyServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const targetUrl = req.headers['x-target-url'];
            if (!targetUrl) {
                res.writeHead(400);
                res.end('Missing target URL');
                return;
            }

            const proxyReq = https.request(targetUrl, {
                method: req.method,
                headers: {
                    ...req.headers,
                    host: new URL(targetUrl).host
                }
            }, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res);
            });

            req.pipe(proxyReq);

            proxyReq.on('error', (error) => {
                console.error('Proxy error:', error);
                res.writeHead(500);
                res.end('Proxy error: ' + error.message);
            });
        });

        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            console.log(`Proxy server running on port ${port}`);
            resolve({ server, port });
        });
    });
}

async function createWindow(proxyPort) {
    // 创建浏览器窗口
    var win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#1e1e1e',
        frame: false,  
        titleBarStyle: 'hiddenInset',  
        trafficLightPosition: { x: 12, y: 10 },  
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true,
            allowRunningInsecureContent: false,
            webviewTag: true,
            enableRemoteModule: true,
            additionalArguments: [
                `--node-env=${process.env.NODE_ENV || 'production'}`,
                `--proxy-port=${proxyPort}`
            ]
        }
    });

    // 设置安全策略
    electron_1.app.on('web-contents-created', (event, contents) => {
        contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
            callback(true);
        });
    });

    // 设置 CSP 头
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: file:;" +
                    "connect-src 'self' http://127.0.0.1:*;"
                ]
            }
        });
    });

    // 加载应用
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        const startUrl = path.join(__dirname, 'index.html');
        win.loadURL(`file://${startUrl}`)
            .catch(function(err) {
                console.error('Failed to load index.html:', err);
                console.log('Current directory:', __dirname);
                console.log('Trying to load:', startUrl);
            });
    }

    return win;
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
electron_1.app.whenReady().then(async () => {
    // 先创建代理服务器
    const { server, port } = await createProxyServer();
    
    // 注册协议
    electron_1.protocol.registerFileProtocol('file', (request, callback) => {
        const filePath = request.url.replace('file://', '');
        callback(decodeURI(filePath));
    });

    // 创建窗口并传入代理端口
    const win = await createWindow(port);

    // 清理代理服务器
    electron_1.app.on('before-quit', () => {
        server.close();
    });
});

// 在所有窗口关闭时退出应用
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});

electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
