import createReactClass from 'create-react-class'
import QRCode from 'qrcode.react'
import React from 'react'
import Spinner from 'react-spinkit'
import {Button, Modal, ModalBody, ModalHeader} from 'reactstrap'

// import {getDDOUri} from '/imports/bitcoin/resolveDID'
import {getDDO} from '/imports/bitcoin/DDO'
import ShowTruncatedText from '/imports/ui/ShowTruncatedText'

const ShowDDO = createReactClass({

  getInitialState: () => ({
    modal: false,
    ddoLoading: false,
    DDO: null
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
    const DDO = await getDDO(this.props.did)
    this.setState({
      ddoLoading: false,
      DDO
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
              : this.state.DDO ? <ShowTruncatedText text={'/ipfs/' + this.state.DDO.deterministicDDO.extendedDDOUrl} />  :null
            }
          </ModalHeader>
          <ModalBody>
            <div className='d-flex justify-content-center'>
              {this.state.ddoLoading
                  ? <Spinner name='double-bounce' />
                  : this.state.DDO ? (<div>
                    <pre>
                      {JSON.stringify(this.state.DDO.extendedDDO, null, 2)}
                    </pre>
                    <pre>
                      {JSON.stringify(this.state.DDO.deterministicDDO, null, 2)}
                    </pre>
                  </div>) : null
              }
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export default ShowDDO
