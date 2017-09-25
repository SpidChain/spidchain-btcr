import {getBalance} from 'utils/txUtils'
import {setBalance} from 'redux/actions'
//
// Update wallet balance once every 10 minutes
console.log('walletUpdateInterval', process.env.BALANCE)
// TODO: does not read from process.env
const walletUpdateInterval = process.env.BALANCE || 600000

const watchWallet = dispatch => ({receivingAddress}) => {
  getBalance(receivingAddress)
    .then(balance => {
      return dispatch(setBalance(balance))
    }).catch(err => {
      console.warn(err)
    })
  const handle = setInterval(async () => {
    try {
      const balance = await getBalance(receivingAddress)
      dispatch(setBalance(balance))
    } catch (err) {
      console.warn(err)
    }
  }, walletUpdateInterval)
}

export default watchWallet
