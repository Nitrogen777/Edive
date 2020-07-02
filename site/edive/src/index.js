import React from 'react';
import ReactDOM from 'react-dom';
class Api extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            data: null
        };
    }
    componentDidMount() {
        this.getApiData()
    }
    getApiData = async() => {
        try{
            let text = await fetch("/api/test").then(res => res.text())
            this.setState({ data: text})
        } catch (err) {
            console.log(err);
        }
    }
    render(){
        return(
        <h1>{this.state.data}</h1>
        )
    }
}
ReactDOM.render(
    <div>
        <h1>Hello, world!</h1>
        <Api />
    </div>,
    document.getElementById('root')
);