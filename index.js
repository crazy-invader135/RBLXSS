const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let commandQueue = [];
let lastCheckIn = "Never";

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Roblox Control Panel</title>
            <style>
                :root { --bg: #0b0e14; --card-bg: #161b22; --text: #adbac7; --accent: #58a6ff; --border: #30363d; --success: #3fb950; }
                body { font-family: 'Segoe UI', sans-serif; background-color: var(--bg); color: var(--text); margin: 0; display: flex; flex-direction: column; align-items: center; padding: 40px; }
                
                .header-section { text-align: center; margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 30px; width: 100%; max-width: 800px; }
                
                .whitelist-box { background: #1c2128; padding: 20px; border-radius: 12px; border: 1px solid var(--accent); display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                label { display: block; margin-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); }
                input { background: #0d1117; border: 1px solid var(--border); color: white; padding: 12px; border-radius: 6px; outline: none; width: 250px; font-size: 16px; text-align: center; }
                input:focus { border-color: var(--accent); box-shadow: 0 0 8px rgba(88, 166, 255, 0.3); }

                .status-bar { font-size: 11px; margin-top: 15px; color: #768390; text-transform: uppercase; }
                #status { color: var(--success); font-weight: bold; }

                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; width: 100%; max-width: 800px; margin-top: 40px; }
                .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: 0.3s ease; cursor: pointer; position: relative; }
                .card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
                .card-image { width: 100%; height: 120px; background-size: cover; background-position: center; filter: brightness(0.8); transition: 0.3s; }
                .card:hover .card-image { filter: brightness(1.1); }
                .card-content { padding: 18px; text-align: center; border-top: 1px solid var(--border); }
                .card-title { font-size: 18px; font-weight: 600; color: #ffffff; margin: 0; }
                .card-description { font-size: 13px; color: #768390; margin-top: 6px; }
            </style>
        </head>
        <body>
            <div class="header-section">
                <div class="whitelist-box">
                    <label>Target Player</label>
                    <input type="text" id="usernameInput" placeholder="Username..." oninput="updateUser()">
                </div>
                <div class="status-bar">System: <span id="status">Online</span> | Active User: <span id="displayUser" style="color:white">None</span></div>
            </div>
            
            <div class="grid">
                <div class="card" onclick="send('Test1')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">F3X Tools</p>
                        <p class="card-description">Bypass ownership injection.</p>
                    </div>
                </div>

                <div class="card" onclick="send('TestGUI')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-87612f0088922c0989f635038753239a/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">Check Target</p>
                        <p class="card-description">Ping the current session.</p>
                    </div>
                </div>
            </div>

            <script>
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
                    if (!user) return alert("Enter a username!");
                    fetch(\`/send?id=\${id}&target=\${user}\`);
                }

                setInterval(() => {
                    fetch('/getLogs').then(r => r.json()).then(data => {
                        document.getElementById('status').innerText = "ONLINE";
                    }).catch(() => document.getElementById('status').innerText = "OFFLINE");
                }, 5000);
            </script>
        </body>
        </html>
    `);
});

app.get('/send', (req, res) => {
    const { id, target } = req.query;
    if (id && target) { commandQueue.push({ id, target }); res.send("OK"); }
});

app.get('/getCommand', (req, res) => {
    res.json(commandQueue.shift() || { id: null });
});

app.get('/getLogs', (req, res) => res.json({ success: true }));

app.listen(PORT, () => console.log("Clean UI running..."));
