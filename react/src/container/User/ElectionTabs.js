import React from 'react'
import { Link } from 'react-router-dom'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardSubtitle, CardBody, CardText } from 'reactstrap'

const ElectionBlock = ({id, title, body, creator, open, voted, uid}) => {
  return (
    <Card key={id}>
      <CardBody>
        <CardTitle>
          {title}
        </CardTitle>
        <br />
        <CardSubtitle>
          Creator: {creator?creator.name:"None"}
        </CardSubtitle>
        <CardText>
          Description: {body}
        </CardText>
        {localStorage['uid'] === creator.id && localStorage['uid'] === uid?
          (
            <React.Fragment>
              <Link to={`/edit/${id}`}><Button color="info" disabled={voted.length === 0}>Edit</Button></Link>
              <Button color="danger">Delete</Button>
            </React.Fragment>
          ):
          null
        }
        <Link to={"/vote/"+id}><Button color="success" disabled={!open}>View</Button></Link>
      </CardBody>
    </Card>
  )
}

class ElectionTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1'
    };
  }

  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render() {
    return (
      <div className="user-elections">
        <Nav tabs>
          {["Created Elections", "Participated Elections", "Voted Elections"].map((name, idx) => {
            return (
              <NavItem key={name}>
                <NavLink
                  className={`${this.state.activeTab === `${idx+1}`?"active":""} user-election-button`}
                  onClick={() => { this.toggle(`${idx+1}`); }}
                >
                  {`${name}`}
                </NavLink>
              </NavItem>
            )
          })}
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          {[this.props.createdElections, this.props.voteableElections, this.props.votedElections].map((elections, idx) => {
            return (
              <TabPane tabId={`${idx+1}`} key={`${idx+1}`}>
                {elections.map(election => {
                  return <ElectionBlock 
                    id={election.id}
                    key={election.id}
                    title={election.title}
                    body={election.title}
                    creator={election.creator}
                    open={election.open}
                    voted={election.voted}
                    uid={this.props.uid}
                  />
                })}
              </TabPane>
          )
          })}
        </TabContent>
      </div>
    );
  }
}

export default ElectionTabs;