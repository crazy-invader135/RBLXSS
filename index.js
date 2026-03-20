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
            <title>Roblox Serverside</title>
            <style>
                :root {
                    --bg: #0b0e14;
                    --card-bg: #161b22;
                    --text: #adbac7;
                    --accent: #58a6ff;
                    --border: #30363d;
                }
                body { 
                    font-family: 'Segoe UI', sans-serif; 
                    background-color: var(--bg); 
                    color: var(--text); 
                    margin: 0; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    padding: 40px;
                }
                h1 { color: #ffffff; margin-bottom: 40px; font-weight: 300; }
                
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                    width: 100%;
                    max-width: 1000px;
                }

                /* THE SCRIPT CARD */
                .card {
                    background: var(--card-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden; /* Keeps image corners rounded */
                    transition: transform 0.2s, border-color 0.2s;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }

                .card:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent);
                }

                /* TOP: IMAGE */
                .card-image {
                    width: 100%;
                    height: 150px;
                    background-size: cover;
                    background-position: center;
                    background-color: #21262d; /* Fallback color */
                }

                /* MIDDLE: NAME */
                .card-content {
                    padding: 20px;
                    text-align: center;
                }

                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 10px 0;
                }

                /* BOTTOM: DESCRIPTION */
                .card-description {
                    font-size: 14px;
                    line-height: 1.5;
                    color: #768390;
                    margin: 0;
                }

                .status-msg {
                    margin-top: 20px;
                    font-size: 12px;
                    color: var(--accent);
                }
            </style>
        </head>
        <body>
            <h1>Remote Script Panel</h1>
            
            <div class="grid">
                
                <div class="card" onclick="send('BaseplateChange')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">Red Baseplate</p>
                        <p class="card-description">Instantly changes the workspace baseplate color to a deep crimson red.</p>
                    </div>
                </div>

                <div class="card" onclick="send('Nuke')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-87612f0088922c0989f635038753239a/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">Server Nuke</p>
                        <p class="card-description">Removes all player characters from the game immediately. Use with caution.</p>
                    </div>
                </div>

                <div class="card" onclick="send('Foggy')">
                    <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-4e941160358897c83f8b05370d10b7b1/420/420/Image/Png');"></div>
                    <div class="card-content">
                        <p class="card-title">Atmospheric Fog</p>
                        <p class="card-description">Thickens the game environment fog for 5 seconds before clearing.</p>
                    </div>
                </div>

            </div>

            <p id="status" class="status-msg"></p>

            <script>
                function send(id) {
                    const status = document.getElementById('status');
                    status.innerText = "Sending " + id + "...";
                    
                    fetch('/send?id=' + id)
                        .then(r => r.text())
                        .then(data => {
                            status.innerText = "Command sent successfully!";
                            setTimeout(() => { status.innerText = ""; }, 3000);
                        })
                        .catch(err => {
                            status.innerText = "Error connecting to server.";
                        });
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/send', (req, res) => {
    const id = req.query.id;
    if (id) {
        commandQueue.push(id);
        res.send("OK");
    } else {
        res.status(400).send("No ID");
    }
});

app.get('/getCommand', (req, res) => {
    res.json({ id: commandQueue.shift() || null });
});

app.listen(PORT, () => console.log("UI Server running..."));
