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
  }
`

export const BALLOTS_SUBSCRIPTION = gql`
  subscription ballot_subscription($electionId: ID!) {
    ballots(electionId: $electionId) {
      mutation
      data {
        id
        choice
      }
    }
  }
`