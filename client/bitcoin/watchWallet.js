import {getBalance} from 'bitcoin/blockexplorerRpc'
import {setBalance} from 'redux/actions'
//
// Update wallet balance once every 10 minutes
console.log('walletUpdateInterval', process.env.BALANCE)
// TODO: does not read from process.env
const walletUpdateInterval = process.env.BALANCE || 600000

const watchWallet = dispatch => ({receivingAddress}) => {
  getBalance(receivingAddress)
    .then(({balance}) => {
      return dispatch(setBalance(balance))
    })
  const handle = setInterval(async () => {
    const {balance} = await getBalance(receivingAddress)
    dispatch(setBalance(balance))
  }, walletUpdateInterval)
}

export default watchWallet
