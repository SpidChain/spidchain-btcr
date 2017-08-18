import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'
import RequestItem from 'ui/RequestItem'
import {connect} from 'react-redux'

const ContactRequests = ({receivedRequests, loading, did, wallet, dispatch}) =>
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
    { loading || receivedRequests === null // TODO: Check this error condition
        ? <Spinner name='double-bounce' />
        : (<Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {receivedRequests.length === 0
                ? <p> You have no requests </p>
                : <ListGroup>
                  {receivedRequests.map(({_id, nonce, senderDid}) => <RequestItem
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

export default connect(s => s)(ContactRequests)
