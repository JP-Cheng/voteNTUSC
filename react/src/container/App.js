import React from 'react'
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom'
import { Button, ButtonGroup } from 'reactstrap'

//import ChooseQues from './Pages/ChooseQues'
//import ResultChart from './Pages/ResultChart'
//import LaunchQues from './Pages/LaunchQues'
//import MainPage from './Pages/MainPage'
//import QuesPage from './Pages/QuesPage'
//import Dashboard from './Pages/Dashboard'
//import Option from '../component/Option/Option'
//import vote from '../component/Option/vote.png'
//import result from '../component/Option/result.png'
//import hist from '../component/Option/hist.png'
//import logout from '../component/Option/logout.png'
//import afterPage from '../component/afterVote'

import TopImg from '../component/TopImg/TopImg'
import Register from '../component/navbar/Register'
import Login from '../component/navbar/Login'
import './App.css';
import Navbar from '../component/navbar'
import { View, Vote, Create } from './Election'
import { AllUser, Profile } from './User'

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }

  render() {
    return (
      <div className="App" id="App">
        
        
        <BrowserRouter basename="">
          <Navbar className="top" />

          <div className="main">
            <Switch>
              <Route exact path="/" component={TopImg}></Route>
              <Route exact path="/vote"><View /></Route>
              <Route path="/vote/:id">{({match}) => <Vote electionId={match.params.id} />}</Route>
              <Route exact path="/login"><Login /></Route>
              <Route exact path="/register"><Register /></Route>
              <Route exact path="/create"><Create /></Route>
              <Route exact path="/user"><AllUser /></Route>
              <Route path="/user/:id">{({match}) => <Profile uid={match.params.id} />}</Route>
              {/*
              <Route path="/vote/afterPage" component={afterPage}></Route>
              <Route path="/hist" component={ChooseQues}></Route>
              <Route path="/result" render={() => (<ResultChart text={"some text"} />)}></Route>
               */}
              <Route path="/redirect/:name">
                {({match}) => {
                  this.forceUpdate();
                  return <Redirect to={"/"+match.params.name} />;
                }}
              </Route>
              <Route path="/redirect">{() => {
                this.forceUpdate();
                return <Redirect to="/" />;
              }}</Route>
            </Switch>
          </div>

          <div className="bottomBar" >
            {/*
            <NavLink activeClassName="selected" to="/vote">
              <Option src={vote} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/result">
              <Option src={result} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/create">
              <Option src={hist} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/">
              <Option src={logout} scale={100} />
            </NavLink>
            */}
            <ButtonGroup>
              {/* ToBeFix: click on button margin won't trigger link */}
              <Button className="button-link" outline color="info"><Link to="/vote">Elections</Link></Button>
              <Button className="button-link" outline color="info"><Link to="/create">Create Election</Link></Button>
              <Button className="button-link" outline color="info"><Link to="/user">Users</Link></Button>
            </ButtonGroup>

          </div>
        </BrowserRouter>


      </div >
    );
  }
}

export default App;
