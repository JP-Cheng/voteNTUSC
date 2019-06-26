import { gql } from 'apollo-boost'

const USERS_QUERY = gql`
  query users($query: String) {
    users(query: $query) {
      id
      name
      email
      createdElections {
        id title body open
      }
      voteableElections {
        id title body open
      }
      votedElections {
        id title body open
      }
    }
  }
`

const USER_QUERY = gql`
  query user($uid: ID!) {
    user(uid: $uid) {
      id name email
      createdGeneralElections {
        type
        simpleElection {
          id title body open
          creator { id name }
        }
        twoStageElection {
          id title body state
          creator { id name }
        }
      }
      votableGeneralElections {
        type
        simpleElection {
          id title body open
          creator { id name }
        }
        twoStageElection {
          id title body state
          creator { id name }
        }
      }
      votedGeneralElections {
        type
        simpleElection {
          id title body open
          creator { id name }
        }
        twoStageElection {
          id title body state
          creator { id name }
        }
      }
    }
  }
`

const ALL_ELECTIONS_QUERY = gql`
  query allElections($query: String) {
    allElections(query: $query) {
      type
      simpleElection {
        id title body open choices
        creator { id name }
        ballots { id choice }
        voters { id name }
        voted { id name }
      }
      twoStageElection {
        id title body state choices
        creator { id name }
        commitments { id commitment }
        openings { id hashedChoice hashedSecret }
        ballots { id choice }
        voters { id name }
        voted { id name }
      }
    }
  }
`

const ELECTIONS_QUERY = gql`
  query elections($query: String) {
    elections(query: $query) {
      id
      title
      body
      open
      choices
      creator {
        id name
      }
      ballots {
        id choice
      }
      voters {
        id name
      }
      voted {
        id name
      }
    }
  }
`

const ELECTION_QUERY = gql`
  query election($electionId: ID!) {
    election(electionId: $electionId) {
      id
      title
      body
      open
      choices
      creator {
        id name
      }
      ballots {
        id choice
      }
      voters {
        id name
      }
      voted {
        id name
      }
    }
  }
`

const TWO_STAGE_ELECTION_QUERY = gql`
query twoStageElection($query: ID!) {
  twoStageElection(query: $query) {
    id title body state choices
    creator { id name }
    commitments { id commitment }
    openings { id hashedChoice hashedSecret }
    ballots { id choice }
    voters { id name }
    voted { id name }
  }
}
`

const BALLOTS_QUERY = gql`
  query ballots($electionId: ID!) {
    ballots(electionId: $electionId) {
      id
      choice
    }
  }
`

const BALLOT_QUERY = gql`
  query ballot($ballotId: ID!) {
    ballot(ballotId: $ballotId) {
      id
      choice
    }
  }
`

const ME_QUERY = gql`
  query {
    me {
      id
      name
      email
      createdElections {
        id title body
      }
      voteableElections {
        id title body
      }
      votedElections {
        id title body
      }
    }
  }
`

export { 
  USERS_QUERY, USER_QUERY, 
  ALL_ELECTIONS_QUERY, ELECTIONS_QUERY, ELECTION_QUERY, TWO_STAGE_ELECTION_QUERY,
  BALLOTS_QUERY, BALLOT_QUERY, 
  ME_QUERY }