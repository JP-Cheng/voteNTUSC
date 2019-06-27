import React from 'react'
import { Query } from 'react-apollo'
import {
  Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button,
  Spinner
} from 'reactstrap'
import { Link } from 'react-router-dom'
import { ALL_ELECTIONS_QUERY, ALL_ELECTIONS_SUBSCRIPTION } from '../../graphql/index'
import './Vote.css'

const findGeneral = (generalElections, element) => {
  let id = element;
  if(typeof element !== 'string') {
    if(element.simpleElection) id = element.simpleElection.id;
    else id = element.twoStageElection.id;
  }
  return generalElections.findIndex(generalElection => {
    const simple = generalElection.type === "simpleElection";
    const generalId = simple?generalElection.simpleElection.id:generalElection.twoStageElection.id;
    return generalId === id;
  })
}

const electionBlock = ({ id, type, title, body, creator }) => {
  return (
    // .css don't work here; please use inline css
    <Card key={id} style={{
      width: '20em', height: '14em', margin: '0.5em',
      border: '1pt solid  rgba(218, 212, 212, 0.4)',
      textAlign: 'left', padding: '0.2em 1em 0.2em 1em',
      display: 'inline-block'
    }}>
      <CardBody>
        <CardTitle>
          {(title.length > 14) ? (title.substring(0, 13) + '...') : (title)}
        </CardTitle>
        <br />
        <CardSubtitle>
          Creator: {creator ? creator.name : "None"}
        </CardSubtitle>
        <CardText>
          Description: {(body.length > 9) ? (body.substring(0, 8) + '...') : (body)}
          <br />
          <i style={{ color: "gray" }}>{type}</i>
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
          if (loading || !(data.allElections)) return <Spinner color="primary" />;
          if (error) {
            console.error(error);
            return <h1>Something went wrong...</h1>;
          }

          subscribeToMore({
            document: ALL_ELECTIONS_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
              if (!(subscriptionData.data)) return prev;
              else if (subscriptionData.data.allElections.mutation === 'CREATED') {
                if(findGeneral(prev.allElections, subscriptionData.data.allElections.electionId) !== -1) return prev;
                else prev.allElections.push(subscriptionData.data.allElections);
                return prev;
              }
              else if (subscriptionData.data.allElections.mutation === 'DELETED') {
                const idx = findGeneral(prev.allElections, subscriptionData.data.allElections.electionId);
                if (idx !== -1) prev.allElections.splice(idx, 1);
                return prev;
              }
            }
          })
          
          return (
            <React.Fragment>
              <h2 className="user-list-title">All Elections</h2>
              <div style={{
                overflowX: 'scroll', height: '55vh', width: '60vw', display: 'flow',
                textAlign: 'center'
              }}>
                {data.allElections.map(election => {
                  if (election.type === "simpleElection") return electionBlock({ type: election.type, ...election.simpleElection });
                  else return electionBlock({ type: election.type, ...election.twoStageElection });
                })}
              </div>
            </React.Fragment>);

        }}
      </Query>
    )
  }
}

export default View;