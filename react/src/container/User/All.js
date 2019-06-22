import React from 'react'
import { Query } from 'react-apollo'
import { Alert } from 'reactstrap'
import { NavLink } from 'react-router-dom'
import { USERS_QUERY } from '../../graphql'
import './user.css'

const AllUser = () => {
  return (
    <div className="user-list">
      <h1>All Users</h1>
      <Query query={USERS_QUERY}>
        {({data, loading, error}) => {
          if(loading || !(data.users)) return <h1>Loading...</h1>;
          if(error) return <Alert color="danger">Loading User Error!</Alert>;
          return data.users.map((user, idx) => {
            return (
              <div className="user-block" key={user.id}>
                <span>{`${idx+1}. `}<NavLink to={`/user/${user.id}`}>{`${user.name}`}</NavLink></span>
                <span>{` ${user.email}`}</span>
              </div>
            )
          })
        }}
      </Query>
    </div>
  )
}

export default AllUser;