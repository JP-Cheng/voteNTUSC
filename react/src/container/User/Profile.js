import React from 'react'
import { Query } from 'react-apollo'
import { Alert } from 'reactstrap'
import { USER_QUERY, ALL_ELECTIONS_SUBSCRIPTION } from '../../graphql'
import ElectionTabs from './ElectionTabs'
import './user.css'

const find = (array, element) => {
  return array.findIndex(_element => _element.id === (typeof element === 'string'?element:element.electionId));
}

const findGeneral = (generalElections, element) => {
  let id = element;
  if(typeof element !== 'string') {
    if(element.simpleElection) id = element.simpleElection.id;
    else id = element.twoStageElection.id;
  }
  return generalElections.findIndex(generalElection => {
    const simple = generalElection.type === "simpleElection";
    const generalId = simple?generalElection.simpleElection.id:generalElection.twoStageElection.id;
    return generalId === id;
  })
}

const check_new_then_push = (array, element) => {
  if(findGeneral(array, element) !== -1) {
    return array;
  }
  else {
    array.push(element);
    return array;
  }
}

const check_exist_then_pop = (array, element) => {
  const idx = findGeneral(array, element);
  if(idx !== -1) array.splice(idx, 1);
  return array;
}

const check_exist_then_replace = (array, element) => {
  const idx = findGeneral(array, element);
  if(idx !== -1) array[idx] = element;
  return array;
}

const Profile = (props) => {
  return (
    <div className="user-list">
      <Query query={USER_QUERY} variables={{ uid: props.uid }}>
        {({ data, loading, error, subscribeToMore }) => {
          if (loading || (data && !(data.user))) return <h1>Loading...</h1>;
          if (error) return <Alert color="danger">Loading User Profile Error!</Alert>;

          subscribeToMore({
            document: ALL_ELECTIONS_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
              if(!(subscriptionData.data)) return prev
              else {
                const simpleElectionData = subscriptionData.data.allElections.simpleElection;
                const twoStageElectionData = subscriptionData.data.allElections.twoStageElection;
                const simple = subscriptionData.data.allElections.type === "simpleElection";
                const newData = simple?simpleElectionData:twoStageElectionData;
                const deletedId = subscriptionData.data.allElections.electionId;
                const mutation = subscriptionData.data.allElections.mutation;
                if(mutation === "DELETED") {
                  prev.user.createdGeneralElections = check_exist_then_pop(prev.user.createdGeneralElections, deletedId);
                  prev.user.voteableGeneralElections = check_exist_then_pop(prev.user.votableGeneralElections, deletedId);
                  prev.user.votedGeneralElections = check_exist_then_pop(prev.user.votedGeneralElections, deletedId);
                }
                else if(mutation === "CREATED") {
                  if(props.uid === newData.creator.id) prev.user.createdGeneralElections = check_new_then_push(prev.user.createdGeneralElections, subscriptionData.data.allElections);
                  if(find(newData.voters, props.uid) !== -1) prev.user.votableGeneralElections = check_new_then_push(prev.user.votableGeneralElections, subscriptionData.data.allElections);
                }
                else if(mutation === "UPDATED") {
                  if(props.uid === newData.creator.id) prev.user.createdGeneralElections = check_exist_then_replace(prev.user.createdGeneralElections, subscriptionData.data.allElections);
                  if(find(newData.voters, props.uid) !== -1) prev.user.votableGeneralElections = check_exist_then_replace(prev.user.votableGeneralElections, subscriptionData.data.allElections);
                  if(find(newData.voted, props.uid) !== -1) prev.user.votedGeneralElections = check_new_then_push(prev.user.votedGeneralElections, subscriptionData.data.allElections); // Must be new ballot
                }
                return prev;
              }
            }
          })

          return (
            <React.Fragment>
              <div className="header" >
                <h2 className="user-list-title">{`${data.user.name}`}</h2>
                <a href={`mailto:${data.user.email}`}><span>{`${data.user.email}`}</span></a>
              </div>
              <ElectionTabs
                createdGeneralElections={data.user.createdGeneralElections}
                votableGeneralElections={data.user.votableGeneralElections}
                votedGeneralElections={data.user.votedGeneralElections}
                uid={props.uid}
              />
            </React.Fragment>
          )
        }}
      </Query>
    </div>
  )
}

export default Profile;