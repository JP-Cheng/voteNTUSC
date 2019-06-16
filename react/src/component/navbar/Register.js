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
import { NavLink } from 'react-router-dom'
import classes from './Auth.module.css'
import { REGISTER_MUTATION } from '../../graphql'

const RegisterForm = props => {
  let email, pwd, name, age;
  return (
    <Mutation mutation={REGISTER_MUTATION}>
      {(createUser, { data, error }) => {
        return (
          <Form 
            className={classes.form}
            onSubmit={e => {
              e.preventDefault();
              createUser({variables: {name: name, email: email, pwd: pwd}});
            }}
          >
            {error?<Alert color="danger">Register Fail!</Alert>:null}
            {(data && data.createUser)?<Alert color="success">Register success! Go to login <NavLink to="/login">Login</NavLink></Alert>:null}
            <FormGroup>
              <Label for="userName">Name</Label>
              <Input type="text" name="name" required={true} id="userName" onChange={e => {name = e.target.value}} />
            </FormGroup>
            <FormGroup>
              <Label for="userEmail">Email</Label>
              <Input type="email" name="email" required={true} id="userEmail" onChange={e => {email = e.target.value}} />
            </FormGroup>
            <FormGroup>
              <Label for="userPassword">Password</Label>
              <Input type="password" name="password" required={true} id="userPassword" onChange={e => {pwd = e.target.value}} />
            </FormGroup><br />
            <Button type="submit" color="primary">
              Register
            </Button>
          </Form>
      )}}
    </Mutation>
  )
}

export default RegisterForm;