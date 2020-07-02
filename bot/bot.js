const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();
const backport = 8080;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
/*let fetched = await fetch("http://localhost:3000/api/message").then(res => res.json()).catch(err => msg.channel.send("no new messages"));
      if(fetched != null){
          msg.channel.send(fetched.content);
      }*/

client.on('message', async msg => {
  if(msg.content.startsWith("]")){
      //msg.channel.send("i don't have any commands yet, stupid dev")
      if(msg.content.startsWith("]channel")){
        let channel = msg.content.split(" ")[1]
        let body = {channelId: channel, serverId: msg.guild.id}
        let fetched = await fetch(`http://localhost:${backport}/api/channel`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.text())
        if(fetched === "OK"){
            msg.channel.send("success")
        }
      }else{
          await sendMessages()
      }
  }
});

async function sendMessages(){
    let promises = [];
    client.guilds.forEach(async element => {
        let channeld = await fetch(`http://localhost:${backport}/api/channelid/${element.id}`).then(res => res.text());
        console.log(channeld);
    });
}

client.login('NzI2NDI5NzgxMTYzMzc2NjU2.XvdKmg.B5a0lESiR1cYbXP_9PSyrqzUhpU');