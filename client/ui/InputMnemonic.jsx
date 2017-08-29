import React from 'react'
import {
  Button,
  Col,
  Form,
  FormGroup
} from 'reactstrap'
import InputWord from 'ui/InputWord'

const wordsHandler = (onWords) => (e) => {
  e.preventDefault()
  const words = []
  for (let i = 0; i < 12; i++) {
    words[i] = e.target['w' + i].value.trim()
  }
  onWords(words)
}

const Row = ({num}) => (
  <FormGroup row>
    <Col xs='3'>
      <InputWord name={'w' + (4 * num)} placeholder={4 * num + 1} />
    </Col>
    <Col xs='3'>
      <InputWord tag='input' name={'w' + (4 * num + 1)} placeholder={4 * num + 2} />
    </Col>
    <Col xs='3'>
      <InputWord tag='input' name={'w' + (4 * num + 2)} placeholder={4 * num + 3} />
    </Col>
    <Col xs='3'>
      <InputWord tag='input' name={'w' + (4 * num + 3)} placeholder={4 * num + 4} />
    </Col>
  </FormGroup>
)

const InputMnemonic = ({onBack, onWords}) => (
  <Form autoCorrect='off' autoComplete='off' onSubmit={wordsHandler(onWords)}>
    <Row num={0} />
    <Row num={1} />
    <Row num={2} />
    <Button color='danger' type='button' onClick={onBack}>
      <span className='fa fa-arrow-left' style={{marginRight: '5px'}} />
      Back
    </Button>
    <Button color='primary' type='submit' className='pull-right'>
      Confirm
      <span className='fa fa-arrow-right' style={{marginLeft: '5px'}} />
    </Button>
  </Form>
)

export default InputMnemonic
