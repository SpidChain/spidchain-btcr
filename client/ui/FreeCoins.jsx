import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Form, FormGroup, Input, Modal, ModalBody, ModalFooter} from 'reactstrap'
import {NotificationManager} from 'react-notifications'
import {setGotCoins} from 'redux/actions'
import {connect} from 'react-redux'

import {sendToAddress} from 'bitcoin/bitcoinRpc'

const FreeCoins = createReactClass({

  getInitialState: () => ({modal: false}),

  sendBitcoins: function (address) {
    return async (e) => {
      e.preventDefault()
      const form = e.target
      const secret = form.secret.value.trim()
      form.reset()
      this.toggle()
      if (secret === '') {
        return
      }
      try {
        console.log(address, secret)
        await sendToAddress({address, secret})
        this.props.dispatch(setGotCoins())
        NotificationManager.success('wait a few minutes', 'Bitcoins sent', 5000)
      } catch (e) {
        NotificationManager.error(e.message, 'Bitcoins not sent', 5000)
        console.error(e, 'Could not get free bitcoins')
      }
    }
  },

  toggle: function () {
    this.setState({
      modal: !this.state.modal
    })
  },

  render: function () {
    const address = this.props.address
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Use Promotion </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalBody className='justify-content-center'>
            <div className='lead text-center'>
              Get free Bitcoins once
            </div>
            <Form
              autoCorrect='off'
              autoComplete='off'
              onSubmit={this.sendBitcoins(address)}>
              <FormGroup>
                <Input
                  type='number'
                  name='secret'
                  placeholder='Secret Code' />
              </FormGroup>
              <Button type='submit' color='primary' block>
                Yes please
              </Button>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default connect(s => s)(FreeCoins)
