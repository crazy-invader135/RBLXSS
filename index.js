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
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Roblox Executor Dashboard</title>
            <style>
                :root { --bg: #0b0e14; --card-bg: #161b22; --text: #adbac7; --accent: #58a6ff; --border: #30363d; --success: #3fb950; }
                body { font-family: 'Segoe UI', sans-serif; background-color: var(--bg); color: var(--text); margin: 0; display: flex; flex-direction: column; align-items: center; padding: 20px; }
                
                .header-section { text-align: center; margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 20px; width: 100%; max-width: 800px; }
                
                .whitelist-box { background: #1c2128; padding: 15px; border-radius: 8px; border: 1px solid var(--accent); margin-top: 10px; display: inline-block; }
                input { background: #0d1117; border: 1px solid var(--border); color: white; padding: 8px; border-radius: 4px; outline: none; width: 200px; }
                input:focus { border-color: var(--accent); }
                .current-user { font-weight: bold; color: var(--accent); margin-left: 10px; }

                .status-indicator { font-size: 12px; margin-top: 10px; color: #8b949e; }
                #status { color: var(--success); font-weight: bold; }

                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; width: 100%; max-width: 800px; margin-top: 20px; }
                .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: 0.2s; cursor: pointer; display: flex; flex-direction: column; }
                .card:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
                .card-image { width: 100%; height: 100px; background-size: cover; background-position: center; background-color: #21262d; }
                .card-content { padding: 15px; text-align: center; }
                .card-title { font-size: 16px; font-weight: 600; color: #ffffff; margin: 0; }
                .card-description { font-size: 12px; color: #768390; margin-top: 5px; }

                .console { width: 100%; max-width: 800px; height: 150px; background: #0d1117; border: 1px solid var(--border); border-radius: 8px; margin-top: 30px; padding: 10px; font-family: 'Consolas', monospace; font-size: 12px; overflow-y: auto; color: #7ee787; }
            </style>
        </head>
        <body>
            <div class="header-section">
                <h1>Executor Dashboard</h1>
                <div class="status-indicator">SYSTEM: <span id="status">CONNECTING</span> | LAST CHECK: <span id="hb">None</span></div>
                
                <div class="whitelist-box">
                    <label>Target User:</label>
                    <input type="text" id="usernameInput" placeholder="Roblox Username..." oninput="updateUser()">
                    <span id="displayUser" class="current-user">None</span>
                </div>
            </div>
            
            <div class="grid">
                <div class="card" onclick="send('Test1')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">F3X Tools</p>
                        <p class="card-description">Give Building Tools to target.</p>
                    </div>
                </div>

                <div class="card" onclick="send('TestGUI')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-87612f0088922c0989f635038753239a/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">Connection Test</p>
                        <p class="card-description">Verify the target is reachable.</p>
                    </div>
                </div>
            </div>

            <div id="logs" class="console">Waiting for game connection...</div>

            <script>
                // LocalStorage management
                const savedUser = localStorage.getItem('robloxWhitelist') || "";
                document.getElementById('usernameInput').value = savedUser;
                document.getElementById('displayUser').innerText = savedUser || "None";

                function updateUser() {
                    const val = document.getElementById('usernameInput').value;
                    localStorage.setItem('robloxWhitelist', val);
                    document.getElementById('displayUser').innerText = val || "None";
                }

                function send(id) {
                    const user = localStorage.getItem('robloxWhitelist');
                    if (!user || user === "") {
                        alert("Please enter a username first!");
                        return;
                    }
                    fetch(\`/send?id=\${id}&target=\${user}\`)
                        .then(() => console.log("Queued: " + id));
                }

                // Live Log Updates
                setInterval(() => {
                    fetch('/getLogs').then(r => r.json()).then(data => {
                        document.getElementById('hb').innerText = data.lastCheck;
                        document.getElementById('status').innerText = "ONLINE";
                        document.getElementById('logs').innerHTML = data.logs.map(l => \`<div>\${l}</div>\`).join('');
                    }).catch(() => {
                        document.getElementById('status').innerText = "OFFLINE";
                        document.getElementById('status').style.color = "#f85149";
                    });
                }, 2000);
            </script>
        </body>
        </html>
    `);
});

app.get('/send', (req, res) => {
    const { id, target } = req.query;
    if (id && target) {
        commandQueue.push({ id, target });
        addLog(`WEB: Queued ${id} for ${target}`);
        res.send("OK");
    } else {
        res.status(400).send("Missing ID or Target");
    }
});

app.get('/getCommand', (req, res) => {
    lastCheckIn = new Date().toLocaleTimeString();
    if (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        addLog(`RBX: Executed ${cmd.id}`);
        res.json(cmd);
    } else {
        res.json({ id: null });
    }
});

app.get('/getLogs', (req, res) => res.json({ logs, lastCheck: lastCheckIn }));

app.listen(PORT, () => console.log("Dashboard UI Live on Port " + PORT));
