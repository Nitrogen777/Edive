import React from 'react';
import SendMessageForm from "./components/SendMessageForm"
import Home from "./components/Home"
import SignUpForm from "./components/SignUpForm"
import SignInForm from "./components/SignInForm"

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";

class App extends React.Component {
    render() {
        return (
            <Router>
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
                <Route path="/home" component={Home} />
                <Route path="/send" component={SendMessageForm} />
                <Route path="/register" component={SignUpForm} />
                <Route path="/login" component={SignInForm} />
            </Router>
        )
    }
}

export default App

