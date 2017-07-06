import React from 'react'
import {Container, Jumbotron} from 'reactstrap'
import Spinner from 'react-spinkit'

const ContactRequests = ({loading, requests}) => {
  if (loading) {
    return <Spinner name='double-bounce' />
  }
  return (
    <Container fluid>
      <Jumbotron>
        <h1 className='display-3'> Your contact requests</h1>
        <p className='lead'>
          Here you can cryptographically confirm your contact requests
        </p>
      </Jumbotron>
      <ul>
        {requests.map(({_id, senderDid}) => <li key={_id}> {senderDid} </li>)}
      </ul>
    </Container>
  )
}

export default ContactRequests
