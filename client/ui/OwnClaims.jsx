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

import Claim from 'ui/Claim'

const OwnClaims = ({ownClaims, loading}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <h1 className='lead text-center'>
            <strong> Your own claims </strong>
          </h1>
        </Jumbotron>
      </Col>
    </Row>
    {loading || !ownClaims
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {ownClaims.length === 0
                ? <h3> There are no claims </h3>
                : <ListGroup>
                  {ownClaims.map(({_id, signedDocument}) =>
                    <Claim claim={signedDocument} key={_id} />)}
                </ListGroup>
            }
          </Col>
        </Row>
    }
  </Container>
)

export default connect(s => s)(OwnClaims)
