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

// --- HTML TEMPLATE ---
const pageLayout = (content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Executor Cloud</title>
        <style>
            :root { --bg: #0b0e14; --card: #161b22; --text: #adbac7; --accent: #58a6ff; --border: #30363d; }
            body { font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); display: flex; flex-direction: column; align-items: center; padding: 50px; }
            .box { background: var(--card); padding: 30px; border-radius: 12px; border: 1px solid var(--border); width: 300px; text-align: center; }
            input { background: #0d1117; border: 1px solid var(--border); color: white; padding: 10px; margin: 10px 0; width: 80%; border-radius: 6px; }
            button { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 90%; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .card { background: var(--card); border: 1px solid var(--border); padding: 15px; border-radius: 8px; cursor: pointer; }
            .card:hover { border-color: var(--accent); }
            a { color: var(--accent); text-decoration: none; font-size: 12px; }
        </style>
    </head>
    <body>${content}</body>
    </html>
`;

// --- ROUTES ---

app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.send(pageLayout(`
        <div class="box">
            <h1>Login</h1>
            <form action="/login" method="POST">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <br><a href="/signup">Don't have an account? Sign Up</a>
        </div>
    `));
});

app.get('/signup', (req, res) => {
    res.send(pageLayout(`
        <div class="box">
            <h1>Sign Up</h1>
            <form action="/signup" method="POST">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Create Account</button>
            </form>
            <br><a href="/">Already have an account? Login</a>
        </div>
    `));
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    try {
        db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hash);
        res.redirect('/');
    } catch (e) { res.send("Username taken. <a href='/signup'>Try again</a>"); }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user.username;
        res.redirect('/dashboard');
    } else { res.send("Invalid login. <a href='/'>Try again</a>"); }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.send(pageLayout(`
        <h1>Welcome, ${req.session.user}</h1>
        <input type="text" id="target" placeholder="Roblox Username">
        <div class="grid">
            <div class="card" onclick="send('142785488')"><h3>F3X Tools</h3></div>
            <div class="card" onclick="send('https://pastebin.com/raw/S8R3Y4Qy')"><h3>Main Script</h3></div>
        </div>
        <br><a href="/logout">Logout</a>
        <script>
            function send(id) {
                const t = document.getElementById('target').value;
                if(!t) return alert("Target needed");
                fetch('/send?id=' + encodeURIComponent(id) + '&target=' + encodeURIComponent(t));
            }
        </script>
    `));
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// --- API ---
app.get('/send', (req, res) => {
    if (!req.session.user) return res.status(403).send("Log in first");
    const { id, target } = req.query;
    commandQueue.push({ id, target });
    res.send("OK");
});

app.get('/getCommand', (req, res) => res.json(commandQueue.shift() || { id: null }));

app.listen(PORT, () => console.log("Server Running"));
