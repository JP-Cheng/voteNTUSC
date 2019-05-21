import React from 'react'

const titleStyle = {
    font: "bold 72px Helvetica, Sans-Serif",
    letterSpacing: -1,
    margin: 3 + "vh",
    textAlign: "left"
}

export default (props) => {
    return (
        <div className="QuesTitle" style={titleStyle}>
            {props.text}
        </div>
    );
}
