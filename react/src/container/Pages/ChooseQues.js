import React from 'react'
import QuesWrapper from '../QuesWrapper'
import QuesTitle from '../../component/QuesTitle'
import Option from '../../component/Option/Option'
import logout from '../../component/Option/logout.png'
import turnback from '../../component/Option/return.png'

const iconScale = 130;
const divStyle = {
    width: 25.5 + "vw"
}

class ChooseQues extends React.Component {
    render() {
        return (
            <div className="ChooseQuestion Page" >
                <QuesTitle text="View Results" />
                <QuesWrapper />
                <div className="forTypeSet" style={divStyle} ></div>
            </div>
        );
    }
}

export default ChooseQues;
