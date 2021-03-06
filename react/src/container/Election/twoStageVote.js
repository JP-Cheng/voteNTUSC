import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { Button, Alert, Spinner } from 'reactstrap'
import { Doughnut } from 'react-chartjs-2';
import { TWO_STAGE_ELECTION_QUERY, CREATE_COMMITMENT_MUTATION, CREATE_OPENING_MUTATION, TWO_STAGE_ELECTION_SUBSCRIPTION } from '../../graphql/index'
import { myHash } from '../../hash'
import './Vote.css'
import Update from './Update'
import Delete from './Delete'

const countVote = (id, ballots) => ballots.filter(ballot => ballot.choice === id).length;

class VoteForm extends React.Component {
  constructor(props) {
    super(props);
    this.submit = null;
    this.secret = "";
    this.state = {
      msg: "這是您的驗票密碼"
    }
  }

  handleSecret = e => { this.secret = e.target.value };
  handleVote = e => {
    e.preventDefault();
    if (this.secret === "") {
      this.setState({ msg: "請輸入密碼！" });
      return;
    }
    const choice = parseInt(e.target.id);
    const hashedChoice = myHash(e.target.id)
    const hashedSecret = myHash(this.secret);
    if (this.props.stage === "COMMIT") {
      const commitment = myHash(`${hashedSecret}${hashedChoice}`);
      this.submit({ variables: { twoStageElectionId: this.props.electionId, commitment: commitment } });
    }
    else {
      this.submit({ variables: { twoStageElectionId: this.props.electionId, hashedSecret: hashedSecret, choice: choice } });
    }
  }

  render() {
    const commit = this.props.stage === "COMMIT";

    return (
      <Mutation mutation={commit ? CREATE_COMMITMENT_MUTATION : CREATE_OPENING_MUTATION}>
        {(create, { data, error }) => {
          this.submit = create;
          if (data && (data.createCommitment || data.createOpening)) return <strong>Thank You for your vote!</strong>;
          if (error) return <Alert color='danger'>Create ballot fail!</Alert>;

          return (
            <div className="election-ballot">
              投下神聖的一票：<br />
              {`${commit ? "設定" : ""}密碼: `}<input type="password" placeholder={this.state.msg} onChange={this.handleSecret} /><br />
              {this.props.choices.map((choice, idx) => {
                return (<>
                  <Button className="aChoice" color="info" id={idx} key={idx} onClick={this.handleVote}>{idx + 1}. {choice}</Button>
                  <br />
                </>)
              })}
              <Button className="aChoice" color="danger" id={-1} key={-1} onClick={this.handleVote}>投廢票</Button>
              <br />
            </div>
          )
        }}
      </Mutation>
    )
  }
}

class twoStageVote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggled: false,
      commitmentToggled: false,
      alert: false
    }
  }

  toggle = _ => {
    this.setState(state => {
      state.toggled = !state.toggled;
      return state;
    })
  }

  commitmentToggle = _ => {
    this.setState(state => {
      state.commitmentToggled = !state.commitmentToggled;
      return state;
    })
  }

  isVoted = voted => {
    return voted.find(({ id }) => id === localStorage.uid)
  }

  isVotable = voters => {
    return voters.find(({ id }) => id === localStorage.uid);
  }

  render() {
    return (
      <Query query={TWO_STAGE_ELECTION_QUERY} variables={{ query: this.props.electionId }}>
        {({ data, loading, error, subscribeToMore }) => {
          if (error) return <h1>Error!</h1>;
          if (loading || !(data.twoStageElection)) return <Spinner color="primary" />;
          let election = data.twoStageElection;

          subscribeToMore({
            document: TWO_STAGE_ELECTION_SUBSCRIPTION,
            variables: { electionId: this.props.electionId },
            updateQuery: (prev, { subscriptionData }) => {
              if (!(subscriptionData.data) || !(subscriptionData.data.twoStageElection.mutation)) return prev;
              else if (subscriptionData.data.twoStageElection.mutation === "DELETED") {
                this.setState(state => {
                  state.alert = true;
                  return state;
                })
                return prev;
              }
              else {
                return { twoStageElection: subscriptionData.data.twoStageElection.data };
              }
            }
          })

          let votable, text;
          if (election.state === "CLOSE") {
            votable = false;
            text = "尚未開始";
          }
          else if (election.state === "END") {
            votable = false;
            text = "已結束";
          }
          else if (!localStorage.uid && election.state === "OPEN") {
            votable = true;
            text = "參與開票";
          }
          else if (!localStorage.uid) {
            votable = false;
            text = "請先登入";
          }
          else if (election.state === "OPEN") {
            votable = false;
            text = "請先登出";
          }
          else if (this.isVoted(election.voted)) {
            votable = false;
            text = "已投票";
          }
          else if (this.isVotable(election.voters)) {
            votable = true;
            text = "參與投票";
          }
          else {
            votable = false;
            text = "你不是選民";
          }

          const chartData = {
            labels: [...election.choices, "廢票"],
            datasets: [{
              data: election.choices.map((choice, idx) => {
                return countVote(idx, election.ballots);
              }).concat(countVote(-1, election.ballots)),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#ffffff',
                '#DDDDDD',
                '#FFFF99',
                '#FFCCCC',
                '#A6CAF0',
                '#F5DEB3',
                '#9999ff'
              ],
              hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#ffffff',
                '#DDDDDD',
                '#FFFF99',
                '#FFCCCC',
                '#A6CAF0',
                '#F5DEB3',
                '#9999ff'
              ]
            }]
          };

          return (
            <div className="election-card">
              <div className="election-title">
                <h3>{election.title}</h3>
                <div className="election-description">
                  {election.body}
                </div>
              </div>
              <br />

              <div className="election-body">
                {
                  (election.state === "CLOSE" || election.state === "COMMIT")
                    ? null
                    : <div className="chart" style={{ display: 'block' }}>
                      <h6>result chart</h6>
                      <Doughnut data={chartData} />
                    </div>
                }
                <br />
                <div className="election-choices">
                  <span className="election-info">這個選舉有以下這些選項：</span><br />
                  {election.choices.map((choice, idx) => {
                    return (<React.Fragment key={idx}>
                      <div className="aChoice">{idx + 1}. {choice} ({countVote(idx, election.ballots)}) </div>
                      <br />
                    </React.Fragment>)
                  })}
                  <div className="aChoice">{`${election.choices.length + 1}. 廢票 (${countVote(-1, election.ballots)})`}</div>
                </div><br /><br />
                <div className="election-info">
                  已有<em>{election.voted.length}/{election.voters.length}</em>人投下選票<br />
                  已有<em>{election.openings.length}/{election.commitments.length}</em>張選票開出<br /><br />
                  投票{(election.state === "END" || election.state === "CLOSE") ? text : "進行中"}
                </div><br />
                {
                  this.state.toggled
                    ?
                    <VoteForm stage={election.state} choices={election.choices} electionId={this.props.electionId} />
                    :
                    (election.state === "END" || election.state === "CLOSE")
                      ? null : <Button color="primary" style={{ marginBottom: '0.5em' }} disabled={!votable} onClick={this.toggle}>{text}</Button>
                }
                <br />
                <Button color="info" disabled={election.state === "CLOSE"} onClick={this.commitmentToggle} >
                  {this.state.commitmentToggled ? "關閉" : "查看選票"}
                </Button>
                {
                  this.state.commitmentToggled
                    ?
                    <div style={{ wordBreak: 'break-word', width: '40vw' }}>
                      {
                        (election.commitments.length === 0)
                          ? (<div>
                            還沒有人投票喔<br />
                            趕快去投票！<br />
                          </div>)
                          : <div>
                            <font style={{ fontSize: '10pt' }}>這些數字是選票的SHA3-512值，可以讓您驗證選票有沒有被竄改 :) <br /></font>
                            {election.commitments.map((_commitment, idx) => {
                              return (<React.Fragment key={_commitment.id}>
                                <span >{idx + 1}. {_commitment.commitment} </span>
                                <div style={{ display: 'block', height: '0.4em' }}></div>
                                <br />
                              </React.Fragment>);
                            })
                            }</div>
                      }
                    </div>
                    :
                    null
                }
                <div style={{ display: 'block', height: '0.4em' }}></div>
                {(election.state === "CLOSE" || election.state === "COMMIT") ?
                  null :
                  <React.Fragment>
                    <Link to={`/verify/${this.props.electionId}`}>
                      <Button color="success">驗票</Button>
                    </Link>
                    <div style={{ display: 'block', height: '0.4em' }}></div>
                  </React.Fragment>
                }
                {
                  (localStorage['uid'] === election.creator.id) ?
                    (
                      <React.Fragment>
                        {election.state !== "END" ? <Update electionId={election.id} type="twoStageElection" open={election.open} state={election.state} /> : null}
                        {/* the div below is for UI setting */}
                        {election.state !== "END" ? <div style={{ height: '0.4em', display: 'block' }} ></div> : null}
                        <Delete electionId={election.id} type={election.type} />
                      </React.Fragment>
                    ) :
                    null
                }
                <br />
                {this.state.alert ? <Alert color="danger">This election has been deleted!</Alert> : null}
              </div>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default twoStageVote;