import jsonld from 'jsonld'
import _ from 'lodash'

import hashClaim from 'bitcoin/hashClaim'
import verifyClaim from 'bitcoin/verifyClaim'
import db from 'db'

const signature = 'https://w3id.org/security#signature'
const creator = 'http://purl.org/dc/terms/creator'
const created = 'http://purl.org/dc/terms/created'

export const insertClaim = async (claim, subjects, type, signers) => {
  const hash = await hashClaim(claim)
  return db.claims.add({hash, subjects, type, signers, requests: [], claim})
}

export const upsertClaim = async (claim, subjects, type) => {
  const hash = await hashClaim(claim)
  const prevEntry = await db.claims.get(hash)
  const sigs1 = prevEntry
    ? await extractSigs(prevEntry.claim)
    : []
  const sigs2 = await extractSigs(claim)
  const sigs = await mergeSigs(sigs1, sigs2, claim)
  const signers = getSigners(sigs)
  const newClaim = {...claim, [signature]: sigs}
  return db.claims.put({
    hash,
    subjects,
    type,
    signers,
    requests: prevEntry.requests,
    claim: newClaim
  })
}

const extractSigs = async (claim) => {
  const [expanded] = await jsonld.promises.expand(claim)
  return expanded[signature]
}

const getSigners = (sigs) => sigs
  .map(sig => {
    const did = sig[creator][0]['@id'].slice(9)  // strip 'did:btcr:'
    return did
  })
  .sort()

const sortSigs = (sigs) => _.sortBy(sigs, [(obj) => obj[created][0]['@value']])

const removeUnverified = async (sigs, claim) => {
  const signedClaim = {...claim, [signature]: sigs}
  return (await Promise.all(sigs.map(async sig => {
    const did = sig[creator][0]['@id'].slice(9)  // strip 'did:btcr:'
    const verified = await verifyClaim({signedDocument: signedClaim, signerDid: did})
    return {sig, verified}
  })))
  .filter(({verified}) => verified)
  .map(({sig}) => sig)
}

const mergeSigs = async (sigs1, sigs2, claim) => {
  const sigs = sigs1.concat(sigs2)
  const dedupedSigs = _.uniqWith(sigs, _.isEqual)
  const verifiedSigs = await removeUnverified(dedupedSigs, claim)
  return sortSigs(verifiedSigs)
}
