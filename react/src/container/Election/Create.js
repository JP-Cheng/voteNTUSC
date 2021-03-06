import React from 'react'
import { Mutation, Query } from 'react-apollo'
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row, Col,
  Spinner
} from 'reactstrap'
import { NavLink } from 'react-router-dom'
import { CREATE_GENERAL_ELECTION_MUTATION, USERS_QUERY } from '../../graphql'

const Choices = props => {
  return (
    <React.Fragment>
      {props.choices.map((choice, idx) => {
        return (
          <InputGroup key={`${idx}`}>
            <Input type="text" name="choice" required={true}
              id={`${idx}`} value={choice}
              onChange={props.changeHandler}
              placeholder="Choice description..." />
            <InputGroupAddon addonType="append">
              <Button id={`Button_${idx}`}
                onClick={props.removeHandler}>X
              </Button>
            </InputGroupAddon>
          </InputGroup>
        )
      })}
    </React.Fragment>
  )
}

const errHandler = error => {
  if (error && error.message) {
    const msg = error.message;
    if (msg.search("Title Already Exist") !== -1) return "Some election already used this title!";
    if (msg.search("Not Login") !== -1) return "Please login first!";
  }
  return "Create Election Fail!";
}

class CreateElection extends React.Component {
  constructor(props) {
    super(props);
    this.twoStage = false;
    this.title = null;
    this.body = null;
    this.open = false;
    this.users = [];
    this.state = {
      choices: [""],
      users: []
    };
  }

  handleChoiceInput = e => {
    const id = e.target.id, value = e.target.value;
    this.setState(state => {
      state.choices[parseInt(id)] = value;
      return state;
    })
  }
  addMoreChoice = _ => {
    this.setState(state => {
      state.choices.push("");
      return state;
    })
  }
  removeChoice = e => {
    const idx = parseInt(e.target.id.substring(7));
    if (this.state.choices.length === 1) return;
    this.setState(state => {
      state.choices.splice(idx, 1);
      return state;
    })
  }
  handleCheck = e => {
    const idx = parseInt(e.target.id.substring(6));
    const checked = e.target.checked;
    this.setState(state => {
      state.users[idx].included = checked;
      return state;
    })
  }
  getId = data => {
    if (!data.createGeneralElection) return;
    if (data.createGeneralElection.type === "simpleElection") {
      return data.createGeneralElection.simpleElection.id;
    }
    else return data.createGeneralElection.twoStageElection.id;
  }

  render() {
    return (
      <Mutation
        mutation={CREATE_GENERAL_ELECTION_MUTATION}>
        {(createElection, { data, error }) => {
          return (
            <Form
              onSubmit={e => {
                e.preventDefault();
                let voters = this.state.users.filter(user => user.included);
                voters = voters.map(voter => voter.id);
                createElection({
                  variables: {
                    type: this.twoStage
                      ? "twoStageElection"
                      : "simpleElection",
                    title: this.title, body: this.body,
                    choices: this.state.choices, open: this.open,
                    voters: voters
                  }
                })
              }}
            >
              <h2 className="user-list-title">Launch an Election</h2>
              <Row>
                <Col>
                  <FormGroup >
                    <Label for="electionTitle" ><b>Title</b></Label>
                    <Input type="text" name="name" required={true}
                      id="electionTitle" defaultValue={this.title}
                      onChange={e => { this.title = e.target.value }} />
                  </FormGroup><br />
                  <FormGroup>
                    <Label for="electionBody"><b>Description</b></Label>
                    <Input type="textarea" name="description" required={true}
                      id="electionBody" defaultValue={this.body}
                      onChange={e => { this.body = e.target.value }} />
                  </FormGroup><br />
                  <FormGroup>
                    <Label><b>Choices</b></Label>
                    <Choices choices={this.state.choices}
                      changeHandler={this.handleChoiceInput}
                      removeHandler={this.removeChoice} />
                    <br />
                    <Button color="secondary" onClick={this.addMoreChoice}>Add a new choice</Button>
                    <br />
                  </FormGroup>
                </Col>

                <Col>
                  <FormGroup>
                    <Label><b>Choose Voters</b></Label>
                    <Query query={USERS_QUERY}>
                      {({ data, loading, error }) => {
                        if (loading || !(data.users)) return <Spinner color="primary" />;
                        if (error) return <Alert color="danger">Loading User Error!</Alert>;
                        if (this.state.users.length !== data.users.length) {
                          this.setState(state => {
                            state.users = data.users.map(user => ({
                              id: user.id, included: false, name: user.name, email: user.email
                            }));
                            return state;
                          })
                        }
                        return (<>

                          <InputGroup>
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <Input addon type="checkbox" onChange={e => {
                                  const check = e.target.checked;
                                  this.setState(state => {
                                    state.users = state.users.map(user => ({ ...user, included: check }))
                                    return state;
                                  })
                                }} />
                              </InputGroupText>
                              <Input value={"Select All!"} readOnly />
                            </InputGroupAddon>
                          </InputGroup>

                          {this.state.users.map((user, idx) => {
                            return (
                              <InputGroup key={user.id}>
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <Input addon type="checkbox"
                                      checked={this.state.users[idx].included}
                                      id={`Check_${idx}`}
                                      onChange={this.handleCheck}
                                    />
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input value={`${user.name}, ${user.email}`} readOnly />
                              </InputGroup>
                            )
                          })}
                        </>)
                      }}
                    </Query>

                  </FormGroup><br />
                  <FormGroup check>
                    <Label check>
                      <Input type="checkbox" onChange={e => {
                        this.open = e.target.checked;
                      }} />{' '}
                      Start this election when created
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="checkbox" onChange={e => {
                        this.twoStage = e.target.checked;
                      }} />{' '}
                      Create a two stage election
                    </Label>
                  </FormGroup>
                  <br />
                  <Button type="submit" color="primary">
                    Create
                  </Button><br />
                  {error ? <Alert color="danger">{errHandler(error)}</Alert> : null}
                  {(data && data.createGeneralElection)
                    ? <Alert color="success">Create election success! <br />
                      <NavLink to={`/vote/${this.twoStage
                        ? "twoStage"
                        : "simple"}/${this.getId(data)}`}>
                        View your election now!
                        </NavLink>
                    </Alert>
                    : null}
                </Col>
              </Row>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}

export default CreateElection;