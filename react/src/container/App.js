import React from 'react'
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom'
import { Button, ButtonGroup } from 'reactstrap'
import styled from 'styled-components'

import TopImg from '../component/TopImg/TopImg'
import Register from '../component/navbar/Register'
import Login from '../component/navbar/Login'
import './App.css';
import Navbar from '../component/navbar'
import { View, Vote, TwoStageVote, Create, Verify } from './Election'
import { AllUser, Profile } from './User'

const Div = styled.div`
  height: 100%;
  width: 100%;
`;

class App extends React.Component {
  render() {
    return (
      <div className="App" id="App">

        <BrowserRouter basename="">
          <Navbar className="top" />

          <div className="main">
            <Switch>
              <Route exact path="/" component={TopImg}></Route>
              <Route exact path="/vote"><View /></Route>
              <Route path="/vote/simple/:id">{({ match }) => <Vote electionId={match.params.id} />}</Route>
              <Route path="/vote/twoStage/:id">{({ match }) => <TwoStageVote electionId={match.params.id} />}</Route>
              <Route path="/verify/:id">{({ match }) => <Verify electionId={match.params.id} />}</Route>
              <Route exact path="/login"><Login /></Route>
              <Route exact path="/register"><Register /></Route>
              <Route exact path="/create"><Create new={true} /></Route>
              <Route exact path="/user"><AllUser /></Route>
              <Route path="/user/:id">{({ match }) => <Profile uid={match.params.id} />}</Route>
              <Route path="/redirect/:name">
                {({ match }) => {
                  this.forceUpdate();
                  return <Redirect to={"/" + match.params.name} />;
                }}
              </Route>
              <Route path="/redirect">{() => {
                this.forceUpdate();
                return <Redirect to="/" />;
              }}</Route>
            </Switch>
          </div>
          <br />
          <div className="bottomBar" >
            <ButtonGroup>
              <Button className="button-link" outline color="info"><Link to="/vote"><Div>Elections</Div></Link></Button>
              <Button className="button-link" outline color="info"><Link to="/create"><Div>Create Election</Div></Link></Button>
              <Button className="button-link" outline color="info"><Link to="/user"><Div>Users</Div></Link></Button>
            </ButtonGroup>

          </div>
        </BrowserRouter>


      </div >
    );
  }
}

export default App;
