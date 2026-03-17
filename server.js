const express = require('express');
const axios = require('axios');
const app = express();

// Render uses the PORT environment variable automatically
const PORT = process.env.PORT || 3000;

// Update these to your actual Pastebin RAW URLs
// Example: "https://pastebin.com/raw/XXXXXXX"
const presets = {
    "test_script": "https://pastebin.com/raw/example1",
    "admin_gui": "https://pastebin.com/raw/example2",
    "kill_all": "https://pastebin.com/raw/example3"
};

// 1. Status Check (Visit your Render URL in a browser to see this)
app.get('/', (req, res) => {
    res.send("Server Executor Backend is ONLINE! 🚀");
});

// 2. The Roblox Request Handler
app.get('/get-command', async (req, res) => {
    const presetName = req.query.preset;
    const targetUrl = presets[presetName];

    if (targetUrl) {
        try {
            // Fetch the raw Lua code from Pastebin
            const response = await axios.get(targetUrl);
            
            // Send the code back to Roblox as plain text
            res.set('Content-Type', 'text/plain');
            res.send(response.data);
        } catch (error) {
            console.error("Error fetching from Pastebin:", error.message);
            res.status(500).send("-- Error: Could not reach Pastebin/External Source");
        }
    } else {
        res.status(404).send("-- Error: Preset name '" + presetName + "' not found in config.");
    }
});

// 1. Status Check (Visit your Render URL in a browser to see this)
app.get('/', (req, res) => {
    res.send("Server is officially online and working! 🚀");
});

// 2. The Roblox Request Handler
app.get('/get-command', async (req, res) => {
    const presetName = req.query.preset;
    const targetUrl = presets[presetName];

    if (targetUrl) {
        try {
            const response = await axios.get(targetUrl);
            res.set('Content-Type', 'text/plain');
            res.send(response.data);
        } catch (error) {
            console.error("Error fetching from Pastebin:", error.message);
            res.status(500).send("-- Error: Could not reach Pastebin/External Source");
        }
    } else {
        res.status(404).send("-- Error: Preset name '" + presetName + "' not found in config.");
    }
});

// Keep this at the VERY BOTTOM of the file
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
