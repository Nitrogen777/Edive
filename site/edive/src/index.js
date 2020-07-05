import React from 'react';
import ReactDOM from 'react-dom';


async function sendMessageToServer(serverId, msg){
    try{
        let body = {serverId: serverId, msg: msg}
        fetch("/api/test", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.log(err);
    }
}


class SendMessageForm extends React.Component{
    constructor(props){
        super(props)
        this.state = {serverId: "", msg: ""}

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(){
        if(this.state.serverId === ""){
            alert("serverId is empty")
        }
        if(this.state.msg.length > 100){
            alert("Character limit for message is 100 characters")
        }
        sendMessageToServer(this.state.serverId, this.state.msg)
    }
    handleChange(event){
        if(event.target.name === "msg"){
            this.setState({serverId: this.state.serverId, msg: event.target.value})
        }else if(event.target.name === "serverId"){
            this.setState({serverId: event.target.value, msg: this.state.msg})
        }
    }
    render(){
        return(
            <form onSubmit = {this.handleSubmit}>
                <label>Server Id</label>
                <input name = "serverId" type="text" value={this.state.serverId} onChange={this.handleChange} />
                <label>Message </label>
                <input name = "msg" type="text" value={this.state.msg} onChange={this.handleChange} />
                <input type="submit" value="Submit" />
            </form>
        )
    }
}
ReactDOM.render(
    <SendMessageForm/>,
    document.getElementById('root')
);