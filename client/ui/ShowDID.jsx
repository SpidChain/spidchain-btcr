import createReactClass from 'create-react-class'
import QRCode from 'qrcode.react'
import React from 'react'
import {connect} from 'react-redux'
import {Button, Modal, ModalBody} from 'reactstrap'

import db from 'db'
import TruncatedModalHeader from 'ui/TruncatedModalHeader'

const ShowDID = createReactClass({

  getInitialState: () => ({
    modal: false,
    nonce: null
  }),

  toggle: function () {
    if (!this.state.modal) {
      const a = new Uint32Array(1)
      window.crypto.getRandomValues(a)
      db.nonces.add({nonce: a[0]})
      this.setState({
        modal: true,
        nonce: a[0]
      })
      return
    }

    this.setState({
      modal: false
    })
  },

  render: function () {
    const unconfirmedDID = this.props.unconfirmedDID
    const did = unconfirmedDID || this.props.did
    const nonce = this.state.nonce
    const didPlusNonce = nonce
      ? did + '/' + nonce.toString(16)
      : did
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Show DID </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <TruncatedModalHeader text={didPlusNonce} toggle={this.toggle} />
          <ModalBody>
            <div className='d-flex justify-content-center'>
              <QRCode value={did} size={256} className='mx-auto' />
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default connect(({did}) => did)(ShowDID)
