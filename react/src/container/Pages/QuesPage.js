import React from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import QuesTitle from '../../component/QuesTitle'
import Option from '../../component/Option/Option'
import afterPage from '../../component/afterVote'

import agree from '../../component/Option/v.png'
import reject from '../../component/Option/x.png'
import reply from '../../component/Option/reply.png'
import skip from '../../component/Option/skip.png'
import logout from '../../component/Option/logout.png'
import turnback from '../../component/Option/return.png'

const iconScale = 250;

class QuesPage extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "a bill"
        }
    }
    render() {
        return (
            <div className="QuesPage Page">
                <Switch>
                    <Route path="/vote/afterPage" component={afterPage}></Route>
                </Switch>
                <QuesTitle text={this.state.text} />
                <br />
                <NavLink activeClassName="selected" to="/vote/afterPage">
                    <Option type="agree" src={agree} scale={iconScale} />

                    <Option type="reject" src={reject} scale={iconScale} />
                    <br />
                    <Option type="skip" src={skip} scale={iconScale} />
                    <Option type="return" src={turnback} scale={iconScale} />
                </NavLink>
            </div>
        );
    }
}


export default QuesPage;