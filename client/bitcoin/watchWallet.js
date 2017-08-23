import {getBalance} from 'bitcoin/blockexplorerRpc'
import {setBalance} from 'redux/actions'
//
// Update wallet balance once every 10 minutes
const walletUpdateInterval = 600000

const watchWallet = dispatch => ({receivingAddress}) => {
  const interval = walletUpdateInterval // 10 minute
  const handle = setInterval(async () => {
    const {balance} = await getBalance(receivingAddress)
    dispatch(setBalance(balance))
  }, interval)
}

export default watchWallet
