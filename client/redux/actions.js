import _ from 'lodash'

import {
  GET_RECEIVED_REQUESTS,
  GET_SENT_REQUESTS,
  GET_DID,
  GET_OTHERS_CLAIMS,
  GET_OWN_CLAIMS,
  GET_WALLET,
  SET_BALANCE
} from 'redux/constants'
import db from 'db'
import verifyWithOwnerKey256 from 'bitcoin/verify'

/*
import {
  ownershipRequestsSub,
  ownershipProofsSub,
  claimSignatureRequestsSub
} from 'redux/subscriptions'
*/

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

/*
export const getWallet = () => dispatch => {
  dispatch({
    type: START_LOADING
  })
  db.wallet.toArray()
    .then(data => {
      dispatch({
        type: GET_WALLET,
        payload: _.head(data) || null
      })
      dispatch({
        type: STOP_LOADING
      })
    }).catch(() => dispatch({
      type: STOP_LOADING
    }))
}
*/

export const getDid = () => (dispatch) => {
  const didP = db.did.toArray().then(data => {
    const didObj = _.head(data)

    return didObj
  })
  /*
    if (didObj && didObj.did) {
      ownershipRequestsSub(didObj.did, dispatch)
      ownershipProofsSub(didObj.did, dispatch)
      claimSignatureRequestsSub(didObj.did, dispatch)
    }
  })
  */
  return dispatch({
    type: GET_DID,
    payload: didP
  })
}

/*
export const getDid = () => (dispatch, getState) => {
  dispatch({
    type: START_LOADING
  })
  db.did.toArray().then(data => {
    const didObj = _.head(data)
    dispatch({
      type: GET_DID,
      payload: didObj || null
    })
    if (didObj && didObj.did) {
      ownershipRequestsSub(didObj.did, dispatch)
      ownershipProofsSub(didObj.did, dispatch)
      claimSignatureRequestsSub(didObj.did, dispatch)
    }
    dispatch({
      type: STOP_LOADING
    })
  })
}
*/

export const getReceivedRequests = () => (dispatch) => {
  const receivedRequestsP = db.receivedRequests.where({verified: 'false'}).toArray()
  return dispatch({
    type: GET_RECEIVED_REQUESTS,
    payload: receivedRequestsP
  })
}

/*
export const getReceivedRequests = () => (dispatch) => {
  dispatch({
    type: START_LOADING
  })
  db.receivedRequests.where({verified: 'false'}).toArray().then(data => {
    dispatch({
      type: GET_RECEIVED_REQUESTS,
      payload: data
    })
    dispatch({
      type: STOP_LOADING
    })
  })
}
*/

export const getSentRequests = () => (dispatch) => {
  const sentRequestsP = db.sentRequests.toArray()
  return dispatch({
    type: GET_SENT_REQUESTS,
    payload: sentRequestsP
  })
}

/*
export const getSentRequests = () => (dispatch) => {
  dispatch({
    type: START_LOADING
  })
  db.sentRequests.toArray().then(data => {
    dispatch({
      type: GET_SENT_REQUESTS,
      payload: data
    })
    dispatch({
      type: STOP_LOADING
    })
  })
}

*/
// TODO: get did from localStorage
export const getOwnClaims = () => (dispatch, getState) => {
  // TODO improve
  const did = getState().did.did
  const ownClaimsP = db.claims.where({subject: did}).toArray()
  return dispatch({
    type: GET_OWN_CLAIMS,
    payload: ownClaimsP
  })
}

/*
export const getOwnClaims = (did) => (dispatch) => {
  dispatch({
    type: START_LOADING
  })
  db.claims.where({subject: did}).toArray()
    .then((data) => {
      dispatch({
        type: GET_OWN_CLAIMS,
        payload: data
      })
      dispatch({
        type: STOP_LOADING
      })
    })
}
*/

export const getOthersClaims = () => (dispatch, getState) => {
  const did = getState().did.did
  const othersClaimsP = db.claims.where('subject').notEqual(did).toArray()
  return dispatch({
    type: GET_OTHERS_CLAIMS,
    payload: othersClaimsP
  })
}

/*
export const getOthersClaims = (did) => (dispatch) => {
  dispatch({
    type: START_LOADING
  })
  db.claims.where('subject').notEqual(did).toArray()
    .then((data) => {
      dispatch({
        type: GET_OTHERS_CLAIMS,
        payload: data
      })
      dispatch({
        type: STOP_LOADING
      })
    })
}
*/

// NEW

export const addReceivedRequest = ({_id, senderDid, nonce}) => (dispatch) => {
  const payload = {_id, senderDid, nonce, verified: 'false'}
  db.receivedRequests.add(payload)
    .then(() => {
      return dispatch(getReceivedRequests())
    }).catch(e => {
      console.error('addReceivedRequest:', e)
    })
}

export const addClaimSignatureRequest = ({senderDid, claim}) => (dispatch, getState) => {
  const did = getState().did.did
  const payload = {subject: senderDid, signedDocument: claim, signers: []}
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
      return verifyWithOwnerKey256({DID: receiverDid, msg: nonce, sig: signature})
    })
    .then(p => {
      if (p) {
        return db.sentRequests.update({_id}, {verified: 'true'})
      } else {
        return db.sentRequests.update({_id}, {verified: 'fail'})
      }
    })
    .then(() => {
      return dispatch(getSentRequests())
    })
    .catch(e => {
      console.error('addReceivedRequest:', e)
    })
}
