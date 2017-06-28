import React from 'react'
import {Button, Col, Form, FormGroup, Input} from 'reactstrap'

const wordsHandler = (onWords) => (e) => {
  e.preventDefault()
  const words = []
  for (let i = 0; i < 12; i++) {
    words[i] = e.target['w' + i].value
  }
  onWords(words)
}

const Row = ({num}) => (
  <FormGroup row>
    <Col xs='3'>
      <Input type='text' name={'w' + (4 * num)} />
    </Col>
    <Col xs='3'>
      <Input type='text' name={'w' + (4 * num + 1)} />
    </Col>
    <Col xs='3'>
      <Input type='text' name={'w' + (4 * num + 2)} />
    </Col>
    <Col xs='3'>
      <Input type='text' name={'w' + (4 * num + 3)} />
    </Col>
  </FormGroup>
)

const InputMnemonic = ({onBack, onWords}) => (
  <Form onSubmit={wordsHandler(onWords)}>
    <Row num={0} />
    <Row num={1} />
    <Row num={2} />
    <Button type='button' onClick={onBack}>
      Back
    </Button>
    <Button type='submit' className='pull-right'>
      Confirm
    </Button>
  </Form>
)

export default InputMnemonic
