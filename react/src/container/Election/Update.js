import React from 'react';
import { Mutation } from 'react-apollo'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { UPDATE_ELECTION_MUTATION, UPDATE_TWO_STAGE_ELECTION_MUTATION } from '../../graphql'

class Update extends React.Component {
  constructor(props) {
    super(props);
    this.mutate = null;
    this.state = {
      modal: false
    };
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  delete = () => {
    if(this.mutate){
      this.mutate();
    }
    this.toggle();
  }

  render() {
    const simple = this.props.type === "simpleElection";
    return (
      <Mutation mutation={simple ? UPDATE_ELECTION_MUTATION : UPDATE_TWO_STAGE_ELECTION_MUTATION} variables={{id: this.props.electionId}}>
        {(deleteElection, {error}) => {
          this.mutate = deleteElection;
          if(error) console.error(error);
          
          let msg = "";
          if(simple) {
            if(this.props.open) {
              msg = "close the election";
            }
            else msg = "open the election"
          }
          else {
            if(this.props.state === "CLOSE") msg = "open the election";
            else if(this.props.state === "COMMIT") msg = "stop election and start counting ballots";
            else if(this.props.state === "OPEN") msg = "end the election";
            else msg = "make no change";
          }

          return (
            <div>
              <Button color="info" onClick={this.toggle}>{simple?(this.props.open?"Close":"Open"):"Next State"}</Button>
              <Modal isOpen={this.state.modal} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>Wait!</ModalHeader>
                <ModalBody>
                  This will {msg}. Are you sure?
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onClick={this.delete}>Yes!</Button>{' '}
                  <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                </ModalFooter>
              </Modal>
            </div>
          )
        }}
      </Mutation>
    );
  }
}

export default Update;