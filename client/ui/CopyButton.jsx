import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Button} from 'reactstrap'

const CopyButton = ({text, toggle}) => (
  <div style={{margin: '20px'}}>
    <CopyToClipboard text={text}>
      <Button color='primary' block size='sm' onClick={toggle}>
        Copy Me
      </Button>
    </CopyToClipboard>
    <p className='lead text-center'> or </p>
  </div>
)

export default CopyButton
