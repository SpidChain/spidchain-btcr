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
        <Button color='primary' onClick={this.toggle}> Receive </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
          <ModalBody>
            {this.props.address}
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default ReceivePayment
