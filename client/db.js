import Dexie from 'dexie'

const db = new Dexie('btcr')
db.version(1).stores({
  sentRequests: '_id, receiverDid, verified, nonce',
  receivedRequests: '_id, senderDid, verified, nonce'
})
window.db = db
window.cleardb = () => {
  db.sentRequests.clear()
  db.receivedRequests.clear()
}
window.showDb = () => {
  db.sentRequests.toArray().then(a => console.log('sentRequests: \n', a))
  db.receivedRequests.toArray().then(a => console.log('receivedRequests: \n', a))
}

export default db
