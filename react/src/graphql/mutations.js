import { gql } from 'apollo-boost'

const REGISTER_MUTATION = gql`
  mutation createUser(
    $name: String!
    $email: String!
    $pwd: String!
  ) {
    createUser(name: $name, email: $email, pwd: $pwd) {
      id
      name
      email
    }
  }
`

const DELETE_USER_MUTATION = gql`
mutation {
  deleteUser {
    id name email
  }
}
`
const UPDATE_USER_MUTATION = gql`
mutation updateUser($name: String, $email: String, $pwd: String) {
  updateUser(name: $name, email: $email, pwd: $pwd) {
    id name email
  }
}
`

const CREATE_ELECTION_MUTATION = gql`
mutation createElection($title: String!, $body: String!, $open: Boolean!, $voters: [ID!]!) {
  createElection(data: {title: $title, body: $body, open: $open, voters: $voters}) {
    id title body open 
    creator {
      id name
    } 
    ballots {
      id
    } 
    voters {
      id
    }
    voted {
      id
    }
  }
}
`

const DELETE_ELECTION_MUTATION = gql`
mutation deleteElection($id: ID!) {
  deleteElection(id: $id) 
}
`

const UPDATE_ELECTION_MUTATION = gql`
mutation updateElection($id: ID!, $title: String, $body: String, $open: Boolean, $voters: [ID!]) {
  updateElection(id: $id, data: {title: $title, body: $body, open: $open, voters: $voters}) {
    id title body open
    creator {
      id
    }
    ballots {
      id
    }
    voters {
      id
    }
    voted {
      id
    }
  }
}
`

const CREATE_BALLOT_MUTATION = gql`
mutation createBallot($electionId: ID!, $choice: Int!) {
  createBallot(data: {electionId: $electionId, choice: $choice}) {
    id 
    choice 
    election {
      id
    }
  }
}
`

const LOGIN_MUTATION = gql`
  mutation login(
    $email: String!
    $pwd: String!
  ) {
    login(email: $email, pwd: $pwd) {
      token
    }
  }
`

export { 
  REGISTER_MUTATION, DELETE_USER_MUTATION, UPDATE_USER_MUTATION,
  CREATE_ELECTION_MUTATION, DELETE_ELECTION_MUTATION, UPDATE_ELECTION_MUTATION,
  CREATE_BALLOT_MUTATION, 
  LOGIN_MUTATION  
}