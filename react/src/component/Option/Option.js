import React from 'react'
import './Option.css'
// note: for an unknown reason, in-file css does not work
// the css for this file is specified in './Option.css' 


// set 250 as default scale value
// NOTE that 150 is the min scale that can be good look
export default (props) => {
    const sqScale = props.scale || 250;

    const optStyle = {
        width: props.width || sqScale,
        height: props.height || sqScale,
    }

    const fontScale = {
        fontSize: (sqScale > 180) ? (32 + "pt") : (18 + "pt")
    }

    return (
        <div className="option" style={optStyle} onClick={props.onClick} >
            <img className="optionImg" src={props.src} alt={props.type}
                title={props.type} width={optStyle.width} height={optStyle.height} />
            {props.type ?
                <div className="optionFontContainer">
                    <font style={fontScale} >
                        {props.type}
                    </font>
                </div>
                : null
            }
        </div>
    );
}