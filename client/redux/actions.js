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
import {addSignature, insertClaim, upsertClaim} from 'dbUtils'

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
  const ownClaimsP = db.claims.where({subjects: did}).toArray()
  return dispatch({
    type: GET_OWN_CLAIMS,
    payload: ownClaimsP
  })
}

export const getOthersClaims = () => (dispatch) => {
  const othersClaimsP = db.sigRequests.toArray()
  return dispatch({
    type: GET_OTHERS_CLAIMS,
    payload: othersClaimsP
  })
}

export const addKnowsClaim = ({claim, senderDid}) => (dispatch, getState) => {
  const did = getState().did.did
  return insertClaim(
    claim,
    [senderDid, did],
    'KNOWS',
    [senderDid, did]
  )
    .then(() => dispatch(getClaims()))
    .then(() => dispatch(getMyKnowsClaims()))
    .catch((e) => console.error('addKnowsClaim:', e))
}

export const addClaimSignatureRequest = ({senderDid, claimId, claim}) => (dispatch) => {
  const payload = {
    hash: claimId,
    subjects: [senderDid],
    signers: [],
    signed: false,
    claim: JSON.parse(claim)
  }
  return db.sigRequests.add(payload)
    .then(() => dispatch(getOthersClaims()))
    .catch(e => {
      console.error('addClaimSignatureRequest:', e)
    })
}

export const addClaimSignature = ({claimId, claimSignature}) => (dispatch) =>
  addSignature(claimId, claimSignature)
    .then(() => dispatch(getOwnClaims()))

export const getClaims = () => (dispatch, getState) => dispatch({
  type: GET_CLAIMS,
  payload: db.claims.toArray()
})

export const getMyKnowsClaims = () => (dispatch, getState) => {
  const did = getState().did.did
  const myKnowsClaimsP = db.claims.where({subjects: did, type: 'KNOWS'}).toArray()
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
}) => (dispatch, getState) => upsertClaim(claim, subjects, type)
.then(() => dispatch(getClaims()))
.then(() => dispatch(getMyKnowsClaims()))
