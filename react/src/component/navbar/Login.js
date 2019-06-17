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

class LoginForm extends React.Component {
  render() {
    let email, pwd;
    return (
      <Mutation mutation={LOGIN_MUTATION}>
      {(login, { data, error }) => {
        if(data && data.login) {
            localStorage.setItem('token', data.login.token);
            return <Redirect to="/redirect" />;
        }
        return (
          <Form 
            className={classes.form}
            onSubmit={e => {
                e.preventDefault();
                login({variables: { email: email, pwd: pwd}});
            }}
          >
            {error?<Alert color="danger">Login Fail!</Alert>:null}
            <FormGroup>
                <Label for="userEmail">Email</Label>
                <Input type="email" name="email" required={true} id="userEmail" onChange={e => {email = e.target.value}} />
            </FormGroup>
            <FormGroup>
                <Label for="userPassword">Password</Label>
                <Input type="password" name="password" required={true} id="userPassword" onChange={e => {pwd = e.target.value}} />
            </FormGroup>
            <Button type="submit" color="primary">
                Login
            </Button>
          </Form>
      )}}
    </Mutation>
    )
  }
}

export default LoginForm;