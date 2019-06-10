import React from 'react';
import MainPage from './Pages/MainPage'
import ChooseQues from './Pages/ChooseQues'
import QuesPage from './Pages/QuesPage'
import LaunchQues from './Pages/LaunchQues'

import ResultChart from './Pages/ResultChart'
import Dashboard from './Pages/Dashboard'

import afterPage from '../component/afterVote'
import TopImg from '../component/TopImg/TopImg'
import Option from '../component/Option/Option'
import vote from '../component/Option/vote.png'
import result from '../component/Option/result.png'
import hist from '../component/Option/hist.png'
import logout from '../component/Option/logout.png'
import { BrowserRouter, Route, NavLink, Switch } from 'react-router-dom'
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }
  // callAPI() {
  //   fetch("http://localhost:9000/testAPI")
  //     .then(res => res.text())
  //     .then(res => this.setState({ apiResponse: res }));
  // }
  // componentWillMount() {
  //   this.callAPI();
  // }

  render() {
    return (
      <div className="App" id="App">

        <BrowserRouter basename="">

          <Switch>
            <Route exact path="/" component={TopImg}></Route>
            <Route exact path="/vote" component={QuesPage}></Route>
            <Route path="/vote/afterPage" component={afterPage}></Route>
            <Route path="/ChooseQues" component={LaunchQues}></Route>
            <Route path="/hist" component={ChooseQues}></Route>
            <Route path="/result" render={() => (<ResultChart text={"some text"} />)}></Route>
          </Switch>

          <div className="bottomBar" >

            <NavLink activeClassName="selected" to="/vote">
              <Option src={vote} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/result">
              <Option src={result} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/ChooseQues">
              <Option src={hist} scale={100} />
            </NavLink>

            <NavLink activeClassName="selected" to="/">
              <Option src={logout} scale={100} />
            </NavLink>

          </div>
        </BrowserRouter>


      </div >
    );
  }
}

export default App;
