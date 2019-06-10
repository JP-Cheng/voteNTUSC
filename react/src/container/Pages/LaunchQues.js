import React from 'react'

export default class LaunchQues extends React.Component {
    constructor() {
        super();
        this.state = {
            title: ""
        }
    }

    styles = {
        forInput: {
            textAlign: 'center',
            margin: '10pt'
        },
        forFont: {
            textAlign: 'left',
            fontSize: 40
        },
        inputBlock: {
            height: '60pt',
            width: '10em'
        }
    }

    handleOnchange = event => {
        this.setState({
            title: event.target.value
        });
    }

    confirmLaunch = event => {
        if (event.key === 'Enter' && event.target.value !== "") {
            alert("Are you sure to launch a vote of: '" + this.state.title + "'?");
            event.target.value = "";
        }
    }

    render() {
        return (
            <div >
                <input style={this.styles.forInput}
                    onChange={this.handleOnchange}
                    onKeyPress={this.confirmLaunch}
                />
                <br />
                <font style={this.styles.forFont} >Launching a vote: </font>
                <br />
                <font style={this.styles.forFont} > {this.state.title} </font>
            </div>
        );
    }
}