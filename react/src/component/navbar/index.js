import React from 'react'
import { Navbar, NavbarBrand } from 'reactstrap';
import Auth from './Auth'

const MyNavbar = props => {
  return (
    <div>
      <Navbar color="light" light expand={true}>
        <NavbarBrand href="/">E-Voting</NavbarBrand>
        <Auth />
      </Navbar>
    </div>
  );
  
}

export default MyNavbar