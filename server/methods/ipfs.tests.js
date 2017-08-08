/* global describe, it */

import {assert} from 'chai'
import {Meteor} from 'meteor/meteor'
import '/imports/methods/ipfs'

// global.Buffer = global.Buffer || require('buffer').Buffer

if (Meteor.isClient) {
  describe('ipfs.add', function () {
    it('should return an hash pointing to the file', async function () {
      const [{hash}] = await Meteor.callPromise('ipfs.add', 'Hello world')
      assert.isString(hash, 'The hash is a string')
    })
  })

  describe('ipfs.get', function () {
    it('should return the same file we have added', async function () {
      const testString = 'Hello world'
      const [{hash}] = await Meteor.callPromise('ipfs.add', testString)
      const result = await Meteor.callPromise('ipfs.get', hash)
      assert.isString(result, 'The result is a string')
      assert.equal(result, testString, 'The result is the string added')
    })
  })
}
