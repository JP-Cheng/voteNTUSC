import React from 'react'
import { Mutation, Query } from 'react-apollo'
import {
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert
} from 'reactstrap'
import { NavLink } from 'react-router-dom'
import { CREATE_ELECTION_MUTATION, USERS_QUERY } from '../../graphql'

const CreateElection = props => {
  let title, body, open;
  let choices = [],  voters = [];
  return (
    <Mutation mutation={CREATE_ELECTION_MUTATION}>
      {(createElection, { data, error }) => {
        return (
          <Form 
            onSubmit={e => {
              e.preventDefault();
              createElection({variables: {title: title, body: body, choices: choices, open: open, voters: voters}});
            }}
          >
            {error?<Alert color="danger">Create Election Fail!</Alert>:null}
            {(data && data.createElection)?<Alert color={`/success/${data.createElection.id}`}>Create election success! <NavLink to="/vote">View your election now!</NavLink></Alert>:null}
            <FormGroup>
              <Label for="electionTitle">Title</Label>
              <Input type="text" name="name" required={true} id="electionTitle" onChange={e => {title = e.target.value}} />
            </FormGroup><br />
            <FormGroup>
              <Label for="electionBody">Description</Label>
              <Input type="textarea" name="description" required={true} id="electionBody" onChange={e => {body = e.target.value}} />
            </FormGroup><br />
            <Button type="submit" color="primary">
              Create
            </Button>
          </Form>
      )}}
    </Mutation>
  )
}

export default CreateElection;