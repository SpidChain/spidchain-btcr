import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'
import RequestItem from 'ui/RequestItem'
import {connect} from 'react-redux'

const ContactRequests = ({receivedRequests: {loading, data}}) => {
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <h1>
              <strong> Confirm your contact requests </strong>
            </h1>
          </Jumbotron>
        </Col>
      </Row>
      { loading || data === null // TODO: Check this error condition
          ? <Spinner name='double-bounce' />
          : (<Row className='mt-3'>
            <Col md='6' className='mx-auto'>
              {data.length === 0
                  ? <p> You have no requests </p>
                  : <ListGroup>
                    {data.map(({_id, nonce, senderDid}) => <RequestItem
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
