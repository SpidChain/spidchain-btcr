import createReactClass from 'create-react-class'
import QRCode from 'qrcode.react'
import React from 'react'
import {connect} from 'react-redux'
import {Button, Modal, ModalBody} from 'reactstrap'

import TruncatedModalHeader from 'ui/TruncatedModalHeader'

const ShowDID = createReactClass({

  getInitialState: () => ({modal: false}),

  toggle: function () {
    this.setState({
      modal: !this.state.modal
    })
  },

  render: function () {
    const unconfirmedDID = this.props.unconfirmedDID
    const did = unconfirmedDID || this.props.did
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Show DID </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <TruncatedModalHeader text={did} toggle={this.toggle} />
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
