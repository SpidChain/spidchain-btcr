import createReactClass from 'create-react-class'
import React from 'react'
import {Link, NavLink as RNavLink} from 'react-router-dom'
import {
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
  NavbarToggler
} from 'reactstrap'

import Logo from 'assets/spidchain-logo'

export default createReactClass({
  displayName: 'NavBar',

  getInitialState: () => ({
    isOpen: false
  }),

  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    })
  },

  close () {
    this.setState({
      isOpen: false
    })
  },

  render () {
    return (
      <Navbar color='faded' light toggleable='lg'>
        <NavbarToggler right onClick={this.toggle} />
        <NavbarBrand tag={Link} to='/'>
          <Logo height='30' width={null} />
        </NavbarBrand>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar className='ml-auto'>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/' onClick={this.close}>Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/addContact' onClick={this.close}>Add Contact</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/contactRequests' onClick={this.close}>Contact Requests</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/contacts' onClick={this.close}>Contacts</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/generateClaim' onClick={this.close}>Generate Claim</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/loginAuthorization' onClick={this.close}>Authorize Login</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/ownClaims' onClick={this.close}>My Claims</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/othersClaims' onClick={this.close}>Others Claims</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/developer' onClick={this.close}>Developer</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
})
