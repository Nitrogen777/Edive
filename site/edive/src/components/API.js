var bcrypt = require('bcryptjs')

export async function sendMessageToServer(serverId, msg) {
    try {
        let response = await fetch("/api/isallowed/" + serverId).then(res => res.json())
        console.log(response.allowed)
        if (!response.allowed) {
            alert("You are not allowed to send messages to that server")
        }
        else {
            let body = { serverId: serverId, msg: msg }
            fetch("/api/send", {
                method: 'post',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
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
    console.log("PEESD")
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
