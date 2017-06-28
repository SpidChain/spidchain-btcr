import React from 'react'
import {Col, Form, FormGroup} from 'reactstrap'

const Row = ({num, words}) => (
  <FormGroup row>
    <Col xs='3'>
      <p className='form-control-static'>{words[4 * num]}</p>
    </Col>
    <Col xs='3'>
      <p className='form-control-static'>{words[4 * num + 1]}</p>
    </Col>
    <Col xs='3'>
      <p className='form-control-static'>{words[4 * num + 2]}</p>
    </Col>
    <Col xs='3'>
      <p className='form-control-static'>{words[4 * num + 3]}</p>
    </Col>
  </FormGroup>
)

const ShowMnemonic = ({words}) => (
  <Form>
    <Row num={0} words={words} />
    <Row num={1} words={words} />
    <Row num={2} words={words} />
  </Form>
)

export default ShowMnemonic
