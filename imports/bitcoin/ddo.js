export default ({txId, pubKeys}) => {
  // const did = `did:btcr:${txId}`
  const did = 'did:btcr:'
  const owner = pubKeys.map((pk, i) => ({
    id: `${did}#key-${i + 1}`,
    type: ['CryptographicKey', 'EcDsaPublicKey'],
    curve: 'secp256k1',
    publicKey: pk
  }))

  return {
    '@context': 'https://spidchain.com/did/v1',
    id: did,
    owner
  }
}
