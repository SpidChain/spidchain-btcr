import React from 'react'
import {Container, Col, Jumbotron, ListGroup, Row} from 'reactstrap'
import Spinner from 'react-spinkit'
import RequestItem from 'ui/RequestItem'
import {connect} from 'react-redux'

const ContactRequests = ({data, loading, did, wallet, dispatch}) =>
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
    { loading
        ? <Spinner name='double-bounce' />
        : (<Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {data.length === 0
                ? <p> You have no requests </p>
                : <ListGroup>
                  {data.map(({_id, nonce, senderDid}) => <RequestItem
                    key={_id}
                    _id={_id}
                    did={did}
                    nonce={nonce}
                    senderDid={senderDid}
                    wallet={wallet}
                    dispatch={dispatch}
                  />)}
                </ListGroup>
            }
          </Col>
        </Row>)
    }
  </Container>

export default connect(
  ({receivedRequests}) => receivedRequests // mapStateToProps
)(ContactRequests)
