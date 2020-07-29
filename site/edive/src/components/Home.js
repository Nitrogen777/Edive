import React from 'react'

class Home extends React.Component{
    constructor(props){
        super(props)
        
        this.state = {numserver: '', username: ''}

    }

    componentDidMount = async() => {
        let serverCount = await fetch("/api/count").then(res => res.text())
        let username = await fetch("/api/user").then(res => res.text())
        this.setState({numserver: serverCount, username: username})
    }

    render(){
        return(
            <div>
                <h1>Welcome to Edive</h1>
                <h2>The spammy discord bot</h2>
                <h3>{this.state.numserver} Servers are using Edive</h3>
                <h3>{this.state.username} hello</h3>
            </div>
        )
    }
}

export default Home