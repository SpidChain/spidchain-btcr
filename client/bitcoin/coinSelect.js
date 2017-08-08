import coinSelect from 'coinselect'
import sb from 'satoshi-bitcoin'

export default (utxos, ...args) => {
  const utxos1 = utxos.map(utxo => ({
    ...utxo,
    value: sb.toSatoshi(utxo.amount)
  }))
  return coinSelect(utxos1, ...args)
}
