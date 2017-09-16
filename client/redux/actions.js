import _ from 'lodash'

import {
  GET_RECEIVED_REQUESTS,
  GET_SENT_REQUESTS,
  GET_DID,
  GET_OTHERS_CLAIMS,
  GET_OWN_CLAIMS,
  GET_WALLET,
  SET_BALANCE,
  SET_GOT_COINS,
  GET_CLAIMS,
  GET_MY_KNOWS_CLAIMS
} from 'redux/constants'
import db from 'db'
import {insertClaim, updateClaim} from 'dbUtils'
import verifyWithOwnerKey256 from 'bitcoin/verify'
import {verifyClaim} from 'bitcoin/verifyClaim'

export const setGotCoins = () => {
  return {
    type: SET_GOT_COINS
  }
}
export const setBalance = balance => {
  return {
    type: SET_BALANCE,
    payload: balance
  }
}

export const getWallet = () => dispatch => {
  const walletP = db.wallet.toArray().then(data => {
    return _.head(data) || null
  })
  return dispatch({
    type: GET_WALLET,
    payload: walletP
  })
}

export const getDid = () => (dispatch) => {
  const didP = db.did.toArray().then(data => {
    const didObj = _.head(data)

    return didObj
  })
  return dispatch({
    type: GET_DID,
    payload: didP
  })
}

export const getReceivedRequests = () => (dispatch) => {
  const receivedRequestsP = db.receivedRequests.where({verified: 'false'}).toArray()
  return dispatch({
    type: GET_RECEIVED_REQUESTS,
    payload: receivedRequestsP
  })
}

export const getSentRequests = () => (dispatch) => {
  const sentRequestsP = db.sentRequests.toArray()
  return dispatch({
    type: GET_SENT_REQUESTS,
    payload: sentRequestsP
  })
}

export const getOwnClaims = () => (dispatch, getState) => {
  // TODO improve
  const did = getState().did.did
  const ownClaimsP = db.claims.where({subject: did}).toArray()
  return dispatch({
    type: GET_OWN_CLAIMS,
    payload: ownClaimsP
  })
}

export const getOthersClaims = () => (dispatch, getState) => {
  const did = getState().did.did
  const othersClaimsP = db.claims.where('subject').notEqual(did).toArray()
  return dispatch({
    type: GET_OTHERS_CLAIMS,
    payload: othersClaimsP
  })
}

export const addReceivedRequest = ({claim, senderDid}) => (dispatch, getState) => {
  const did = getState().did.did
  insertClaim({
    subjects: [senderDid, did],
    type: 'KNOWS',
    signers: [senderDid, did],
    requests: [],
    claim
  })
    .then(() => dispatch(getClaims))
    .then(() => dispatch(getMyKnowsClaims))
    .catch((e) => console.error('addReceivedRequest:', e))
}

export const addClaimSignatureRequest = ({senderDid, claimId, claim}) => (dispatch, getState) => {
  const did = getState().did.did
  const payload = {subject: senderDid, claimId, signedDocument: JSON.parse(claim), signers: []}
  const claimSignatureP = db.claims.add(payload)
    .then(() => {
      return dispatch(getOthersClaims(did))
    })
    .catch(e => {
      console.error('addClaimSignatureRequest:', e)
    })
}

export const checkOwnershipProof = ({_id, receiverDid, signature}) => (dispatch) => {
  db.sentRequests.get({receiverDid})
    .then(({_id, nonce}) => {
      const verified = verifyWithOwnerKey256({DID: receiverDid, msg: nonce, sig: signature})
      return {verified, nonce}
    })
    .then(({verified, nonce}) => {
      if (verified) {
        return db.sentRequests.where('nonce').equals(nonce).modify({verified: 'true'})
      } else {
        return db.sentRequests.where('nonce').equals(nonce).modify({verified: 'fail'})
      }
    })
    .then(() => {
      return dispatch(getSentRequests())
    })
    .catch(e => {
      console.error('addReceivedRequest:', e)
    })
}

export const addClaimSignature =
  ({senderDid, claimId, claimSignature}) => (dispatch, getState) => {
    const claimP = db.claims.get(claimId)
    const verifyClaimP = claimP.then(({signedDocument}) => {
      const newDocument = {
        ...signedDocument,
        'https://w3id.org/security#signature': claimSignature
      }
      const verified = verifyClaim({signedDocument: newDocument, signerDid: senderDid})
      return verified
    })
    Promise.all([claimP, verifyClaimP])
      .then(([claim, verified]) => {
        if (verified) {
          const {signedDocument, signers} = claim
          const signatures = signedDocument['https://w3id.org/security#signature']
          if (!_.isArray(signatures)) {
            const newSignatures = [
              signedDocument['https://w3id.org/security#signature'],
              claimSignature
            ]
            signedDocument['https://w3id.org/security#signature'] = newSignatures
          } else {
            signedDocument['https://w3id.org/security#signature'].push(claimSignature)
          }
          const newSigners = _.map(signers, ({did, status}) => {
            return did === senderDid
              ? {did, status: 'signed'}
              : {did, status}
          })
          db.claims.update(claimId, {signedDocument, signers: newSigners})
        }
      })
      .then(() => {
        return dispatch(getOwnClaims())
      })
  }

export const getClaims = () => (dispatch, getState) => dispatch({
  type: GET_CLAIMS,
  payload: db.claims.toArray()
})

export const getMyKnowsClaims = () => (dispatch, getState) => {
  const did = getState().did.did
  const myKnowsClaimsP = db.claims.where({subjects: did}).toArray()
  return dispatch({
    type: GET_MY_KNOWS_CLAIMS,
    payload: myKnowsClaimsP
  })
}

export const addClaim = ({
  senderDid,
  claim,
  type,
  subjects
}) => (dispatch, getState) => updateClaim(claim, subjects, type)
.then(() => dispatch(getClaims()))
.then(() => dispatch(getMyKnowsClaims()))
