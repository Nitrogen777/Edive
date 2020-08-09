import React from 'react'
import { Link, Router } from "react-router-dom";
import { getAuthLink } from "./API";

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = { numserver: '', link: ''}
        this.user = null
    }

    componentDidMount = async () => {
        let serverCount = await fetch("/api/count").then(res => res.text())
        console.log(serverCount)
        this.user = await fetch("/api/user").then(res => res.json())
        console.log(this.user)
        let link = await getAuthLink()
        this.setState({ numserver: serverCount, link: link})
    }

    displayForUser() {
        if (this.user == null) {
            return (
                <div>
                    <a href= {this.state.link}>Login With Discord</a>
                </div>
            )
        }else{
            return (
                <div>
                    <h1>Hello {this.user.username}</h1>
                    <Link to="/send">Send Message</Link>
                </div>
            )
        }
    }
    render() {
        return (
            <div>
                <h1>Welcome to Edive</h1>
                <h2>The spammy discord bot</h2>
                <h3>{this.state.numserver} Servers are using Edive</h3>
                {this.displayForUser()}
            </div>
        )
    }
}

export default Home