import React from 'react'
import {connect} from 'react-redux'
import {Button, Col, Container, Jumbotron, Row} from 'reactstrap'

import {getDDO} from 'bitcoin/DDO'
import db from 'db'

const printDDO = (did) => async () => {
  console.log('Fetching the DDO from the blockchain...')
  const DDO = await getDDO(did)
  const prettyDDO = JSON.stringify(DDO, null, 2)
  console.log('DDO is:')
  console.log(prettyDDO)
}

const printClaims = async () => {
  console.log('Fetching claims from the database...')
  const claims = await db.claims.toArray()
  claims.forEach(({signedDocument}) => console.log(signedDocument))
}

const Developer = ({did: {did}}) => (
  <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <Jumbotron>
            <p className='lead text-center'>
              <strong> This section is for developers. </strong>
            </p>
            <p className='lead text-center'>
              <strong> Output is in the console </strong>
            </p>
          </Jumbotron>
        </Col>
      </Row>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <div>
          <Button color='primary' onClick={printDDO(did)} block> Show DDO </Button>
        </div>
      </Col>
    </Row>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <div>
          <Button color='primary' onClick={printClaims} block> Show Claims </Button>
        </div>
      </Col>
    </Row>
  </Container>
)

export default connect(s => s)(Developer)
