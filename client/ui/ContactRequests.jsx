import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'
import RequestItem from 'ui/RequestItem'
import {connect} from 'react-redux'

const ContactRequests = ({receivedRequests}) => {
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <h6 className='mb-0 lead text-center'>
              <strong> Confirm your contact requests </strong>
            </h6>
          </Jumbotron>
        </Col>
      </Row>
      { !receivedRequests || receivedRequests.loading || receivedRequests.data === null // TODO: Check this error condition
          ? <Spinner name='double-bounce' />
          : (<Row className='mt-3'>
            <Col md='6' className='mx-auto'>
              {receivedRequests.data.length === 0
                  ? <p className='text-center'> No requests </p>
                  : <ListGroup>
                    {receivedRequests.data.map(({_id, nonce, senderDid}) => <RequestItem
                      key={_id}
                      _id={_id}
                      nonce={nonce}
                      senderDid={senderDid}
                    />)}
                  </ListGroup>
              }
            </Col>
          </Row>)
      }
    </Container>
  )
}

export default connect(s => s)(ContactRequests)
