/* global bcoin */

import {Meteor} from 'meteor/meteor'
import React from 'react'
import ReactDOM from 'react-dom'

import App from '/imports/ui/App'

const network = Meteor.settings.public.network === 'testnet'
  ? 'testnet'
  : 'main'

Meteor.startup(() => {
//  bcoin.set(network)
  bcoin.workerpool.enable()
  const node = new bcoin.fullnode({
    prune: true,
//    network,
    db: 'memory',
    port: 8080
  })

  const wdb = node.use(bcoin.walletplugin)

  node.pool.on('peer', (peer) => {
    console.log('Peer:', peer)
  })

  node.mempool.on('block', (block) => {
    console.log('Block:', block)
  })

  node.mempool.on('tx', (tx) => {
    console.log('Tx:', tx)
  })

  node.on('error', (err) => {
    console.log('Err:', err)
  })

  node.open()
    .then(() => node.connect())
    .then(() => {
      node.on('connect', (entry, block) => {
        console.log('%s (%d) added to chain.', entry.rhash(), entry.height)
      })

      node.startSync()

      wdb.primary.on('balance', () => {
        console.log('Balance:', wdb.primary)
      })
    })
    .catch((err) => {
      throw err
    })

//  const chain = new bcoin.chain({
//    db: 'memory',
//    spv: true
//  })

//  const pool = new bcoin.pool({
//    chain: chain,
//    spv: true,
//    maxPeers: 8
//  })

//  const walletdb = new bcoin.walletdb({ db: 'memory' })
/*
  pool.open().then(() => {
    return walletdb.open()
  }).then(() => {
    return walletdb.create()
  }).then((wallet) => {
    console.log('Created wallet with address %s', wallet.getAddress('base58'))

    // Add our address to the spv filter.
    pool.watchAddress(wallet.getAddress())

    // Connect, start retrieving and relaying txs
    pool.connect().then(() => {
      console.log('connected to pool');
      // Start the blockchain sync.
      pool.startSync()

      pool.on('peer', (peer) => {
        console.log('Peer:', peer);
      })

      pool.on('tx', (tx) => {
        console.log('Tx:', tx);
        walletdb.addTX(tx)
      })

      wallet.on('balance', (balance) => {
        console.log('Balance updated.')
        console.log(bcoin.amount.btc(balance.unconfirmed))
      })
    })
  })
*/
  ReactDOM.render(<App />, document.getElementById('app'))
})
