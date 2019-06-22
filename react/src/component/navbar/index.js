import React from 'react'
import { Navbar, NavbarBrand } from 'reactstrap';
import Auth from './Auth'

class MyNavbar extends React.Component {
  render() {
    return <div>
      <Navbar color="light" light expand={true}>
        <NavbarBrand href="/">E-Voting</NavbarBrand>
        <Auth />
      </Navbar>
    </div>
  }
}

export default MyNavbar