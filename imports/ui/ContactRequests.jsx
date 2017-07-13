import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'

import RequestItem from '/imports/ui/RequestItem'

const ContactRequests = ({loading, requests, did, wallet}) => {
  if (loading) {
    return <Spinner name='double-bounce' />
  }
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <p className='lead'>
              Here you can confirm your contact requests
            </p>
          </Jumbotron>
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          {requests.length === 0
              ? <p> You have no requests </p>
              : <ListGroup>
                {requests.map(({_id, nonce, senderDid}) => <RequestItem
                  key={_id}
                  did={did}
                  nonce={nonce}
                  senderDid={senderDid}
                  wallet={wallet}
                />)}
              </ListGroup>
          }
        </Col>
      </Row>
    </Container>
  )
}

export default ContactRequests
