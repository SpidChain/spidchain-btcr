import React from 'react'
import {connect} from 'react-redux'


const Balance = ({balance}) => {
  return <span className='rounded text-primary'> Balance is: {balance || '?'} </span>
}

export default connect(s => s)(Balance)
