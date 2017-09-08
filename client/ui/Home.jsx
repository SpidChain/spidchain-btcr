import React from 'react'
import {Col, Container, Row} from 'reactstrap'
import {connect} from 'react-redux'
import Logo from 'assets/spidlogo'

import ShowQRCode from 'ui/ShowQRCode'
import Balance from 'ui/Balance'

const Home = ({did, wallet}) => {
  return <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
          <Logo   className='w-75 d-block mx-auto mt-3' alt='SpidChain logo'  />
      </Col>
    </Row>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <ShowQRCode content={wallet.receivingAddress}>
          <Balance />
        </ShowQRCode>
      </Col>
    </Row>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <ShowQRCode content={did.did} >
          Show DID
        </ShowQRCode>
      </Col>
    </Row>
  </Container>
}

export default connect(s => s)(Home)
