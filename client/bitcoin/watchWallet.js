import {getBalance} from 'bitcoin/blockexplorerRpc'
import {setBalance} from 'redux/actions'
//
// Update wallet balance once every 10 minutes
console.log('walletUpdateInterval', process.env.BALANCE)
const walletUpdateInterval = process.env.BALANCE || 300000
console.log('walletUpdateInterval', walletUpdateInterval)

const watchWallet = dispatch => ({receivingAddress}) => {
  const interval = walletUpdateInterval // 10 minute
  getBalance(receivingAddress)
    .then(balance => dispatch(setBalance(balance)))
  const handle = setInterval(async () => {
    const {balance} = await getBalance(receivingAddress)
    dispatch(setBalance(balance))
  }, interval)
}

export default watchWallet
