const express = require('express');
const app = express();
app.use(express.json());

const VERSION = "3.0.0 (Presets)"; 
let currentCommand = "none";
let targetUser = "All";
let scriptId = Date.now(); 

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Preset Executor v${VERSION}</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #121212; color: white; padding: 40px; text-align: center; }
                .container { max-width: 500px; margin: auto; background: #1e1e1e; padding: 20px; border-radius: 12px; border: 1px solid #333; }
                select, input { width: 100%; padding: 12px; margin: 10px 0; background: #2d2d2d; color: white; border: 1px solid #444; border-radius: 6px; }
                button { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
                button:hover { background: #0056b3; }
                .status { color: #888; margin-top: 15px; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Preset Executor</h2>
                <label>Select Command:</label>
                <select id="cmd">
                    <option value="none">-- Select a Preset --</option>
                    <option value="kill">Kill Player(s)</option>
                    <option value="freeze">Freeze Player(s)</option>
                    <option value="unfreeze">Unfreeze Player(s)</option>
                    <option value="kick">Kick Player(s)</option>
                    <option value="gui_reload">Reload Main GUI</option>
                    </select>

                <label>Target:</label>
                <input type="text" id="user" value="All" placeholder="Username or 'All'">

                <button onclick="send()">Execute Command</button>
                <div id="status" class="status">Ready</div>
            </div>

            <script>
                async function send() {
                    const cmd = document.getElementById('cmd').value;
                    const target = document.getElementById('user').value;
                    if(cmd === "none") return alert("Please select a command!");
                    
                    await fetch('/set-script', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({code: cmd, target: target})
                    });
                    document.getElementById('status').innerText = "Sent: " + cmd + " -> " + target;
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/set-script', (req, res) => {
    currentCommand = req.body.code;
    targetUser = req.body.target;
    scriptId = Date.now(); 
    res.send("OK");
});

app.get('/get-script', (req, res) => {
    res.json({ code: currentCommand, target: targetUser, id: scriptId });
});

app.listen(process.env.PORT || 3000);
