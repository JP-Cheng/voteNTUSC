import React from 'react'
import QuesTitle from '../../component/QuesTitle'

class ResultChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            agree: 0,
            disagree: 0,
            abstain: 0,
            result: "",
            postFix: ""
        }
    }

    fetchResult() {
        fetch("http://localhost:7777/aSemester/conferences/aConference/votes/someTitle")
            .then(res => res.json())
            .then(res => this.setState({
                agree: res.agree,
                disagree: res.disagree,
                abstain: res.abstain
            }))
            .then(() => this.setPostFix());
    }

    componentWillMount() {
        this.fetchResult();
    }

    setPostFix = () => {
        this.setState(state => ({
            result: (state.agree > state.disagree)
                ? ("passed.") : (state.agree < state.disagree)
                    ? ("opposed.") : ("tied."),
            postFix: (state.agree > state.disagree)
                ? "Congrats." : (state.agree < state.disagree)
                    ? " :(" : "\nChair's decision."
        }));
    }

    voteAgree = () => {
        this.setState(state => ({ agree: state.agree + 1, }));
        this.setPostFix();
    };
    voteDisagree = () => {
        this.setState(state => ({ disagree: state.disagree + 1 }));
        this.setPostFix();
    };
    voteAbstain = () => this.setState(state => ({ abstain: state.abstain + 1 }));

    // sendResult = () => {
    //     return (
    //         <form action="/aQues/result" method="post" style={{ "display": "none" }}>
    //             agree: {this.state.agree}
    //             disagree: {this.state.disagree}
    //             abstain: {this.state.disagree}
    //         </form>
    //     );
    // }

    h2Style = {
        fontSize: 36
    }

    em = {
        color: "red",
        fontSize: 36,
        fontWeight: "bold"
    }

    render() {
        return (
            <div>
                <QuesTitle text={this.props.text} /><br />

                <h2 style={this.h2Style}>Agree: {this.state.agree}</h2>
                <h2 style={this.h2Style}>Disagree: {this.state.disagree}</h2>
                <h2 style={this.h2Style}>Abstain: {this.state.abstain}</h2>

                <div className="resultArea" >
                    <div style={this.h2Style}>This bill/motion/point is <br /></div>
                    <div style={this.em}> {this.state.result} <br /></div>
                    <div style={this.h2Style}> {this.state.postFix}</div>
                </div>

                <br />
                <button onClick={this.voteAgree} > O </button>
                <button onClick={this.voteDisagree} > X </button>
                <button onClick={this.voteAbstain} > / </button>
            </div>
        );
    }
}

export default ResultChart;