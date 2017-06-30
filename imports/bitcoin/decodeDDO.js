global.Buffer = global.Buffer || require('buffer').Buffer
const {address} = require('bitcoinjs-lib')

export default (tx) => {
  const txId = tx.getId()
  const [signOut] = tx.outs

  return {
    '@context': 'https://spidchain.com/did/v1',
    id: `did:btcr:${txId}`,
    owner: [{
      id: `did:btcr:${txId}#1`,
      type: ['CryptographicKey', 'EdDsaPublicKey'],
      curve: 'secp256k1',
      address: address.fromOutputScript(signOut.script)
    }],
    control: [{
      type: 'OrControl',
      signer: [`did:btcr:${txId}`]
    }]
  }
}
