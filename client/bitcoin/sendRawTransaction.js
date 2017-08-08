//import {Meteor} from 'meteor/meteor'

//import '/imports/methods/bitcoin'
import 'bitcoin/bitcoinRpc'

//export default (rawTx) => Meteor.callPromise('bitcoin', 'sendRawTransaction', rawTx)
export default (rawTx) => bitcoinRpc('sendRawTransaction', rawTx)
