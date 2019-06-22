import React from 'react'
import { Query } from 'react-apollo'
import { Alert } from 'reactstrap'
//import { NavLink } from 'react-router-dom'
import { USER_QUERY } from '../../graphql'
import ElectionTabs from './ElectionTabs'
import './user.css'



const Profile = (props) => {
  return (
    <div className="user-list">
      <Query query={USER_QUERY} variables={{uid: props.uid}}>
        {({data, loading, error}) => {
          if(loading || (data && !(data.user))) return <h1>Loading...</h1>;
          if(error) return <Alert color="danger">Loading User Profile Error!</Alert>;

          return (
            <React.Fragment>
              <h1>{`${data.user.name}`}</h1>
              <span>{`${data.user.email}`}</span>
              <ElectionTabs 
                createdElections={data.user.createdElections}
                voteableElections={data.user.voteableElections}
                votedElections={data.user.votedElections}
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