import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap'
import {NotificationManager} from 'react-notifications'
import {setGotCoins} from 'redux/actions'
import {connect} from 'react-redux'

import bitcoinRpc from 'bitcoin/bitcoinRpc'

const FreeCoins = createReactClass({

  getInitialState: () => ({modal: false}),

  sendBitcoins: function (address, amount) {
    return async () => {
      try {
        await bitcoinRpc('sendToAddress', address, amount)
        this.props.dispatch(setGotCoins())
        NotificationManager.success('wait a few minutes', 'Bitcoins sent', 5000)
      } catch (e) {
        NotificationManager.error('', 'Bitcoins not sent', 5000)
        console.error('could not get free bitcoins', e)
      }
      this.toggle()
    }
  },

  refuseBitcoins: function () {
    this.props.dispatch(setGotCoins())
    this.toggle()
  },

  toggle: function () {
    this.setState({
      modal: !this.state.modal
    })
  },

  render: function () {
    const address = this.props.address
    const amount = 0.01
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Get Bitcoins </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalBody className='justify-content-center'>
            <div className='lead text-center'>
              Get free Bitcoins once
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' size='sm' onClick={this.refuseBitcoins}>
              No thanks
            </Button>
            <Button color='primary' size='sm'
              onClick={this.sendBitcoins(address, amount)}>
              OK
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
})

export default connect(s => s)(FreeCoins)
