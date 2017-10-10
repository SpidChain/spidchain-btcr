import React from 'react'
import createReactClass from 'create-react-class'
import QRCode from 'qrcode.react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Button, Modal, ModalBody} from 'reactstrap'

const ShowQRCode = createReactClass({

  getInitialState: () => ({modal: false}),

  toggle: function () {
    if (this.props.onModalOpen && !this.state.modal) {
      this.props.onModalOpen()
    }

    this.setState({
      modal: !this.state.modal
    })
  },

  render: function () {
    const {title, content, children} = this.props
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> {children} </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalBody>
            <div style={{margin: '20px'}}>
              <CopyToClipboard text={content}>
                <Button color='primary' block size='sm' onClick={this.toggle}>
                  Copy Me
                </Button>
              </CopyToClipboard>
              <p className='lead text-center'> or </p>
            </div>
            <div className='d-flex justify-content-center'>
              <QRCode value={content} size={256} className='mx-auto' />
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default ShowQRCode
