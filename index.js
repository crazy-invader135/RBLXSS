const express = require('express');
const axios = require('axios');
const app = express();

// Render uses the PORT environment variable automatically
const PORT = process.env.PORT || 3000;

/** * PRESETS LIBRARY
 * Add your preset names and their corresponding Pastebin RAW URLs here.
 * Ensure URLs are the "raw" version (e.g., /raw/...).
 */
const presets = {
    "test_script": "https://pastebin.com/raw/example1",
    "admin_gui": "https://pastebin.com/raw/example2",
    "kill_all": "https://pastebin.com/raw/example3",
    "fly_script": "https://pastebin.com/raw/example4"
};

// 1. Root Route - Status check for your browser
app.get('/', (req, res) => {
    res.send(`
        <h1>Server Executor Backend is ONLINE! 🚀</h1>
        <p>This API is public. Use <code>/list</code> to see available presets.</p>
        <p>Use <code>/get-command?preset=NAME</code> to fetch Lua code.</p>
    `);
});

// 2. Public List Route - Shows anyone what commands are available
app.get('/list', (req, res) => {
    const availablePresets = Object.keys(presets);
    res.json({
        status: "success",
        message: "Available Roblox Presets",
        count: availablePresets.length,
        presets: availablePresets
    });
});

// 3. The Roblox Request Handler
app.get('/get-command', async (req, res) => {
    const presetName = req.query.preset;
    const targetUrl = presets[presetName];

    if (targetUrl) {
        try {
            // Fetch the raw Lua code from the external source
            const response = await axios.get(targetUrl);
            
            // Send the code back to Roblox as plain text
            res.set('Content-Type', 'text/plain');
            res.send(response.data);
        } catch (error) {
            console.error("Error fetching from source:", error.message);
            res.status(500).send("-- Error: Could not reach the script source (Pastebin/GitHub).");
        }
    } else {
        res.status(404).send("-- Error: Preset name '" + presetName + "' not found in server configuration.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
