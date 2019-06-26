import React from 'react'
import { Mutation } from 'react-apollo'
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert
} from 'reactstrap'
import { Redirect } from 'react-router-dom'
import classes from './Auth.module.css'
import { LOGIN_MUTATION } from '../../graphql'

const errHandler = error => {
  if(error && error.message) {
    const msg = error.message;
    if(msg.search("Invalid password") !== -1) return "Wrong password!";
    if(msg.search("Invalid email") !== -1) return "Wrong email!";
  }
  return "Login failed!"
}

class LoginForm extends React.Component {
  render() {
    let email, pwd;
    return (
      <Mutation mutation={LOGIN_MUTATION}>
        {(login, { data, error }) => {
          if (data && data.login) {
            localStorage.setItem('token', data.login.token);
            return <Redirect to="/redirect" />;
          }
          return (
            <Form
              className={classes.form}
              onSubmit={e => {
                e.preventDefault();
                login({ variables: { email: email, pwd: pwd } });
              }}
            >

              <FormGroup>
                <Label for="userEmail">Email</Label>
                <Input type="email" name="email" required={true} id="userEmail" onChange={e => { email = e.target.value }} />
              </FormGroup>
              <br />
              <FormGroup>
                <Label for="userPassword">Password</Label>
                <Input type="password" name="password" required={true} id="userPassword" onChange={e => { pwd = e.target.value }} />
              </FormGroup>
              <br />
              <Button type="submit" color="primary">
                Login
              </Button>
              <br />
              <br />
              {error ? <Alert color="danger">{errHandler(error)}</Alert> : null}
            </Form>
          )
        }}
      </Mutation>
    )
  }
}

export default LoginForm;