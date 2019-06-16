import { gql } from 'apollo-boost'

export const ELECTION_SUBSCRIPTION = gql`
  subscription {
    elections {
      mutation
      electionId
      data {
        id
        title
        body
        open
        creator {
          id
          name
        }
        voters {
          id
          name
        }
      }
    }
  }
`

export const BALLOTS_SUBSCRIPTION = gql`
  subscription ballot_subscription($electionId: ID!) {
    ballots(electionId: $electionId) {
      mutation
      data {
        id
        election
        choice
      }
    }
  }
`