import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { ELECTION_QUERY, BALLOTS_SUBSCRIPTION, CREATE_BALLOT_MUTATION } from '../../graphql/index'
import { Button, Alert } from 'reactstrap'

const countVote = (id, ballots) => ballots.filter(ballot => ballot.choice === id).length;

class VoteForm extends React.Component {
  constructor(props) {
    super(props);
    this.createBallot = null;
  }

  handleVote = e => {
    e.preventDefault();
    const choice = parseInt(e.target.id);
    if(this.createBallot) {
      this.createBallot({variables: {electionId: this.props.electionId, choice: choice}});
    }
  }

  isVoted = voted => {
    if(voted.find(({id}) => id === localStorage.uid)) return true;
    else return false;
  }

  render() {
    if(localStorage.uid && this.isVoted(this.props.voted)) return <strong>Thank you for your vote!</strong>;
    else if(!(localStorage.uid)) return <strong>Please login to vote.</strong>;
    else return (
      <Mutation mutation={CREATE_BALLOT_MUTATION}>
        {(createBallot, { data, error }) => {
          this.createBallot = createBallot;
          if(data && data.createBallot) return <strong>Thank You for your vote!</strong>;
          if(error) return <Alert color='danger'>Create ballot fail!</Alert>;
          
          return (
            <div className="election-ballot">
              投下神聖的一票：<br />
              {this.props.choices.map((choice, idx) => {
                return <Button color="info" id={idx} key={idx} onClick={this.handleVote}>{idx+1}. {choice}</Button>
              })}
              <Button color="danger" id={-1} key={-1} onClick={this.handleVote}>投廢票</Button>
              <br />
            </div>
          )
        }}
      </Mutation>
    )
  }
}

class Vote extends React.Component {

  render() {
    return (
      <Query query={ELECTION_QUERY} variables={{electionId: this.props.electionId}}>
      {({data, loading, error, subscribeToMore}) => {
        if(loading || !(data.election)) return <h1>Loading...</h1>;
        if(error) return <h1>Error!</h1>;
        subscribeToMore({
          document: BALLOTS_SUBSCRIPTION,
          variables: {electionId: data.election.id},
          updateQuery: (prev, {subscriptionData}) => {
            if(!(subscriptionData.data) || subscriptionData.data.ballots.mutation !== 'CREATED') return prev;
            else {
              if(data.election.ballots.findIndex(ballot => {
                return ballot.id === subscriptionData.data.ballots.data.id;
              }) !== -1) return prev;
              prev.election.ballots.push(subscriptionData.data.ballots.data);
              return prev;
            }
          }
        })
        return (
          <div>
            <h1>{data.election.title}</h1>
            <div className="election-description">
              {data.election.body}
            </div><br />
            <div className="election-choices">
              這個選舉有以下這些選項：<br />
              {data.election.choices.map((choice, idx) => {
                return <span key={idx}>{idx+1}. {choice}</span>
              })}
            </div><br />
            <div className="election-info">
              共有{data.election.voters.length}人可以投票<br />
              已有{data.election.ballots.length}人投下選票<br />
              目前票數統計：<br />
              {data.election.choices.map((choice, idx) => {
                return `${idx+1}. ${choice}: ${countVote(idx, data.election.ballots)}票 `
              })}
              {`${data.election.choices.length+1}. 廢票: ${countVote(-1, data.election.ballots)}票`}
            </div><br />
            <VoteForm voted={data.election.voted} choices={data.election.choices} electionId={this.props.electionId} />
          </div>
        )
      }}
      </Query>
    )
  }
}

export default Vote;