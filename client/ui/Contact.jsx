import React from 'react'
import {ListGroupItem} from 'reactstrap'

const Contact = ({did, verified}) => {
  return (
    <ListGroupItem>
      {did}
      {
        verified
        ? <span className='fa fa-check' />
        : <span className='fa fa-question' />
      }
    </ListGroupItem>
  )
}

export default Contact
