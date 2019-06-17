import React from 'react'
import { Query } from 'react-apollo'
import { ME_QUERY } from '../../graphql'
import { Link } from 'react-router-dom'
import {
    Nav,
    NavItem
} from 'reactstrap'
import classes from './Auth.module.css'

const notLoggedIn = (
  <Nav className="ml-auto" navbar>
    <NavItem className={classes.item}>
        <Link to="/login">Login</Link>
    </NavItem>
    <NavItem className={classes.item}>
        <Link to="/register">Register</Link>
    </NavItem>
  </Nav>
);

const loggedIn = () => {
  return (
    <Nav className="ml-auto" navbar>
      <Query query={ME_QUERY}>
        {({data}) => {
          const name = (data&&data.me)?data.me.name:""
          return (
            <React.Fragment>
              <NavItem className={classes.item}>
                  Hello, <Link to="/user">{name}</Link>
              </NavItem>
              <NavItem className={classes.item}>
                <Link to="/redirect" onClick={() => {
                    console.log("Logged out");
                    localStorage.setItem('token', '');              
                }}>
                  Logout
                </Link>
              </NavItem>
            </React.Fragment>
          )
        }}
      </Query>
    </Nav>
  )
}

const Auth = () => {
  return(
    <React.Fragment>
      {
        localStorage['token']
        ?
          loggedIn()
        :
          notLoggedIn
      }
    </React.Fragment>
  )
}

export default Auth