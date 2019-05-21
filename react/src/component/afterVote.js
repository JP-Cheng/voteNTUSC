import React from 'react'
import checked from './Option/check.png'

export default () => {
    return (
        <div style={{ marginTop: "5em" }}>
            <h1>Your ballot has been received.</h1>
            <h2>You can check on the result page after the end of this vote.</h2>
            <img src={checked} style={{ height: 200, width: 200 }} />
        </div>
    );
}