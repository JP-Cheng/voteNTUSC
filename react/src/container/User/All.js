import React from 'react'
import { Query } from 'react-apollo'
import {
  Alert, Card, CardGroup,
  CardTitle
} from 'reactstrap'
import { NavLink } from 'react-router-dom'
import { USERS_QUERY } from '../../graphql'
import './user.css'

const AllUser = () => {
  return (
    <div className="user-list">
      <h2 className="user-list-title">All Users</h2>
      <Query query={USERS_QUERY}>
        {({ data, loading, error }) => {
          if (loading || !(data.users)) return <h1>Loading...</h1>;
          if (error) return <Alert color="danger">Loading User Error!</Alert>;
          return (
            <CardGroup>
              {data.users.map((user, idx) => {
                return (
                  <NavLink to={`/user/${user.id}`}>
                    <Card className="user-card">
                      <CardTitle style={{ fontSize: '18pt', padding: '0.5em', margin: '0pt' }}>
                        {user.name}
                      </CardTitle>

                    </Card>
                  </NavLink>
                )
              })}
            </CardGroup>);
        }}
      </Query>
    </div>
  )
}

export default AllUser;