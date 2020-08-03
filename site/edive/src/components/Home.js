import React from 'react'
import { Link, Router } from "react-router-dom";

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = { numserver: '', username: '' }

    }

    componentDidMount = async () => {
        let serverCount = await fetch("/api/count").then(res => res.text())
        let username = await fetch("/api/user").then(res => res.text())
        this.setState({ numserver: serverCount, username: username })
    }

    displayForUser() {
        if (this.state.username === '') {
            return (
                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/Register">Sign Up</Link>
                </div>
            )
        }else{
            return (
                <div>
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