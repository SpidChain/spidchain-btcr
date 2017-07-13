import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Button} from 'reactstrap'

const ShowTruncatedText = ({text}) => {
  const truncateWithEllipsis = {
    'width': '270px',
    'white-space': 'nowrap',
    'overflow': 'hidden',
    'text-overflow': 'ellipsis'
  }
  return <p style={truncateWithEllipsis}>
    <CopyToClipboard text={text}>
      <Button className='fa fa-copy' />
    </CopyToClipboard>
    {text} </p>
}

export default ShowTruncatedText
