const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const mariadb = require("mariadb");
const Discord = require('discord.js');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs')
const fs = require('fs')
const authData = JSON.parse(fs.readFileSync('auth.json'))
const client = new Discord.Client();
const port = authData.port
const token = authData.token
const secret = authData.secret


passport.use(new LocalStrategy(
    { usernameField: 'userId' },
    async (userId, password, done) => {
        let user = await getUserById(userId)
        if (!user) {
            return done(null, false, { message: 'Invalid credentials.\n' });
        }
        if (!bcrypt.compareSync(password, user.passHash)) {
            return done(null, false, { message: 'Invalid credentials.\n' });
        }
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
    let user = await getUserById(userId)
    done(null, user);
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        return uuidv4()
    },
    secret: secret,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());


const pool = mariadb.createPool({
    user: 'root',
    password: 'r00t',
    database: "edive"
});

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

async function isAllowed(userId, serverId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM allowed WHERE userId = ? and serverId = ?;", [userId, serverId]);
    conn.end()
    return content.length >= 1;
}

async function getUserById(userId) {
    let conn = await pool.getConnection();
    let content = await conn.query("SELECT * FROM accounts WHERE userId = ?;", [userId]);
    if (content.length >= 1) {
        conn.end()
        return content[0];
    } else {
        conn.end()
        return null;
    }
}

async function addNewUser(userID, passHash) {
    let conn = await pool.getConnection();
    await conn.query("INSERT INTO accounts VALUES(?, ?)", [userID, passHash]);
    conn.end()
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
    if (!req.isAuthenticated || req.user == null) {
        res.json({ success: false, message: "You are not logged in!" })
    } else {
        let allowed = await isAllowed(req.user.userId, req.body.serverId)
        let channelId = await getChannel(req.body.serverId)
        if (channelId == null) {
            res.json({ success: false, message: "The server did not choose a channel!" })
        } else if (allowed) {
            client.channels.fetch(channelId).then(channel => channel.send(req.body.msg))
            res.json({ success: true, message: "Success" })
        } else {
            res.json({ success: false, message: "You are not allowed to send messages to that server!" })
        }
    }
})

router.post("/api/signup", async (req, res) => {
    let user = await getUserById(req.body.userID)
    if(user == null){
        await addNewUser(req.body.userID, req.body.passHash)
        res.json({ success: true, message: "Success" })
    }else{
        res.json({ success: false, message: "There is already an account with that userID!" })
    }
})

router.post("/api/login", async (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            console.log(info.message)
            return res.send({ success: false, message: info.message })
        }
        if (err) {
            return res.send({ success: false, message: err });
        }
        if (!user) {
            return res.send({ success: false, message: "Unable to log in" });
        }
        req.login(user, (err) => {
            if (err) {
                return res.send({ success: false, message: err });
            }
            return res.send({ success: true, message: "Success" });
        })
    })(req, res);
})

router.get("/api/user", (req, res) => {
    if (!req.isAuthenticated || req.user == null) {
        res.send(null)
    } else {
        res.send(req.user.userId)
    }
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