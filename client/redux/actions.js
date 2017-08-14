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
  db.receivedRequests.where({verified: 'false'}).toArray().then(data => {
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
  db.sentRequests.where({verified: 'false'}).toArray().then(data => {
    dispatch({
      type: GET_SENT_REQUESTS,
      payload: {
        loading: false,
        data}
    })
  })
}
