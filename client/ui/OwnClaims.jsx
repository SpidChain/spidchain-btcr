import React from 'react'
import {connect} from 'react-redux'
import {
  Col,
  Container,
  Jumbotron,
  ListGroup,
  Row
} from 'reactstrap'
import Spinner from 'react-spinkit'

import OwnClaim from 'ui/OwnClaim'

const OwnClaims = ({ownClaims}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <h6 className='mb-0 lead text-center'>
            <strong> Your own claims </strong>
          </h6>
        </Jumbotron>
      </Col>
    </Row>
    {!ownClaims || ownClaims.loading
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {ownClaims.data.length === 0
                ? <p className='text-center'> No claims </p>
                : <ListGroup>
                  {ownClaims.data.filter(({type}) => type !== 'KNOWS').map(({hash, claim, signers, pending}) =>
                    <OwnClaim claim={claim} signers={signers} pending={pending} claimId={hash} key={hash} />)}
                </ListGroup>
            }
          </Col>
        </Row>
    }
  </Container>
)

export default connect(s => s)(OwnClaims)
