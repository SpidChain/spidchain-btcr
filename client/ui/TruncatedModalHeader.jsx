import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Button} from 'reactstrap'

const truncateWithEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const TruncatedModalHeader = ({text, toggle}) => (
  <div className='modal-header'>
    <h4 className='modal-title' style={truncateWithEllipsis}>
      {text}
    </h4>
    <CopyToClipboard text={text}>
      <Button className='float-left' size='sm'>
        <span className='fa fa-copy text-muted' />
      </Button>
    </CopyToClipboard>
    <button type='button' className='close' aria-label='Close' onClick={toggle}>
      <span aria-hidden='true'>&times;</span>
    </button>
  </div>
)

export default TruncatedModalHeader
