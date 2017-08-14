import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'
import RequestItem from 'ui/RequestItem'
import {connect} from 'react-redux'

const ContactRequests = ({receivedRequests: {data, loading}, did, wallet}) =>
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <p className='lead text-center'>
            <strong> Confirm your contact requests </strong>
          </p>
        </Jumbotron>
      </Col>
    </Row>
    { loading
        ? <Spinner name='double-bounce' />
        : (<Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {data.length === 0
                ? <p> You have no requests </p>
                : <ListGroup>
                  {data.map(({_id, nonce, senderDid}) => <RequestItem
                    key={_id}
                    did={did}
                    nonce={nonce}
                    senderDid={senderDid}
                    wallet={wallet}
                  />)}
                </ListGroup>
            }
          </Col>
        </Row>)
    }
  </Container>

export default connect(
  s => s // mapStateToProps
)(ContactRequests)
