import React from 'react'
import vote from "./vote.png"

const welcomeStyle = {
    fontSize: 60,
    display: "block"
}

const divStyle = {
    width: 60 + "vw",
    height: 60 + "vh",
    textAlign: 'center',
    margin: 20,
    display: "inline-block"
};

const imgStyle = {
    margin: 20,
    padding: 0,
    width: "50vh",
    height: "50vh",
};

export default () => {
    return (
        <div className="TopImg" style={divStyle} >
            <img src={vote} alt="vote icon" style={imgStyle} />
            <div className="welcome" style={welcomeStyle}>Welcome to NTUSC</div>
        </div>
    )
}