import {getBalance, getBalanceBE} from 'bitcoin/blockexplorerRpc'
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
    try {
      const {balance} = await getBalanceBE(receivingAddress)
      dispatch(setBalance(balance))
    } catch (e) {
      console.warn(e)
    }
  }, walletUpdateInterval)
}

export default watchWallet
