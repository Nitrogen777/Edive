import React from 'react';
import { login } from './API';
import { Router, Redirect } from 'react-router-dom';



class SignUpForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = { userID: "", password: "" }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    handleSubmit(event) {
        event.preventDefault();
        login(this.state.userID, this.state.password).then(res => {
            if (!res.success) {
                alert(res.message)
            } else {
                window.location.href = "/home"
            }
        });
    }
    handleChange(event) {
        if (event.target.name === "password") {
            this.setState({ userID: this.state.userID, password: event.target.value })
        } else if (event.target.name === "userID") {
            this.setState({ userID: event.target.value, password: this.state.password })
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Discord User Id</label>
                    <input name="userID" type="text" value={this.state.userID} onChange={this.handleChange} />
                    <label>Password</label>
                    <input name="password" type="password" value={this.state.password} onChange={this.handleChange} />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export default SignUpForm