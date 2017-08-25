import QRCode from 'qrcode.react'
import React from 'react'
import {connect} from 'react-redux'
import createReactClass from 'create-react-class'
import {Button, Modal, ModalBody} from 'reactstrap'

import Balance from 'ui/Balance'
import TruncatedModalHeader from 'ui/TruncatedModalHeader'

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
        <Button color='primary' onClick={this.toggle} block>
          <Balance />
          </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <TruncatedModalHeader toggle={this.toggle} text={this.props.receivingAddress} />
          <ModalBody>
            <div className='d-flex justify-content-center'>
              <QRCode value={this.props.receivingAddress} size={256} />
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default connect(({wallet}) => wallet)(ReceivePayment)
