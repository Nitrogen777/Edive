var bcrypt = require('bcryptjs')

export async function sendMessageToServer(serverId, msg){
    try{
        let body = {serverId: serverId, msg: msg}
        fetch("/api/send", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.log(err);
    }
}

export async function createNewUser(userID, password){
    try{
        let body = {userID: userID, passHash: bcrypt.hashSync(password)}
        fetch("/api/signup", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.log(err);
    }
}
