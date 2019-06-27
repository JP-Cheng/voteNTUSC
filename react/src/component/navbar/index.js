import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from 'reactstrap';
import Auth from './Auth'

class MyNavbar extends React.Component {
  render() {
    return <div>
      <Navbar color="light" light expand={true} className="navbar">
        <Link className="navbar-brand" to="/">E-Voting</Link>
        <Auth />
      </Navbar>
    </div>
  }
}

export default MyNavbar