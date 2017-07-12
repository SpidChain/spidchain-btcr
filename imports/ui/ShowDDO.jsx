import createReactClass from 'create-react-class'
import QRCode from 'qrcode.react'
import React from 'react'
import Spinner from 'react-spinkit'
import {Button, Modal, ModalBody, ModalHeader} from 'reactstrap'

import {getDDOUri} from '/imports/bitcoin/resolveDID'

const ShowDDO = createReactClass({

  getInitialState: () => ({
    modal: false,
    ddoLoading: false,
    ddo: null
  }),

  toggle: function () {
    this.setState({
      modal: !this.state.modal
    })
    if (!this.state.modal) {
      this.getDDO()
    }
  },

  getDDO: async function () {
    this.setState({
      ddoLoading: true
    })
    const ddo = await getDDOUri(this.props.did)
    this.setState({
      ddoLoading: false,
      ddo
    })
  },

  render: function () {
    return (
      <div>
        <Button color='primary' onClick={this.toggle} block> Show DDO </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>
            {this.state.ddoLoading
              ? null
              : '/ipfs/' + this.state.ddo
            }
          </ModalHeader>
          <ModalBody>
            <div className='d-flex justify-content-center'>
              {this.state.ddoLoading
                  ? <Spinner name='double-bounce' />
                  : this.state.ddo
                  ? <QRCode value={'/ipfs/' + this.state.ddo} size={256} className='mx-auto' />
                    : null
              }
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default ShowDDO
