import React from 'react'
import {
  Button,
  Col,
  Form,
  FormGroup,
  Row
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

const InputRow = ({num}) => (
  <FormGroup row className='mr-0'>
    <Col xs='3'>
      <InputWord  name={'w' + (4 * num)} placeholder={4 * num + 1} />
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
    <InputRow num={0} />
    <InputRow num={1} />
    <InputRow num={2} />
    <div className='pt-4'>
      <Button color='faded' type='button' onClick={onBack} className='p-2'>
        <span className='fa fa-arrow-left mr-1' />
        Back
      </Button>
      <Button color='primary' type='submit' className='float-right p-2'>
        Confirm
        <span className='fa fa-arrow-right ml-1' />
      </Button>
    </div>
  </Form>
)

export default InputMnemonic
