import React from 'react'
import { Query } from 'react-apollo'
import {Alert} from 'reactstrap'
import { ELECTION_QUERY } from '../../graphql'
import { Create } from '../Election'

const Edit = (props) => {
  return (
    <Query query={ELECTION_QUERY} variables={{electionId: props.id}}>
      {({data, loading, error}) => {
        if(loading || (data && !(data.election))) return <h1>Loading...</h1>;
        if(error) return <Alert color='danger'>No election found!</Alert>

        return (
          <Create
            new={false}
            id={data.election.id}
            title={data.election.title}
            body={data.election.body}
            choices={data.election.choices}
            open={data.election.open}
            voters={data.election.voters}
          />
        )
      }}
    </Query>
  )
}

export default Edit;