import React from 'react'
import { Query } from 'react-apollo'
import { Alert } from 'reactstrap'
import { USER_QUERY, ELECTION_SUBSCRIPTION } from '../../graphql'
import ElectionTabs from './ElectionTabs'
import './user.css'

const find = (array, element) => {
  return array.findIndex(_element => _element.id === (typeof element === 'string' ? element : element.id));
}

const check_new_then_push = (array, element) => {
  if (find(array, element) !== -1) {
    return array;
  }
  else {
    array.push(element);
    return array;
  }
}

const check_exist_then_pop = (array, element) => {
  const idx = find(array, element);
  if (idx !== -1) array.splice(idx, 1);
  return array;
}

const check_exist_then_replace = (array, element) => {
  const idx = find(array, element);
  if (idx !== -1) array[idx] = element;
  return array;
}

let _refetch = null;

const Profile = (props) => {
  if (_refetch) _refetch();
  return (
    <div className="user-list">
      <Query query={USER_QUERY} variables={{ uid: props.uid }}>
        {({ data, loading, error, subscribeToMore, refetch }) => {
          _refetch = refetch;
          if (loading || (data && !(data.user))) return <h1>Loading...</h1>;
          if (error) return <Alert color="danger">Loading User Profile Error!</Alert>;
          /*
          subscribeToMore({
            document: ELECTION_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
              if (!(subscriptionData.data)) return prev
              else {
                const newData = subscriptionData.data.elections.data;
                const deletedId = subscriptionData.data.elections.electionId;
                const mutation = subscriptionData.data.elections.mutation;
                if (mutation === "DELETED") {
                  if (find(prev.user.createdElections, deletedId) !== -1) prev.user.createdElections = check_exist_then_pop(prev.user.createdElections, deletedId);
                  prev.user.voteableElections = check_exist_then_pop(prev.user.voteableElections, deletedId);
                  prev.user.votedElections = check_exist_then_pop(prev.user.votedElections, deletedId);
                }
                else if (mutation === "CREATED") {
                  if (props.uid === newData.creator.id) prev.user.createdElections = check_new_then_push(prev.user.createdElections, newData);
                  if (find(newData.voters, props.uid) !== -1) prev.user.voteableElections = check_new_then_push(prev.user.voteableElections, newData);
                }
                else if (mutation === "UPDATED") {
                  if (props.uid === newData.creator.id) prev.user.createdElections = check_exist_then_replace(prev.user.createdElections, newData);
                  if (find(newData.voters, props.uid) !== -1) prev.user.voteableElections = check_exist_then_replace(prev.user.voteableElections, newData);
                  if (find(newData.voted, props.uid) !== -1) prev.user.votedElections = check_new_then_push(prev.user.votedElections, newData); // Must be new ballot
                }
                return prev;
              }
            }
          })
          */

          return (
            <React.Fragment>
              <div className="header" >
                <h2 className="user-list-title">{`${data.user.name}`}</h2>
                <a href={"mailto:" + `${data.user.email}`}><span>{`${data.user.email}`}</span></a>
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