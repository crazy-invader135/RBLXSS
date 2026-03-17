const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration: Link your preset names to Raw URLs
// Example: https://pastebin.com/raw/XXXXXX
const presets = {
    "test_script": "https://pastebin.com/raw/your_id_here",
    "admin_gui": "https://pastebin.com/raw/another_id",
    "fun_mode": "https://raw.githubusercontent.com/user/repo/main/script.lua"
};

app.get('/get-command', async (req, res) => {
    const presetName = req.query.preset;
    const targetUrl = presets[presetName];

    if (targetUrl) {
        try {
            // Fetch the raw code from the URL
            const response = await axios.get(targetUrl);
            res.set('Content-Type', 'text/plain');
            res.send(response.data);
        } catch (error) {
            res.status(500).send("-- Error fetching code from remote source");
        }
    } else {
        res.status(404).send("-- Preset name not found in server config");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
