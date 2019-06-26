import React from 'react'
import { Link } from 'react-router-dom'
import {
  TabContent, TabPane, Nav, NavItem, NavLink,
  Card, CardTitle, CardSubtitle, CardBody, CardText, CardGroup,
  Button, Col, Row
} from 'reactstrap'
import { Delete } from '../Election'

const ElectionBlock = ({ id, title, body, creator, open, voted, uid }) => {
  return (
    <Card key={id} xs="2" style={{
      width: '20em', height: '14em', margin: '0.5em',
      border: '1pt solid  rgba(218, 212, 212, 0.4)',
      textAlign: 'left', padding: '0.2em 1em 0.2em 1em',
      display: 'inline-block'
    }}>
      <CardBody>
        <CardTitle>
          {(title.length > 14) ? (title.substring(0, 13) + '...') : (title)}
        </CardTitle>
        <br />
        <CardSubtitle>
          Creator: {creator ? creator.name : "None"}
        </CardSubtitle>
        <CardText>
          Description: {(body.length > 9) ? (body.substring(0, 7) + '...') : (body)}
        </CardText>
        {localStorage['uid'] === creator.id && localStorage['uid'] === uid ?
          (
            <React.Fragment>
              <Link to={`/edit/${id}`}><Button color="info" disabled={voted.length !== 0}>Edit</Button></Link>
              <Delete electionId={id} />
            </React.Fragment>
          ) :
          null
        }
        <Link to={"/vote/" + id}><Button color="success" disabled={!open} className="view-election">View</Button></Link>
      </CardBody>
    </Card >

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

      <div className="user-elections" style={{ textAlign: 'center', width: '100%' }}>
        <Nav tabs>
          {["Created Elections", "Participated Elections", "Voted Elections"].map((name, idx) => {
            return (
              <NavItem key={name} style={{ width: "33%", textAlign: 'center' }}>
                <NavLink
                  className={`${this.state.activeTab === `${idx + 1}` ? "active" : ""} user-election-button`}
                  onClick={() => { this.toggle(`${idx + 1}`); }}
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
              <TabPane tabId={`${idx + 1}`} key={`${idx + 1}`}>
                <div style={{ width: '100%', textAlign: 'center' }}>
                  {elections.map(election => {
                    return (
                      <>
                        <ElectionBlock
                          id={election.id}
                          key={election.id}
                          title={election.title}
                          body={election.body}
                          creator={election.creator}
                          open={election.open}
                          voted={election.voted}
                          uid={this.props.uid}
                        />
                      </>)
                  })}
                </div>
              </TabPane>
            )
          })}
        </TabContent>
      </div>
    );
  }
}

export default ElectionTabs;