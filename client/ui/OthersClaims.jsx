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

import OthersClaim from 'ui/OthersClaim'

const OthersClaims = ({othersClaims, loading}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <h1 className='lead text-center'>
            <strong> Other users claims </strong>
          </h1>
        </Jumbotron>
      </Col>
    </Row>
    {loading || !othersClaims
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {othersClaims.length === 0
                ? <h3> There are no claims </h3>
                : <ListGroup>
                  {othersClaims.map(({_id, signedDocument}) =>
                    <OthersClaim claim={JSON.parse(signedDocument)} claimId={_id} key={_id} />)}
                </ListGroup>
            }
          </Col>
        </Row>
    }
  </Container>
)

export default connect(s => s)(OthersClaims)