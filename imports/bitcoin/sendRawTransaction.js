import {Meteor} from 'meteor/meteor'

import '/imports/methods/bitcoin'

export default (rawTx) => Meteor.callPromise('bitcoin', 'sendRawTransaction', rawTx)
