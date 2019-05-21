import React from 'react'
import './Question.css'

export default (props) => {
    return (
        <div className="quesContainer"  >
            <span className="question"  > {props.ques}
            </span>
        </div>
    );
}