import {crypto} from 'bitcoinjs-lib'
import jsonld from 'jsonld'
import jsigs from 'jsonld-signatures'

const hashClaim = (claim) =>
  jsonld.promises.compact(claim, jsigs.SECURITY_CONTEXT_URL)
    .then((compacted) => {
      delete compacted.signature
      return jsonld.promises.normalize(
        compacted,
        {
          algorithm: 'URDNA2015',
          format: 'application/nquads'
        }
      )
    })
    .then((normalized) => crypto.sha256(normalized).toString('hex'))

export default hashClaim
