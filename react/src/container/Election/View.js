import React from 'react'
import { Query } from 'react-apollo'
import {
  CardGroup, Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from 'reactstrap'
import { Link } from 'react-router-dom'
import { ALL_ELECTIONS_QUERY, ELECTION_SUBSCRIPTION } from '../../graphql/index'
import './Vote.css'

const electionBlock = ({ id, type, title, body, creator }) => {
  return (
    // .css don't work here; please use inline css
    <Card key={id} style={{
      width: '20em', height: '14em', margin: '0.5em',
      border: '1pt solid  rgba(218, 212, 212, 0.4)',
      textAlign: 'left', padding: '0.2em 1em 0.2em 1em'
    }}>
      <CardBody>
        <CardTitle>
          {(title.length > 28) ? (title.substring(0, 27) + '...') : (title)}
        </CardTitle>
        <br />
        <CardSubtitle>
          Creator: {creator ? creator.name : "None"}
        </CardSubtitle>
        <CardText>
          Description: {(body.length > 9) ? (body.substring(0, 8) + '...') : (body)}
          <br />
          <i style={{color: "gray"}}>{type}</i>
        </CardText>
        <Link to={`/vote/${(type === "simpleElection") ? "simple" : "twoStage"}/${id}`}><Button color="success">View</Button></Link>
      </CardBody>
    </Card>
  )
}

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: ""
    }
  }

  render() {
    return (
      <Query query={ALL_ELECTIONS_QUERY}>
        {({ data, loading, error, subscribeToMore }) => {
          if (loading || !(data.allElections)) return <h1>Loading...</h1>;
          if (error) {
            console.error(error);
            return <h1>Something went wrong...</h1>;
          }
          /*
          subscribeToMore({
            document: ELECTION_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
              if (!(subscriptionData.data)) return prev;
              else if (subscriptionData.data.elections.mutation === 'CREATED') {
                if (prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.data.id;
                }) !== -1) return prev;
                else prev.elections.push(subscriptionData.data.elections.data);
                return prev;
              }
              else if (subscriptionData.data.elections.mutation === 'UPDATED') {
                const idx = prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.data.id;
                })
                if (idx !== -1) prev.elections[idx] = subscriptionData.data.elections.data;
                return prev
              }
              else if (subscriptionData.data.elections.mutation === 'DELETED') {
                const idx = prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.electionId;
                })
                if (idx !== -1) prev.elections.splice(idx, 1);
                return prev;
              }
            }
          })
          */
          return (
            <React.Fragment>
              <h2 className="all-elections-title">All Elections</h2>
              <CardGroup>
              {data.allElections.map(election => {
                if(election.type === "simpleElection") return electionBlock({type: election.type, ...election.simpleElection});
                else return electionBlock({type: election.type, ...election.twoStageElection});
              })}
              </CardGroup>
            </React.Fragment>
          );
        }}
      </Query>
    )
  }
}

export default View;