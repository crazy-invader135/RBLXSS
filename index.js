const express = require('express');
const app = express();

app.use(express.text());
app.use(express.json());

let currentScript = "-- No script set";
let targetUser = "All"; // Default to everyone
let scriptId = Date.now(); 

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Remote Executor</title>
            <style>
                body { font-family: sans-serif; background: #1a1a1a; color: white; padding: 40px; }
                textarea { width: 100%; height: 300px; background: #2d2d2d; color: #00ff00; border: 1px solid #444; padding: 10px; font-family: monospace; outline: none; }
                .controls { margin-top: 15px; display: flex; gap: 10px; align-items: center; }
                input, select { background: #2d2d2d; color: white; border: 1px solid #444; padding: 8px; border-radius: 4px; }
                button { background: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
                button:hover { background: #0056b3; }
                .status { margin-top: 10px; color: #aaa; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <h1>Remote Executor</h1>
            <textarea id="code" placeholder="print('Hello!')"></textarea>
            
            <div class="controls">
                <label>Target:</label>
                <select id="targetType" onchange="toggleInput()">
                    <option value="All">Everyone</option>
                    <option value="Specific">Specific User</option>
                </select>
                <input type="text" id="username" placeholder="Username" style="display:none;">
                <button onclick="sendScript()">Execute</button>
            </div>
            
            <div id="status" class="status">Ready</div>

            <script>
                function toggleInput() {
                    document.getElementById('username').style.display = 
                        document.getElementById('targetType').value === 'Specific' ? 'block' : 'none';
                }

                async function sendScript() {
                    const code = document.getElementById('code').value;
                    const type = document.getElementById('targetType').value;
                    const user = document.getElementById('username').value;
                    const status = document.getElementById('status');
                    
                    status.innerText = "Sending...";
                    
                    await fetch('/set-script', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: code,
                            target: type === 'All' ? 'All' : user
                        })
                    });
                    status.innerText = "Sent! Target: " + (type === 'All' ? 'Everyone' : user);
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/set-script', (req, res) => {
    const data = req.body;
    currentScript = data.code;
    targetUser = data.target;
    scriptId = Date.now(); 
    res.send("OK");
});

app.get('/get-script', (req, res) => {
    res.json({
        code: currentScript,
        target: targetUser,
        id: scriptId
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
