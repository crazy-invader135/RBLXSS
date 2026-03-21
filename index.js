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
            <title>Master Control Panel</title>
            <style>
                body { 
                    background: #050505; 
                    color: #00ff41; 
                    font-family: 'Courier New', monospace; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    padding-top: 50px;
                }

                .header-box {
                    border: 1px solid #00ff41;
                    padding: 15px 40px;
                    margin-bottom: 40px;
                    text-align: center;
                    letter-spacing: 2px;
                    box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
                }

                .input-section {
                    margin-bottom: 30px;
                    text-align: center;
                }

                input {
                    background: #000;
                    border: 1px solid #00ff41;
                    color: #00ff41;
                    padding: 12px;
                    width: 300px;
                    text-align: center;
                    font-size: 16px;
                    outline: none;
                }

                /* BUTTON GRID SETUP */
                .btn-container {
                    display: grid;
                    grid-template-columns: repeat(2, 220px); /* X = 220px */
                    gap: 20px;
                    justify-content: center;
                }

                .btn {
                    height: 60px; /* Y = 60px */
                    border: 1px solid #00ff41;
                    background: rgba(0, 255, 65, 0.05);
                    color: #00ff41;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: 0.3s;
                    text-transform: uppercase;
                }

                .btn:hover {
                    background: #00ff41;
                    color: #000;
                    box-shadow: 0 0 20px #00ff41;
                }

                .console-box {
                    width: 460px;
                    height: 250px;
                    background: #000;
                    border: 1px solid #333;
                    margin-top: 40px;
                    padding: 15px;
                    font-size: 12px;
                    overflow-y: auto;
                    color: #008f11;
                }
            </style>
        </head>
        <body>
            <div class="header-box">
                STATUS: <span id="status">CONNECTING...</span> | HB: <span id="hb">None</span>
            </div>

            <div class="input-section">
                <div style="margin-bottom: 10px; font-size: 12px;">TARGET USERNAME</div>
                <input type="text" id="userInput" placeholder="ENTER NAME">
            </div>

            <div class="btn-container">
                <div class="btn" onclick="send('Test1')">GIVE F3X TOOLS</div>
                <div class="btn" onclick="send('TestGUI')">CHECK SERVER</div>
            </div>

            <div id="logs" class="console-box">Initializing Terminal...</div>

            <script>
                function send(id) {
                    const user = document.getElementById('userInput').value;
                    if (!user) { alert("Enter Username!"); return; }
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

// REST OF THE SERVER CODE
app.get('/send', (req, res) => {
    const { id, target } = req.query;
    commandQueue.push({ id, target });
    addLog(`CMD: ${id} -> ${target}`);
    res.send("OK");
});

app.get('/getCommand', (req, res) => {
    lastCheckIn = new Date().toLocaleTimeString();
    res.json(commandQueue.length > 0 ? commandQueue.shift() : { id: null });
});

app.get('/getLogs', (req, res) => res.json({ logs, lastCheck: lastCheckIn }));
app.listen(PORT, () => console.log("System Running"));
