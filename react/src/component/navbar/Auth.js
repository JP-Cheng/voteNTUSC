import React from 'react'
import { Query } from 'react-apollo'
import { ME_QUERY } from '../../graphql'
import { Link } from 'react-router-dom'
import {
    Nav,
    NavItem
} from 'reactstrap'
import classes from './Auth.module.css'

let _refetch = null;

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
  if(_refetch) _refetch();
  return (
    <Nav className="ml-auto" navbar>
      <Query query={ME_QUERY}>
        {({data, error, refetch}) => {
          _refetch = refetch;
          if(error) {
            return notLoggedIn;
          }
          const name = (data&&data.me)?data.me.name:"";
          const id = (data&&data.me)?data.me.id:"";
          if(data&&data.me) localStorage.setItem('uid', data.me.id);
          return (
            <React.Fragment>
              <NavItem className={classes.item}>
                  Hello, <Link to={`/user/${id}`}>{name}</Link>
              </NavItem>
              <NavItem className={classes.item}>
                <Link to="/redirect" onClick={() => {
                    localStorage.setItem('token', '');
                    localStorage.setItem('uid', '');
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