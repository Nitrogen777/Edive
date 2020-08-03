var bcrypt = require('bcryptjs')

export async function sendMessageToServer(serverId, msg) {
    try {
        let body = { serverId: serverId, msg: msg }
        let response = await fetch("/api/send", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json())
        if (!response.success) {
            alert(response.message)
        }
    } catch (err) {
        console.log(err);
    }
}



export async function login(userId, password) {
    try {
        let body = { userId: userId, password: password }
        return await fetch("/api/login", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json())
    } catch (err) {
        console.log(err);
    }
}

export async function createNewUser(userID, password) {
    try {
        let body = { userID: userID, passHash: bcrypt.hashSync(password) }
        return await fetch("/api/signup", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json)
    } catch (err) {
        console.log(err);
    }
}
