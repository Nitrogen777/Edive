const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const router = express.Router();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs')
const authData = JSON.parse(fs.readFileSync('backend/auth.json'))
const client = new Discord.Client();
const port = authData.port
const token = authData.token

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

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


router.get("/api/test", async (req, res) => {
    console.log("OK! web asked me!")
    res.send("Gobba Gabba")
})

client.on('message', async msg => {
    if(msg.content.startsWith("]")){
        //msg.channel.send("i don't have any commands yet, stupid dev")
        if(msg.content.startsWith("]channel")){
          let channel = msg.content.split(" ")[1]
          await setChannelServer(channel, msg.guild.id);
          msg.channel.send("success")
        }
    }
  });
   
client.login(token);
app.use("/", router)
app.listen(port, () => console.log(`Backend listening at http://localhost:${port}`))