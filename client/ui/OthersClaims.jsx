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

const OthersClaims = ({othersClaims}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <h6 className='mb-0 lead text-center'>
            <strong> Other users claims </strong>
          </h6>
        </Jumbotron>
      </Col>
    </Row>
    {!othersClaims || othersClaims.loading
        ? <Spinner name='double-bounce' />
        : <Row className='mt-3'>
          <Col md='6' className='mx-auto'>
            {othersClaims.data.length === 0
                ? <p className='text-center'> No claims </p>
                : <ListGroup>
                  {othersClaims.data.map(({_id, subject, claimId, signedDocument}) =>
                    <OthersClaim
                      key={_id}
                      claim={signedDocument}
                      subject={subject}
                      claimId={claimId}
                    />)}
                </ListGroup>
            }
          </Col>
        </Row>
    }
  </Container>
)

export default connect(s => s)(OthersClaims)
