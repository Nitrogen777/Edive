const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
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
    (userId, password, done) => {
        getUserById(userId, (user) => {
            if (!user) {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
            if (!bcrypt.compareSync(password, user.passHash)) {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.userId);
});

passport.deserializeUser((userId, done) => {
    getUserById(userId, (user) => {
        done(null, user);
    });
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

const mariadb = require("mariadb");
const pool = mariadb.createPool({
    user: 'root',
    password: 'r00t',
    database: "edive"
});

async function setChannelServer(channelId, serverId) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM servers WHERE serverId = ?;", [serverId]);
        if (content.length >= 1) {
            await conn.query("UPDATE servers SET channelId = ? WHERE serverId = ?", [channelId, serverId]);
            conn.end
        } else {
            await conn.query("INSERT INTO servers VALUES(?, ?)", [serverId, channelId]);
            conn.end
        }
    } catch (err) {
        conn.end;
        throw err;
    }
}

async function allowUser(userId, serverId) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM allowed WHERE userId = ? and serverId = ?;", [userId, serverId]);
        if (content.length >= 1) {
            conn.end
        } else {
            await conn.query("INSERT INTO allowed VALUES(?, ?)", [userId, serverId]);
            conn.end
        }
    } catch (err) {
        conn.end;
        throw err;
    }
}

async function isAllowed(userId, serverId, callback) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM allowed WHERE userId = ? and serverId = ?;", [userId, serverId])
        if (content.length >= 1) {
            conn.end
            callback({allowed: true})
        } else {
            conn.end
            callback({allowed: false})
        }
    } catch (err) {
        conn.end;
        throw err;
    }
}

async function getUserById(userId, callback) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM accounts WHERE userId = ?;", [userId]);
        if (content.length >= 1) {
            conn.end
            callback(content[0]);
        } else {
            callback(null);
            conn.end
        }
    } catch (err) {
        throw err;
    }
}

async function addNewUser(userID, passHash) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("INSERT INTO accounts VALUES(?, ?)", [userID, passHash]);
        conn.end
    } catch (err) {
        conn.end;
        throw err;
    }
}
async function getChannel(serverId, callback) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT channelId FROM servers WHERE serverId = ?", [serverId]);
        if (content.length >= 1) {
            conn.end
            callback(content[0].channelId);
        } else {
            callback(null);
            conn.end
        }
    } catch (err) {
        conn.end;
        throw err;
    }
}

async function getChannel(serverId, callback) {
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT channelId FROM servers WHERE serverId = ?", [serverId]);
        if (content.length >= 1) {
            conn.end
            callback(content[0].channelId);
        } else {
            callback(null);
            conn.end
        }
    } catch (err) {
        throw err;
    }
}


router.post("/api/send", async (req, res) => {
    getChannel(req.body.serverId, (channelId) => {
        client.channels.fetch(channelId).then(channel => channel.send(req.body.msg))
    })
})

router.post("/api/signup", async (req, res) => {
    addNewUser(req.body.userID, req.body.passHash)
})

router.post("/api/login", async (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            console.log(info.message)
            return res.send({success: false, message: info.message})
        }
        if (err) {
            return res.send({success: false, message: err});
        }
        if (!user) {
            return res.send({success: false, message: "Unable to log in"});
        }
        req.login(user, (err) => {
            if (err) {
                return res.send({success: false, message: err});
            }
            return res.send({success: true, message: "Success"});
        })
    })(req, res);
})

router.get("/api/user", (req, res) => {
    if(!req.isAuthenticated || req.user == null){
        res.send(null)
    }else{
        res.send(req.user.userId)
    }
})

router.get("/api/count", (req, res) => {
    res.send("" + client.guilds.cache.size)
})

router.get("/api/isallowed/:serverId", (req, res) => {
    if(!req.isAuthenticated || req.user == null){
        res.json({allowed: false})
    }else{
        isAllowed(req.user.userId, req.params.serverId, (response) => {
            res.json(response)
        })
    }
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