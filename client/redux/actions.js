import {
  GET_RECEIVED_REQUESTS,
  GET_SENT_REQUESTS
} from 'redux/constants'
import db from 'db'

window.db = db

export const getReceivedRequests = () => (dispatch) => {
  dispatch({
    type: GET_RECEIVED_REQUESTS,
    payload: {loading: true}
  })
  // this should be a query which filterd {verified: true}
  db.receivedRequests.toArray().then(data => {
    dispatch({
      type: GET_RECEIVED_REQUESTS,
      payload: {
        loading: false,
        data
      }
    })
  })
}

export const getSentRequests = () => (dispatch) => {
  dispatch({
    type: GET_SENT_REQUESTS,
    payload: {loading: true}
  })
  // this should be a query which filterd {verified: true}
  db.sentRequests.toArray().then(data => {
    dispatch({
      type: GET_SENT_REQUESTS,
      payload: {
        loading: false,
        data}
    })
  })
}

/*
export function deleteRequest (id) {
  return (dispatch) => {
    db.table('todos')
      .delete(id)
      .then(() => {
        dispatch({
          type: DELETE_REQUEST,
          payload: id
        })
      })
  }
}

export function updateRequest (id, done) {
  return (dispatch) => {
    db.table('todos')
      .update(id, { done })
      .then(() => {
        dispatch({
          type: UPDATE_REQUEST,
          payload: { id, done }
        })
      })
  }
}
*/
