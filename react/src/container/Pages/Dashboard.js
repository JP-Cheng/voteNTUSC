import React from 'react'
import QuesTitle from '../../component/QuesTitle'
import Option from '../../component/Option/Option'
import vote from '../../component/Option/vote.png'
import result from '../../component/Option/result.png'
import hist from '../../component/Option/hist.png'
import logout from '../../component/Option/logout.png'


class Dashboard extends React.Component {
    render() {
        return (
            <div className="Dashboard Page">
                <QuesTitle text="Dashboard" />
                <br />
                <Option type="vote" src={vote} />
                <Option type="result" src={result} />
                <br />
                <Option type="hist" src={hist} />
                <Option type="logout" src={logout} />
            </div >
        );
    }
}

export default Dashboard;
