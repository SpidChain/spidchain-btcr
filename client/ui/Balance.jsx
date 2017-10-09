import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import sb from 'satoshi-bitcoin'

const Balance = ({balance}) => {
  return <span> {_.isNumber(balance) ? sb.toBitcoin(balance) : <i className='fa fa-spinner fa-spin' aria-hidden="true"></i>} BTC </span>
}

export default connect(s => s)(Balance)
