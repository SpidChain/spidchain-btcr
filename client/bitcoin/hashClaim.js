import {crypto} from 'bitcoinjs-lib'
import jsonld from 'jsonld'

const hashClaim = (claim) =>
  jsonld.promises.expand(claim)
    .then(([expanded]) => {
      delete expanded['https://w3id.org/security#signature']
      return jsonld.promises.normalize(
        [expanded],
        {
          algorithm: 'URDNA2015',
          format: 'application/nquads'
        }
      )
    })
    .then((normalized) => crypto.sha256(normalized).toString('hex'))

export default hashClaim
