import React from 'react'
import {Badge, ListGroupItem} from 'reactstrap'

const Contact = ({contact, verified}) => {
  return (
    <ListGroupItem className='justify-content-between'>
      {contact}
      {
        verified
          ? <Badge color='success' > confirmed </Badge>
          : <Badge color='warning' > unconfirmed </Badge>
      }
    </ListGroupItem>
  )
}

export default Contact
