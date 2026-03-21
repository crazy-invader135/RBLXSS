const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const app = express();
const db = new Database('users.db');
const PORT = process.env.PORT || 3000;

// Initialize Database
db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'roblox-control-secret',
    resave: false,
    saveUninitialized: false
}));

let commandQueue = [];

// --- STYLED HTML TEMPLATE ---
const pageLayout = (content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Executor Cloud Dashboard</title>
        <style>
            :root { --bg: #0b0e14; --card-bg: #161b22; --text: #adbac7; --accent: #58a6ff; --border: #30363d; --success: #3fb950; }
            body { 
                font-family: 'Segoe UI', sans-serif; background-color: var(--bg); color: var(--text); 
                margin: 0; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; 
            }
            
            /* LOGIN BOX STYLES */
            .box { background: var(--card-bg); padding: 30px; border-radius: 12px; border: 1px solid var(--border); width: 320px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            input { 
                background: #0d1117; border: 1px solid var(--border); color: white; 
                padding: 12px; margin: 10px 0; width: 250px; border-radius: 6px; outline: none; text-align: center;
            }
            input:focus { border-color: var(--accent); }
            button { 
                background: var(--accent); color: white; border: none; padding: 12px; 
                border-radius: 6px; cursor: pointer; width: 275px; font-weight: bold; margin-top: 10px;
            }

            /* DASHBOARD & CARD STYLES */
            .header-section { text-align: center; margin-bottom: 30px; width: 100%; max-width: 800px; }
            .grid { 
                display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
                gap: 25px; width: 100%; max-width: 850px; margin-top: 20px; 
            }
            .card { 
                background: var(--card-bg); border: 1px solid var(--border); 
                border-radius: 12px; overflow: hidden; transition: 0.3s; cursor: pointer; 
            }
            .card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 12px 24px rgba(0,0,0,0.5); }
            .card-image { 
                width: 100%; height: 110px; background-size: cover; background-position: center; 
                background-color: #21262d; filter: brightness(0.7); transition: 0.3s;
            }
            .card:hover .card-image { filter: brightness(1.1); }
            .card-content { padding: 20px; text-align: center; border-top: 1px solid var(--border); }
            .card-title { font-size: 17px; font-weight: 600; color: #ffffff; margin: 0; }
            .card-description { font-size: 13px; color: #768390; margin-top: 8px; }
            
            a { color: var(--accent); text-decoration: none; font-size: 13px; margin-top: 15px; display: inline-block; }
        </style>
    </head>
    <body>${content}</body>
    </html>
`;

// --- AUTH ROUTES ---

app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.send(pageLayout(`
        <div class="box">
            <h1>Login</h1>
            <form action="/login" method="POST">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">LOG IN</button>
            </form>
            <a href="/signup">Create an account</a>
        </div>
    `));
});

app.get('/signup', (req, res) => {
    res.send(pageLayout(`
        <div class="box">
            <h1>Register</h1>
            <form action="/signup" method="POST">
                <input type="text" name="username" placeholder="Choose Username" required>
                <input type="password" name="password" placeholder="Choose Password" required>
                <button type="submit">SIGN UP</button>
            </form>
            <a href="/">Already have an account? Login</a>
        </div>
    `));
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    try {
        db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hash);
        res.redirect('/');
    } catch (e) { res.send("Username already exists. <a href='/signup'>Try again</a>"); }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user.username;
        res.redirect('/dashboard');
    } else { res.send("Invalid credentials. <a href='/'>Try again</a>"); }
});

// --- MAIN DASHBOARD ---

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.send(pageLayout(`
        <div class="header-section">
            <h1>Welcome, ${req.session.user}</h1>
            <input type="text" id="targetInput" placeholder="Target Roblox Name">
            <p style="font-size:11px; color:var(--success)">SESSION ACTIVE</p>
        </div>

        <div class="grid">
            <div class="card" onclick="send('142785488')">
                <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-pa0903328575089f9353974d61993245/420/420/Image/Png');"></div>
                <div class="card-content">
                    <p class="card-title">F3X Tools</p>
                    <p class="card-description">Bypass ownership injection.</p>
                </div>
            </div>

            <div class="card" onclick="send('https://pastebin.com/raw/S8R3Y4Qy')">
                <div class="card-image" style="background-image: url('https://tr.rbxcdn.com/30day-87612f0088922c0989f635038753239a/420/420/Image/Png');"></div>
                <div class="card-content">
                    <p class="card-title">Main Script</p>
                    <p class="card-description">Run cloud Pastebin code.</p>
                </div>
            </div>
        </div>

        <br><a href="/logout" style="color:#f85149">Logout</a>

        <script>
            function send(id) {
                const target = document.getElementById('targetInput').value;
                if (!target) return alert("Enter a Roblox username!");
                fetch('/send?id=' + encodeURIComponent(id) + '&target=' + encodeURIComponent(target))
                    .then(() => console.log("Sent: " + id));
            }
        </script>
    `));
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// --- API ---

app.get('/send', (req, res) => {
    if (!req.session.user) return res.status(403).send("Unauthorized");
    const { id, target } = req.query;
    if (id && target) {
        commandQueue.push({ id, target });
        res.send("OK");
    }
});

app.get('/getCommand', (req, res) => {
    res.json(commandQueue.shift() || { id: null });
});

app.listen(PORT, () => console.log("Dashboard Live"));
