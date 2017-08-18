import Dexie from 'dexie'

const db = new Dexie('btcr')
db.version(1).stores({
  sentRequests: '_id, receiverDid, verified, nonce',
  receivedRequests: '_id, senderDid, verified, nonce',
  did: 'txId1',
  wallet: '++id',
  claims: '++_id, subject, signed'
})

window.db = db

window.cleardb = () => {
  db.sentRequests.clear()
  db.receivedRequests.clear()
  db.did.clear()
  db.wallet.clear()
}

window.safeClear = () => {
  db.sentRequests.clear()
  db.receivedRequests.clear()
  db.claims.clear()
}
window.showDb = () => {
  db.sentRequests.toArray().then(a => console.log('sentRequests: \n', a))
  db.receivedRequests.toArray().then(a => console.log('receivedRequests: \n', a))
  db.did.toArray().then(a => console.log('did: \n', a))
  db.wallet.toArray().then(a => console.log('wallet : \n', a))
  db.claims.toArray().then(a => console.log('claims : \n', a))
}

export default db
