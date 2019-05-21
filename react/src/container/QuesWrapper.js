import React from 'react'
import Question from '../component/Question/Question'

const listStyle = {
    listStyleType: "none",
}

class QuesWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ques: []
        }
    }

    fetchQues = () => {
        fetch("http://localhost:7777/aSemester/conferences/aConference")
            .then(res => res.json())
            .then(res => {
                let after = this.state.ques;
                for (let i in res.titles) {
                    after.push(res.titles[i]);
                }
                this.setState({ ques: after });
            })
    }

    componentWillMount() {
        this.fetchQues();
    }

    render() {
        return (

            <div className="QuesWrapper" style={listStyle} >
                {
                    this.state.ques.map(aTitle =>
                        <Question ques={aTitle} />
                    )
                }

            </div>

        );
    }
}

export default QuesWrapper;