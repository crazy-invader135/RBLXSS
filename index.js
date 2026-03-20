const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let commandQueue = [];

// Simple HTML Dashboard
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roblox Control Panel</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; background: #121212; color: white; }
                button { padding: 15px 25px; margin: 10px; font-size: 16px; cursor: pointer; border: none; border-radius: 5px; transition: 0.3s; }
                .btn-spawn { background: #4CAF50; color: white; }
                .btn-msg { background: #2196F3; color: white; }
                .btn-kill { background: #f44336; color: white; }
                button:hover { opacity: 0.8; transform: scale(1.05); }
            </style>
        </head>
        <body>
            <h1>Roblox Command Center</h1>
            <p>Click a button to send a command to the game.</p>
            <button class="btn-spawn" onclick="send('SpawnPart')">Spawn Part</button>
            <button class="btn-msg" onclick="send('ShowMessage')">Show Message</button>
            <button class="btn-kill" onclick="send('KillPlayers')">Kill All</button>

            <script>
                function send(id) {
                    fetch('/send?id=' + id)
                        .then(response => response.text())
                        .then(data => alert(data));
                }
            </script>
        </body>
        </html>
    `);
});

// Endpoint to add commands to the queue
app.get('/send', (req, res) => {
    const commandId = req.query.id;
    if (commandId) {
        commandQueue.push(commandId);
        console.log(`Queued: ${commandId}`);
        res.send(`Command ${commandId} sent!`);
    } else {
        res.status(400).send("No ID provided");
    }
});

// Endpoint for Roblox to poll
app.get('/getCommand', (req, res) => {
    if (commandQueue.length > 0) {
        res.json({ id: commandQueue.shift() });
    } else {
        res.json({ id: null });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
