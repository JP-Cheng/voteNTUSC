import { gql } from 'apollo-boost'

export const ALL_ELECTIONS_SUBSCRIPTION = gql`
  subscription {
    allElections {
      mutation
      type
      electionId
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

export const ELECTION_SUBSCRIPTION = gql`
  subscription election($electionId: ID!) {
    election(electionId: $electionId) {
      mutation
      data {
        id title body open choices
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

export const TWO_STAGE_ELECTION_SUBSCRIPTION = gql`
  subscription twoStageElection($electionId: ID!) {
    twoStageElection(electionId: $electionId) {
      mutation
      data {
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