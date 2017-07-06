import createReactClass from 'create-react-class'
import React from 'react'
import {Link, NavLink as RNavLink} from 'react-router-dom'
import {Collapse, Nav, NavItem, NavLink, Navbar, NavbarBrand, NavbarToggler} from 'reactstrap'

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
      <Navbar color='faded' light toggleable='md'>
        <NavbarToggler right onClick={this.toggle} />
        <NavbarBrand tag={Link} to='/'>SpidChain</NavbarBrand>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar className='ml-auto'>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/' onClick={this.close}>Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RNavLink} exact to='/addContact' onClick={this.close}>AddContact</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
})