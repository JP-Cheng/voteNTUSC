import React from 'react'
import Option from '../component/Option/Option.js'
import imgSrc from '../component/Option/sc.png'

const optStyle = {
    display: "inline-block",
    position: "relative",
    width: 60 + "vw",
    marginLeft: 20 + "vw",
    marginRight: 20 + "vw",
    //    float: "left"
}

class Main extends React.Component {
    render() {
        return (
            <div className="main" >

                <div className="optionWrapper" style={optStyle}>
                    <Option type="admin" src={imgSrc} />
                    <Option type="user" src={imgSrc} />
                </div>
            </div>
        );
    }
};

export default Main;