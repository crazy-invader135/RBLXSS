const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let commandQueue = [];

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Roblox Executor Dashboard</title>
            <style>
                :root { --bg: #0b0e14; --card-bg: #161b22; --text: #adbac7; --accent: #58a6ff; --border: #30363d; }
                body { font-family: 'Segoe UI', sans-serif; background-color: var(--bg); color: var(--text); margin: 0; display: flex; flex-direction: column; align-items: center; padding: 20px; }
                
                .header-section { text-align: center; margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 20px; width: 100%; max-width: 600px; }
                
                /* WHITELIST INPUT STYLING */
                .whitelist-box { background: #1c2128; padding: 15px; border-radius: 8px; border: 1px solid var(--accent); margin-top: 10px; }
                input { background: #0d1117; border: 1px solid var(--border); color: white; padding: 8px; border-radius: 4px; outline: none; }
                input:focus { border-color: var(--accent); }
                .current-user { font-weight: bold; color: var(--accent); margin-left: 10px; }

                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%; max-width: 1000px; }
                .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: 0.2s; cursor: pointer; display: flex; flex-direction: column; }
                .card:hover { transform: translateY(-5px); border-color: var(--accent); }
                .card-image { width: 100%; height: 120px; background-size: cover; background-position: center; background-color: #21262d; }
                .card-content { padding: 15px; text-align: center; }
                .card-title { font-size: 18px; font-weight: 600; color: #ffffff; margin: 0; }
                .card-description { font-size: 13px; color: #768390; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header-section">
                <h1>Remote Control</h1>
                <div class="whitelist-box">
                    <label>Whitelist Target:</label>
                    <input type="text" id="usernameInput" placeholder="Enter Roblox Username..." oninput="updateUser()">
                    <p>Currently Whitelisted: <span id="displayUser" class="current-user">None</span></p>
                </div>
            </div>
            
            <div class="grid">
                <div class="card" onclick="send('Test1')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                    <div class="card-content"><p class="card-title">Red Baseplate</p><p class="card-description">Simple visual change.</p></div>
                </div>

                <div class="card" onclick="send('Test')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-87612f0088922c0989f635038753239a/420/420/Image/Png');"></div>
                    <div class="card-content"><p class="card-title">Server Nuke</p><p class="card-description">Uses require() for your script.</p></div>
                </div>
            </div>

            <script>
                // Load from browser memory on startup
                const savedUser = localStorage.getItem('robloxWhitelist') || "None";
                document.getElementById('usernameInput').value = savedUser === "None" ? "" : savedUser;
                document.getElementById('displayUser').innerText = savedUser;

                function updateUser() {
                    const val = document.getElementById('usernameInput').value || "None";
                    localStorage.setItem('robloxWhitelist', val);
                    document.getElementById('displayUser').innerText = val;
                }

                function send(id) {
                    const user = localStorage.getItem('robloxWhitelist') || "None";
                    // Send both the Script ID and the User Name
                    fetch(\`/send?id=\${id}&target=\${user}\`)
                        .then(() => console.log("Sent: " + id + " for " + user));
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/send', (req, res) => {
    const { id, target } = req.query;
    if (id) {
        commandQueue.push({ id, target });
        res.send("Queued");
    } else {
        res.status(400).send("No ID");
    }
});

app.get('/getCommand', (req, res) => {
    res.json(commandQueue.shift() || { id: null });
});

app.listen(PORT, () => console.log("UI Server running..."));
