import http from 'http'
import {Meteor} from 'meteor/meteor'
//import socketIO from 'socket.io'

import '/imports/methods/bitcoin'
import '/imports/methods/blockchaininfo'
import '/imports/methods/blockexplorer'
import '/imports/methods/ipfs'
import '/imports/methods/Messaging'
import '/imports/methods/resolveDDO'
import WSProxy from '/imports/wsproxy'

Meteor.startup(() => {
  const server = http.createServer()
//  console.log(server);
//  const io = socketIO(server)

  const proxy = new WSProxy({
    ports: [8333, 18333, 18444, 28333, 28901]
  })

  proxy.on('error', (err) => {
    console.error(err.stack + '')
  })

  proxy.attach(server)
  server.listen(8333)
})
