import jsonld from 'jsonld'
import jsigs from 'jsonld-signatures'

import hashClaim from 'bitcoin/hashClaim'
import verifyClaim from 'bitcoin/verifyClaim'
import db from 'db'

const context = jsigs.SECURITY_CONTEXT_URL
const signature = 'https://w3id.org/security#signature'
const creator = 'http://purl.org/dc/terms/creator'
const created = 'http://purl.org/dc/terms/created'

export const insertClaim = async (claim, subjects, type, signers) => {
  const hash = await hashClaim(claim)
  return db.claims.add({hash, subjects, type, signers, requests: [], claim})
}

export const updateClaim = async (claim, subjects, type) => {
  const hash = await hashClaim(claim)
  const prevEntry = await db.claims.get(hash)
  const sigs1 = await extractSigs(prevEntry.claim)
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
    newClaim
  })
}

const extractSigs = async (claim) => {
  // TODO: check context
  const expanded = await jsonld.promises.compact(claim, context)
  const sigs = expanded.signature
  return Array.isArray(sigs)
    ? sigs
    : !sigs
      ? []
      : [sigs]
}

const getSigners = (sigs) => sigs
  .map(sig => {
    const did = sig[creator].slice(9)  // strip 'did:btcr:'
    return did
  })
  .sort()

const sortSigs = async (sigs) => {
  sigs.sort((a, b) => {
    const aTime = a[created]['@value']
    const bTime = b[created]['@value']
    return aTime.localeCompare(bTime)
  })
}

const removeUnverified = async (sigs, claim) => {
  const signedClaim = {...claim, [signature]: sigs}
  return sigs.map(async sig => {
    const did = sig[creator].slice(9)  // strip 'did:btcr:'
    const verified = await verifyClaim(signedClaim, did)
    return {sig, verified}
  })
  .filter(({verified}) => verified)
  .map(({sig}) => sig)
}

const mergeSigs = async (sigs1, sigs2, claim) => {
  const sigs = sigs1.concat(sigs2)
  const verifiedSigs = await removeUnverified(sigs)
  return sortSigs(verifiedSigs)
}
