const express = require('express');
const app = express();
app.use(express.json());
app.use(express.text());

const VERSION = "2.0.2"; 
let currentScript = "print('System Online')"; // Valid initial script
let targetUser = "All";
let scriptId = Date.now(); 

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Executor v${VERSION}</title>
            <style>
                body { font-family: sans-serif; background: #121212; color: white; padding: 40px; }
                textarea { width: 100%; height: 300px; background: #1e1e1e; color: #00ff41; border: 1px solid #444; padding: 10px; font-family: monospace; }
                .controls { margin-top: 20px; background: #1e1e1e; padding: 15px; border-radius: 8px; }
                button { background: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; }
                input { background: #2d2d2d; color: white; border: 1px solid #555; padding: 8px; }
            </style>
        </head>
        <body>
            <h2>Cloud Executor v${VERSION}</h2>
            <textarea id="code" placeholder="print('Hello!')"></textarea>
            <div class="controls">
                <select id="targetType" onchange="document.getElementById('username').style.display = this.value === 'Specific' ? 'inline' : 'none'">
                    <option value="All">Global</option>
                    <option value="Specific">Specific User</option>
                </select>
                <input type="text" id="username" placeholder="Username" style="display:none;">
                <button onclick="send()">Execute</button>
            </div>
            <p id="status"></p>
            <script>
                async function send() {
                    const code = document.getElementById('code').value;
                    const target = document.getElementById('targetType').value === 'All' ? 'All' : document.getElementById('username').value;
                    await fetch('/set-script', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({code, target})
                    });
                    document.getElementById('status').innerText = "Sent to " + target;
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/set-script', (req, res) => {
    currentScript = req.body.code;
    targetUser = req.body.target;
    scriptId = Date.now(); 
    res.send("OK");
});

app.get('/get-script', (req, res) => {
    res.json({ code: currentScript, target: targetUser, id: scriptId });
});

app.listen(process.env.PORT || 3000);
