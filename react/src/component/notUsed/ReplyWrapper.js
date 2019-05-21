import React from 'react'
import Option from './Option/Option.js'
import check from './Option/check.png'
import reply from './Option/reply.png'
import skip from './Option/skip.png'

const iconScale = 250;

const replyStyle = {
    display: "inline-block",
    textAlign: "right",
    right: 0,
}

export default () => {
    return (
        <span className="replyWrapper" style={replyStyle} >
            <Option type="skip" src={skip} scale={iconScale} />
            <Option type="reply" src={reply} scale={iconScale} />
        </span>
    );
}