import createReactClass from 'create-react-class'
import React from 'react'
import {connect} from 'react-redux'
import {Button, Col, Container, Jumbotron, Form, FormGroup, Input, Label, Row} from 'reactstrap'

import signClaim from 'bitcoin/signClaim'
import verifyClaim from 'bitcoin/verifyClaim'

const context = {
  familyName: 'http://schema.org/familyName',
  givenName: 'http://schema.org/givenName'
}

const GenerateClaim = createReactClass({
  onSubmit (e) {
    e.preventDefault()
    const firstname = e.target.firstname.value.trim()
    const lastname = e.target.lastname.value.trim()

    if (firstname === '' && lastname === '') {
      return
    }

    const claim = {
      '@context': context,
      '@id': `did:btcr:${this.props.did.did}`
    }

    if (lastname !== '') {
      claim.familyName = lastname
    }

    if (firstname !== '') {
      claim.givenName = firstname
    }

    const walletRoot = this.props.wallet.root
    const controlAccount = Number(process.env.controlAccount)
    const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(controlAccount)
    .derive(0)

    const rotationIx = 0
    const address = ownerRoot.derive(rotationIx).getAddress()
    const keyId = `ecdsa-koblitz-pubkey:${address}`

    const did = `did:btcr:${this.props.did.did}`

    signClaim(claim, ownerRoot, rotationIx)
      .then((signedDocument) => {
        console.log('signed', signedDocument)
        return signedDocument
      })
      .then((signedDocument) => verifyClaim(signedDocument, did, keyId, address))
      .then((value) => {
        console.log('result', value)
      })
  },

  render () {
    return (
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
        <Form onSubmit={this.onSubmit}>
          <Row>
            <Col md='6' className='mx-auto'>
              <FormGroup>
                <Label>
                  First name
                </Label>
                <Input type='text' name='firstname' />
              </FormGroup>

              <FormGroup>
                <Label>
                  Last name
                </Label>
                <Input type='text' name='lastname' />
              </FormGroup>

              <Button type='submit' block color='primary'>
                Generate claim
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    )
  }
})

export default connect(s => s)(GenerateClaim)
