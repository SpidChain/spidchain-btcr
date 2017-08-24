import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import ReceivePayment from 'ui/ReceivePayment'
import ShowDID from 'ui/ShowDID'

const Home = () => {
  return (
    <Container fluid>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <img src='/spidchain-logo.png' className='w-75 d-block mx-auto mt-3' alt='SpidChain logo' />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <ReceivePayment />
        </Col>
      </Row>
      <Row className='mt-3'>
        <Col md='6' className='mx-auto'>
          <ShowDID />
        </Col>
      </Row>
    </Container>
  )
}

export default Home
