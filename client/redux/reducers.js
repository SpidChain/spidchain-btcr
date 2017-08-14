import {
  GET_SENT_REQUESTS,
  GET_RECEIVED_REQUESTS
} from 'redux/constants'

export const receivedRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_RECEIVED_REQUESTS: return payload

    default: return state
  }
}

export const sentRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_SENT_REQUESTS: return payload

      /*
    case UPDATE_REQUEST: {
      const todoToUpdate = state.todos.find((todo) => todo.id === payload.id)
      return { todos: [
        ...state.todos.filter((todo) => todo.id !== payload.id),
        Object.assign({}, todoToUpdate, { done: payload.done })
      ] }
    }

    case DELETE_REQUEST: return { todos: state.todos.filter((todo) => todo.id !== payload) }
    */
    default: return state
  }
}
