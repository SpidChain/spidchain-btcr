/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'

import {
  createTestDID,
  createTestHDWallet,
  getFirstOwnerPubKey,
  testRecoveryAddress
} from '/imports/bitcoin/testUtils'
import {resolveDID} from './resolveDID'
import sendRawTransaction from '/imports/bitcoin/sendRawTransaction'

global.Buffer = global.Buffer || require('buffer').Buffer
const {networks} = require('bitcoinjs-lib')

const network = networks[Meteor.settings.public.network]

if (Meteor.isClient) {
  describe('resolveDID', function () {
    it('it should resolve a DDO from a DID', async function () {
      const recoveryAddress = testRecoveryAddress
      const walletRoot = createTestHDWallet(network)
      const didTx = await createTestDID({walletRoot, network, recoveryAddress})
      const didTxId = await sendRawTransaction(didTx.toHex())
      const ddo = await resolveDID(didTxId)

      assert.equal(ddo['@context'], 'https://spidchain.com/did/v1',
        'DDO must have the right context')

      const pubKey = getFirstOwnerPubKey(walletRoot)
      assert.equal(pubKey, ddo.owner[0].publicKey,
        'the owner key in the transaction must be equal to the one provided')
    })
  })
}
