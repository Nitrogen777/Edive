const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const router = express.Router();
const mariadb = require("mariadb");
const DiscordOauth2 = require("discord-oauth2");
const Discord = require('discord.js');
const fetch = require('node-fetch');
const btoa = require('btoa')
const fs = require('fs');
const { report } = require('process');
const authData = JSON.parse(fs.readFileSync('auth.json'))
const client = new Discord.Client();
const port = authData.port
const token = authData.token
const secret = authData.secret
const CLIENT_ID = authData.CLIENT_ID
const CLIENT_SECRET = authData.CLIENT_SECRET

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        return uuidv4()
    },
    cookie:{ maxAge: 60000},
    secret: secret,
    resave: false,
    saveUninitialized: true
}))



const pool = mariadb.createPool({
    user: 'root',
    password: 'r00t',
    database: "edive"
});


function formatDateTime(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
async function setChannelServer(channelId, serverId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM servers WHERE serverId = ?;", [serverId]);
    if (content.length >= 1) {
        await conn.query("UPDATE servers SET channelId = ? WHERE serverId = ?", [channelId, serverId]);
        conn.end()
    } else {
        await conn.query("INSERT INTO servers VALUES(?, ?)", [serverId, channelId]);
        conn.end()
    }
}

async function allowUser(userId, serverId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM allowed WHERE userId = ? and serverId = ?;", [userId, serverId]);
    if (content.length >= 1) {
        conn.end()
    } else {
        await conn.query("INSERT INTO allowed VALUES(?, ?)", [userId, serverId]);
        conn.end()
    }
}

async function addToken(sessionId, token) {
    let conn = await pool.getConnection();
    await conn.query("INSERT INTO tokens VALUES(?, ?, ?)", [sessionId, token, formatDateTime(new Date(1))]);
    conn.end()
}
async function getToken(sessionId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM tokens WHERE session = ?;", [sessionId]);
    conn.end()
    if (content.length >= 1) {
        return content[0].token;
    } else {
        return null;
    }
}
async function isAllowed(userId, serverId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM allowed WHERE userId = ? and serverId = ?;", [userId, serverId]);
    conn.end()
    return content.length >= 1;
}

async function getUser(sessionID) {
    let token = await getToken(sessionID)
    if (token == null) {
        return null;
    } else {
        let response = await fetch('https://discordapp.com/api/v6/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return await response.json()
    }
}

async function getChannel(serverId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT channelId FROM servers WHERE serverId = ?", [serverId]);
    if (content.length >= 1) {
        conn.end()
        return content[0].channelId;
    } else {
        conn.end()
        return null;
    }
}


router.post("/api/send", async (req, res) => {
    let user = await getUser(req.sessionID)
    let allowed = await isAllowed(user.id, req.body.serverId)
    let channelId = await getChannel(req.body.serverId)
    if (channelId == null) {
        res.json({ success: false, message: "The server did not choose a channel!" })
    } else if (allowed) {
        client.channels.fetch(channelId).then(channel => channel.send(req.body.msg))
        res.json({ success: true, message: "Success" })
    } else {
        res.json({ success: false, message: "You are not allowed to send messages to that server!" })
    }
})


router.get("/api/login", async (req, res) => {
    res.send(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A${port}%2Fapi%2Fcallback&response_type=code&scope=identify%20guilds`)
})

router.get("/api/callback", async (req, res) => {
    let code = req.query.code
    let params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('scope', 'identify');
    params.append('redirect_uri', `http://localhost:${port}/api/callback`);

    let response = await fetch(`https://discordapp.com/api/oauth2/token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
    let user = await response.json()
    console.log(user)
    await addToken(req.sessionID, user.access_token)
    res.redirect("http://localhost:3000/home")
})

router.get("/api/user", async (req, res) => {
    res.json(await getUser(req.sessionID))
})

router.get("/api/count", (req, res) => {
    res.send("" + client.guilds.cache.size)
})

client.on('message', async msg => {
    if (msg.content.startsWith("]")) {
        //msg.channel.send("i don't have any commands yet, stupid dev")
        if (msg.content.startsWith("]channel")) {
            let channel = msg.content.split(" ")[1]
            await setChannelServer(channel, msg.guild.id);
            msg.channel.send("success")
        }
        if (msg.content.startsWith("]allow")) {
            let userId = msg.content.split(" ")[1]
            await allowUser(userId, msg.guild.id);
            msg.channel.send("allowed " + userId)
        }
    }
});

client.login(token);
app.use("/", router)
app.listen(port, () => console.log(`Backend listening at http://localhost:${port}`))