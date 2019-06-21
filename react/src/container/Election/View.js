import React from 'react'
import { Query } from 'react-apollo'
import { Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { ELECTIONS_QUERY } from '../../graphql/index'

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
        {({data, loading, error}) => {
          if(loading) return <h1>Loading...</h1>;
          if(error) { 
            console.error(error);
            return <h1>Something went wrong...</h1>;
          }
          if(data) {
            return data.elections.map(election => electionBlock(election));
          }
        }}
      </Query>
    )
  }
}

export default View;