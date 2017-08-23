import _ from 'lodash'
import {
  GET_RECEIVED_REQUESTS,
  GET_SENT_REQUESTS,
  GET_DID,
  GET_OTHERS_CLAIMS,
  GET_OWN_CLAIMS,
  GET_WALLET,
  START_LOADING,
  STOP_LOADING,
  SET_BALANCE
} from 'redux/constants'
import db from 'db'

import {ownershipRequestsSub, ownershipProofsSub, claimSignatureRequestsSub} from 'redux/subscriptions'

export const getBalance = balance => {
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

// TODO: get did from localStorage
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
