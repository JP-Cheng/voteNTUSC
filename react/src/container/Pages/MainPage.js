import React from 'react'
import ReactDOM from 'react-dom'

import TopImg from '../../component/TopImg/TopImg'
import Option from '../../component/Option/Option'
import admin from '../../component/Option/admin.png'
import user from '../../component/Option/user.png'

import Dashboard from './Dashboard'

const iconScale = 225;


class MainPage extends React.Component {
    constructor() {
        super();
        this.redirect = this.redirect.bind(this);
    }



    redirect = (loginType) => {
        const appNode = document.getElementById("App");
        const dashboard = React.createElement(Dashboard, loginType);

        if (dashboard != null)
            ReactDOM.render(dashboard, appNode);
        // NOTE that ReactDOM.render() will replace React-rendered children 
        // with a new root component
    }

    /*
        test = () => {
            alert('test');
        }
    
        /*
        componentDidMount() {
            const app = document.getElementById('App')
            console.log(app);
            const dash = React.createElement(Dashboard);
            console.log(dash);
            ReactDOM.render(dash, app);
        }
        */

    render() {
        return (
            <div className="MainPage Page">
                <TopImg />
                <br />
                <Option type="admin" src={admin} scale={iconScale} onClick={this.redirect} />
                <Option type="user" src={user} scale={iconScale} onClick={this.redirect} />
            </div>
        );
    }
}

export default MainPage;

