import React from 'react'
import {Container, Jumbotron, ListGroup} from 'reactstrap'
import Spinner from 'react-spinkit'

import RequestItem from '/imports/ui/RequestItem'

const ContactRequests = ({loading, requests, did, wallet}) => {
  if (loading) {
    return <Spinner name='double-bounce' />
  }
  return (
    <Container fluid>
      <Jumbotron>
        <p className='lead'>
          Here you can confirm your contact requests
        </p>
      </Jumbotron>
      <ListGroup>
        {requests.map(({_id, nonce, senderDid}) => <RequestItem
          key={_id}
          did={did}
          nonce={nonce}
          senderDid={senderDid}
          wallet={wallet}
        />)}
      </ListGroup>
    </Container>
  )
}

export default ContactRequests
