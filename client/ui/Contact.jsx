import React from 'react'
import {ListGroupItem} from 'reactstrap'

const Contact = ({receiverDid, verified}) => {
  return (
    <ListGroupItem>
      {receiverDid}
      {
        verified === 'true'
        ? <span className='fa fa-check' />
        : <span className='fa fa-question' />
      }
    </ListGroupItem>
  )
}

export default Contact
