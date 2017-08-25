import React from 'react'
import {Badge, ListGroupItem} from 'reactstrap'

const Contact = ({receiverDid, verified}) => {
  return (
    <ListGroupItem className='justify-content-between'>
      {receiverDid}
      {
        verified === 'true'
          ? <Badge color='success' > confirmed </Badge>
          : <Badge color='warning' > unconfirmed </Badge>
      }
    </ListGroupItem>
  )
}

export default Contact
