import Dexie from 'dexie'

const db = new Dexie('btcr')
db.version(1).stores({
  sentRequests: '_id, receiverDid, nonce, verified',
  receivedRequests: '_id, senderDid, nonce, verified'
})
window.db = db
window.cleardb = () => {
  db.sentRequests.clear()
  db.receivedRequests.clear()
}
window.showDb = () => {
  db.sentRequests.toArray().then(a => console.log(a))
  db.receivedRequests.toArray().then(a => console.log(a))
}

export default db
