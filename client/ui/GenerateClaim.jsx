import React from 'react'
import {connect} from 'react-redux'
import {Button, Col, Container, Jumbotron, Form, FormGroup, Input, Label, Row} from 'reactstrap'
import {NotificationManager} from 'react-notifications'

import signClaim from 'bitcoin/signClaim'
import {insertClaim} from 'dbUtils'
import {getOwnClaims} from 'redux/actions'

const context = {
  familyName: 'http://schema.org/familyName',
  givenName: 'http://schema.org/givenName'
}

const handleSubmit = (did, dispatch, wallet) => async (e) => {
  e.preventDefault()
  const form = e.target
  const firstname = form.firstname.value.trim()
  const lastname = form.lastname.value.trim()
  const email = form.email.value.trim()

  if (firstname === '' && lastname === '') {
    return
  }

  const claim = {
    '@context': context,
    '@id': `did:btcr:${did}`
  }

  if (lastname !== '') {
    claim.familyName = lastname
  }

  if (firstname !== '') {
    claim.givenName = firstname
  }

  if (email !== '') {
    claim.email = email
  }

  const walletRoot = wallet.root
  const controlAccount = Number(process.env.controlAccount)
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
  .deriveHardened(controlAccount)
  .derive(0)

  const rotationIx = 0
  try {
    const signedDocument = await signClaim({claim, ownerRoot, rotationIx, did})
    await insertClaim(signedDocument, [did], 'PERSON', [did])
    dispatch(getOwnClaims(did))
    NotificationManager.success('', 'Claim generated', 5000)
  } catch (e) {
    NotificationManager.error('', 'Claim genration failed', 5000)
    console.error(e)
    return
  }
  form.reset()
}

const GenerateClaim = ({did, dispatch, wallet}) => (
  <Container fluid>
    <Row className='mt-3'>
      <Col md='6' className='mx-auto'>
        <Jumbotron>
          <p className='lead text-center'>
            <strong>
              Generate a claim about yourself
            </strong>
          </p>
        </Jumbotron>
      </Col>
    </Row>
    <Form
      autoComplete='off'
      autoCorrect='off'
      onSubmit={handleSubmit(did.did, dispatch, wallet)}>
      <Row>
        <Col md='6' className='mx-auto'>
          <FormGroup>
            <Label>
              First name
            </Label>
            <Input type='text' autoCapitalize='none' name='firstname' />
          </FormGroup>

          <FormGroup>
            <Label>
              Last name
            </Label>
            <Input type='text' autoCapitalize='none' name='lastname' />
          </FormGroup>

          <FormGroup>
            <Label>
              Email
            </Label>
            <Input type='text' autoCapitalize='none' name='email' />
          </FormGroup>

          <Button type='submit' block color='primary'>
            Generate claim
          </Button>
        </Col>
      </Row>
    </Form>
  </Container>
)

export default connect(s => s)(GenerateClaim)
