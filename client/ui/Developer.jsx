import React from 'react'
import {connect} from 'react-redux'
import {Button, Col, Container, Row} from 'reactstrap'

import {getDDO} from 'bitcoin/DDO'

const printDDO = (did) => async () => {
  console.log('Fetching the DDO from the blockchain...')
  const DDO = await getDDO(did)
  const prettyDDO = JSON.stringify(DDO, null, 2)
  console.log('DDO is:')
  console.log(prettyDDO)
}

const Developer = ({did: {did}}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <div>
          <Button color='primary' onClick={printDDO(did)} block> Show DDO </Button>
        </div>
      </Col>
    </Row>
  </Container>
)

export default connect(s => s)(Developer)
