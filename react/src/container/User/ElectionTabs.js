import React from 'react'
import { Link } from 'react-router-dom'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardSubtitle, CardBody, CardText } from 'reactstrap'
import { Delete, Update } from '../Election'

const ElectionBlock = ({ id, type, title, body, creator, open, state, uid }) => {
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
          <br />
          <i style={{ color: 'gray' }}>{type}</i>
        </CardText>
        {localStorage['uid'] === creator.id && localStorage['uid'] === uid ?
          (
            <React.Fragment>
              <Update electionId={id} type={type} open={open} state={state} />
              <Delete electionId={id} type={type} />
            </React.Fragment>
          ) :
          null
        }
        <Link to={`/vote/${type === "simpleElection" ? "simple" : "twoStage"}/${id}`}><Button color="success">View</Button></Link>
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
          {[this.props.createdGeneralElections, this.props.votableGeneralElections, this.props.votedGeneralElections].map((elections, idx) => {
            return (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <TabPane tabId={`${idx + 1}`} key={`${idx + 1}`}>
                  {elections.map(generalElection => {
                    const election = generalElection.type === "simpleElection" ? generalElection.simpleElection : generalElection.twoStageElection;
                    return <ElectionBlock
                      id={election.id}
                      type={generalElection.type}
                      key={election.id}
                      title={election.title}
                      body={election.body}
                      creator={election.creator}
                      open={election.open}
                      state={election.state}
                      uid={this.props.uid}
                    />
                  })}
                </TabPane>
              </div>
            )
          })}
        </TabContent>
      </div>
    );
  }
}

export default ElectionTabs;