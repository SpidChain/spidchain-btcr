import QRCode from 'qrcode.react'
import React from 'react'
import createReactClass from 'create-react-class'
import {Button, Modal, ModalBody, ModalHeader} from 'reactstrap'

const ReceivePayment = createReactClass({

  getInitialState: () => ({modal: false}),

  toggle: function () {
    this.setState({
      modal: !this.state.modal
    })
  },

  render: function () {
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Fund Wallet </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            {this.props.address}
          </ModalHeader>
          <ModalBody>
            <div className='d-flex justify-content-center'>
              <QRCode value={this.props.address} size={256} />
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default ReceivePayment
