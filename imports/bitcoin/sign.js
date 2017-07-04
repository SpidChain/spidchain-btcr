export default ({ownerAccount, walletRoot, msgHash, rotationIx}) => {
  const ownerRoot = walletRoot.derivePath("m/44'/0'")
    .deriveHardened(ownerAccount)
    .derive(0)
  return ownerRoot.derive(rotationIx)
    .sign(Buffer.from(msgHash, 'hex')).toDER().toString('hex')
}
