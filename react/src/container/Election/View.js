import React from 'react'
import { Query } from 'react-apollo'
import { Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { ELECTIONS_QUERY, ELECTION_SUBSCRIPTION } from '../../graphql/index'

const electionBlock = ({id, title, body, creator, open}) => {
  return (
    <Card key={id}>
      <CardBody>
        <CardTitle>
          {title}
        </CardTitle>
        <br />
        <CardSubtitle>
          Creator: {creator?creator.name:"None"}
        </CardSubtitle>
        <CardText>
          Description: {body}
        </CardText>
        <Link to={"/vote/"+id}><Button color="success" disabled={!open}>View</Button></Link>
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
      <Query query={ELECTIONS_QUERY}>
        {({data, loading, error, subscribeToMore}) => {
          if(loading || !(data.elections)) return <h1>Loading...</h1>;
          if(error) { 
            console.error(error);
            return <h1>Something went wrong...</h1>;
          }
          subscribeToMore({
            document: ELECTION_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
              if(!(subscriptionData.data)) return prev;
              else if(subscriptionData.data.elections.mutation === 'CREATED') {
                if(prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.data.id;
                }) !== -1) return prev;
                else prev.elections.push(subscriptionData.data.elections.data);
                return prev;
              }
              else if(subscriptionData.data.elections.mutation === 'UPDATED') {
                const idx = prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.data.id;
                })
                if(idx !== -1) prev.elections[idx] = subscriptionData.data.elections.data;
                return prev
              }
              else if(subscriptionData.data.elections.mutation === 'DELETED') {
                const idx = prev.elections.findIndex(election => {
                  return election.id === subscriptionData.data.elections.electionId;
                })
                if(idx !== -1) prev.elections.splice(idx, 1);
                return prev;
              }
            }
          })
          return data.elections.map(election => electionBlock(election));
          
        }}
      </Query>
    )
  }
}

export default View;