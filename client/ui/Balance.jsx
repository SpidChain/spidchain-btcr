import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'

const Balance = ({balance}) => {
  return <span> Satoshis: {_.isNumber(balance) ? balance : '?'} </span>
}

export default connect(s => s)(Balance)
