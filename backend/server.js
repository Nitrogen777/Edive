const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const router = express.Router();
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mariadb = require("mariadb");
const pool = mariadb.createPool({ 
    user:'root', 
    password: 'r00t',
    database: "edive"
});

async function setChannelServer(channelId, serverId){
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM servers WHERE serverId = ?;", [serverId]);
        if(content.length >= 1){
            await conn.query("UPDATE servers SET channelId = ? WHERE serverId = ?", [channelId, serverId]);
            conn.end
        }else{
            await conn.query("INSERT INTO servers VALUES(?, ?)", [serverId, channelId]);
            conn.end
        }
    } catch(err){
        conn.end;
        throw err;
    }
}
async function getChannel(serverId, callback){
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT channelId FROM servers WHERE serverId = ?", [serverId]);
        if(content.length >= 1){
            conn.end
            callback(content[0]);
        }else{
            callback(null);
            conn.end
        }
    } catch(err){
        conn.end;
        throw err;
    }
}

async function getFirstInQueue(callback){
    let conn;
    let content;
    try {
        conn = await pool.getConnection();
        content = await conn.query("SELECT * FROM messages LIMIT 1;");
        if(content.length >= 1){
            await conn.query("DELETE FROM messages LIMIT 1;");
            conn.end
            callback(content[0]);
        }else{
            callback(null);
            conn.end
        }
    } catch(err){
        conn.end;
        throw err;
    }
}
router.get("/api/message", (req, res) => {
    console.log("OK! bot asked me!")
    getFirstInQueue((data) => {
        res.send(data)
    })
})

router.post("/api/channel", async (req, res) => {
    console.log("OK! bot posted to me!")
    await setChannelServer(req.body.channelId, req.body.serverId);
    res.send("OK");
})

router.get("/api/channelid/:serverId", async (req, res) => {
    console.log("OK! bot asked me!")
    getChannel(req.params.serverId, (data) => {
        res.send(data.channelId)
    })
})
router.get("/api/test", async (req, res) => {
    console.log("OK! web asked me!")
    res.send("Gobba Gabba")
})

app.use("/", router)
app.listen(port, () => console.log(`Backend listening at http://localhost:${port}`))