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

const CREATE_GENERAL_ELECTION_MUTATION = gql`
mutation createGeneralElection( $type: String!, $title: String!, $body: String!, $choices: [String!]!, $open: Boolean!, $voters: [ID!]!){
  createGeneralElection(data: {type: $type, title: $title, body: $body, choices: $choices, open: $open, voters: $voters}) {
    type
    simpleElection {
      id title body choices open 
      creator { id name } 
      ballots { id } 
      voters { id }
      voted { id }
    }
    twoStageElection {
      id title body choices state 
      creator { id name } 
      ballots { id } 
      voters { id }
      voted { id }
    }
  }
}
`

const DELETE_ELECTION_MUTATION = gql`
mutation deleteElection($id: ID!) {
  deleteElection(id: $id) 
}
`

const DELETE_TWO_STAGE_ELECTION_MUTATION = gql`
mutation deleteTwoStageElection($id: ID!) {
  deleteTwoStageElection(id: $id)
}
`

const UPDATE_ELECTION_MUTATION = gql`
mutation updateElection($id: ID!) {
  updateElection(id: $id) {
    id
  }
}
`

const UPDATE_TWO_STAGE_ELECTION_MUTATION = gql`
mutation updateTwoStageElection($id: ID!) {
  updateTwoStageElection(id: $id) {
    id
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

const CREATE_COMMITMENT_MUTATION = gql`
mutation createCommitment($twoStageElectionId: ID!, $commitment: String!) {
  createCommitment(data: {twoStageElectionId: $twoStageElectionId, commitment: $commitment}) {
    id
    commitment
  }
}
`

const CREATE_OPENING_MUTATION = gql`
mutation createOpening($twoStageElectionId: ID!, $hashedSecret: String!, $choice: Int!) {
  createOpening(data: {twoStageElectionId: $twoStageElectionId, hashedSecret: $hashedSecret, choice: $choice}) {
    id
    hashedSecret
    hashedChoice
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
  CREATE_GENERAL_ELECTION_MUTATION,
  UPDATE_ELECTION_MUTATION, UPDATE_TWO_STAGE_ELECTION_MUTATION,
  DELETE_ELECTION_MUTATION, DELETE_TWO_STAGE_ELECTION_MUTATION,
  CREATE_BALLOT_MUTATION, CREATE_COMMITMENT_MUTATION, CREATE_OPENING_MUTATION,
  LOGIN_MUTATION  
}