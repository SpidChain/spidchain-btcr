import _ from 'lodash'
import {
  GET_RECEIVED_REQUESTS,
  GET_SENT_REQUESTS,
  GET_DID,
  GET_WALLET,
  START_LOADING,
  STOP_LOADING
} from 'redux/constants'
import db from 'db'

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

export const getDid = () => (dispatch, getState) => {
  dispatch({
    type: START_LOADING
  })
  db.did.toArray().then(data => {
    dispatch({
      type: GET_DID,
      payload: _.head(data) || null
    })
    console.log(getState())
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
  db.sentRequests.where({verified: 'false'}).toArray().then(data => {
    dispatch({
      type: GET_SENT_REQUESTS,
      payload: data
    })
    dispatch({
      type: STOP_LOADING
    })
  })
}
