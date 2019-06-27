import React from 'react'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'
import { Col, Row, Container, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Spinner } from 'reactstrap'
import { TWO_STAGE_ELECTION_QUERY, TWO_STAGE_ELECTION_SUBSCRIPTION } from '../../graphql/index'
import { myHash } from '../../hash'

class Verify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      output: ""
    }
  }

  handleInput = e => {
    const text = e.target.value;
    this.setText(text);
  }
  setText = text => { this.setState(state => ({ ...state, input: text, output: text !== "" ? myHash(text) : "" })) };
  findCommitment = (commitment, commitments) => {
    return commitments.findIndex(_commitment => commitment === _commitment.commitment);
  }

  render() {

    return (
      <Query query={TWO_STAGE_ELECTION_QUERY} variables={{ query: this.props.electionId }}>
        {({ data, loading, error, subscribeToMore }) => {
          if (error) return <h1>Error!</h1>;
          if (loading || !(data.twoStageElection)) return <Spinner color="primary" />;

          subscribeToMore({
            document: TWO_STAGE_ELECTION_SUBSCRIPTION,
            variables: { electionId: this.props.electionId },
            updateQuery: (prev, { subscriptionData }) => {
              if (!(subscriptionData.data) || !(subscriptionData.data.twoStageElection.mutation)) return prev;
              else if (subscriptionData.data.twoStageElection.mutation === "DELETED") {
                this.setState(state => {
                  state.alert = true;
                  return state;
                })
                return prev;
              }
              else {
                return { twoStageElection: subscriptionData.data.twoStageElection.data };
              }
            }
          })

          const hashedChoices = {};
          for (let i = -1; i < data.twoStageElection.choices.length; i++) hashedChoices[myHash(i.toString())] = i;

          return (
            <Container>
              <Row>
                <Col>
                  <h3>Ballots Verification</h3><br />
                  {data.twoStageElection.openings.map(({ hashedChoice, hashedSecret, id }) => {
                    let choice = hashedChoices[hashedChoice];
                    const numChoice = choice;
                    choice = choice === -1 ? "?" : choice.toString();
                    const ballotIdx = this.findCommitment(myHash(`${hashedSecret}${hashedChoice}`), data.twoStageElection.commitments);
                    return (
                      <Form key={id} style={{ border: "2px #CCC solid", borderRadius: '2px', padding: '1em', marginBottom: '2em' }}>
                        <Label>投下的選項</Label><br />
                        <InputGroup style={{ cursor: "pointer", marginBottom: "0.6em" }} onClick={_ => { this.setText(choice) }}>
                          <InputGroupAddon addonType="prepend">{choice}</InputGroupAddon>
                          <Input style={{ cursor: "pointer" }} value={hashedChoice} readOnly />
                        </InputGroup>
                        <Label>密碼的雜湊值</Label><br />
                        <Input type="text" value={hashedSecret} readOnly />
                        <Label>這是第{`${ballotIdx + 1}`}張選票，{numChoice === -1 ? "是一張廢票" : `投給了 ${numChoice + 1}.`} <i style={{ color: 'gray' }}>{`${data.twoStageElection.choices[choice]}`}</i></Label>
                        <br />
                        <Input type="text" style={{ cursor: "pointer" }} onClick={e => { this.setText(`${hashedSecret}${hashedChoice}`) }} value={data.twoStageElection.commitments[ballotIdx].commitment} readOnly />
                      </Form>
                    )
                  })}
                </Col>
                <Col>
                  <h3>Hash Test</h3><br />
                  <Form>
                    <FormGroup style={{ width: "80%", height: "10em" }} >
                      <Label for="hashInput">輸入</Label>
                      <Input type="textarea" id="hashInput" style={{ height: "8em", resize: "none" }} value={this.state.input} onChange={this.handleInput} />
                    </FormGroup>
                    <br />
                    <FormGroup style={{ width: "80%", height: "10em" }} >
                      <Label for="hashOutput">雜湊值</Label>
                      <Input type="textarea" id="hashOutput" style={{ height: "8em", resize: "none" }} value={this.state.output} readOnly />
                    </FormGroup>
                  </Form>
                </Col>
              </Row>
              <Row>
                <Link to={`/vote/twoStage/${this.props.electionId}`} style={{ margin: 'auto' }} >
                  <Button color="secondary">返回</Button>
                </Link>
              </Row>
            </Container>
          )
        }}
      </Query>
    )
  }
}

export default Verify;