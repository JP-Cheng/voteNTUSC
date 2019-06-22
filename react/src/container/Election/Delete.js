import React from 'react';
import { Mutation } from 'react-apollo'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { DELETE_ELECTION_MUTATION } from '../../graphql'

class Delete extends React.Component {
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
    return (
      <Mutation mutation={DELETE_ELECTION_MUTATION} variables={{id: this.props.electionId}}>
        {(deleteElection, {error}) => {
          this.mutate = deleteElection;
          if(error) console.error(error);

          return (
            <div>
              <Button color="danger" onClick={this.toggle}>Delete</Button>
              <Modal isOpen={this.state.modal} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>Wait!</ModalHeader>
                <ModalBody>
                  Are you sure?
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

export default Delete;