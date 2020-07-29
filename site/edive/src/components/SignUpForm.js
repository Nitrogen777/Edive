import React from 'react';
import {createNewUser} from './API';




class SignUpForm extends React.Component{
    constructor(props){
        super(props)
        this.state = {userID: "", password: ""}

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    validPassword(password){
        console.log(password)
        var funcs = [
            (pass) => {return pass != null},
            (pass) => {return pass.length >= 8},
            (pass) => {return pass.match(/[0-9]/).length > 0},
            (pass) => {return pass.match(/[a-zA-Z]/).length > 0}
        ]
        return funcs.some(func => !func(password))
    }

    handleSubmit(event){
        event.preventDefault();
        if(this.state.userID === ""){
            alert("userID is empty")
        }else if(!this.validPassword(this.state.password)){
            alert("Password is too weak!")
        }else{
            createNewUser(this.state.userID, this.state.password)
        }
    }
    handleChange(event){
        if(event.target.name === "password"){
            this.setState({userID: this.state.userID, password: event.target.value})
        }else if(event.target.name === "userID"){
            this.setState({userID: event.target.value, password: this.state.password})
        }
    }
    render(){
        return(
            <form onSubmit = {this.handleSubmit}>
                <label>Discord User Id</label>
                <input name = "userID" type="text" value={this.state.userID} onChange={this.handleChange} />
                <label>Password</label>
                <input name = "password" type="password" value={this.state.password} onChange={this.handleChange} />
                <input type="submit" value="Submit" />
            </form>
        )
    }
}

export default SignUpForm