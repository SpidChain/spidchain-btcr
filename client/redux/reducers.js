import {HDNode, networks} from 'bitcoinjs-lib'
import {
  GET_SENT_REQUESTS_FULFILLED,
  GET_SENT_REQUESTS_PENDING,
  GET_RECEIVED_REQUESTS_FULFILLED,
  GET_RECEIVED_REQUESTS_PENDING,
  GET_DID_FULFILLED,
  GET_DID_PENDING,
  GET_OTHERS_CLAIMS_FULFILLED,
  GET_OTHERS_CLAIMS_PENDING,
  GET_OWN_CLAIMS_FULFILLED,
  GET_OWN_CLAIMS_PENDING,
  GET_WALLET_FULFILLED,
  GET_WALLET_PENDING,
  SET_BALANCE,
  SET_GOT_COINS,
  GET_MY_KNOWS_CLAIMS_FULFILLED,
  GET_MY_KNOWS_CLAIMS_PENDING
} from 'redux/constants'

const network = networks[process.env.network]

export const gotCoins = function (state = null, {type}) {
  switch (type) {
    case SET_GOT_COINS: {
      window.localStorage.setItem('gotCoins', 'true')
      return true
    }
    default: return state
  }
}

export const receivedRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_RECEIVED_REQUESTS_FULFILLED: {
      return {loading: false, data: payload}
    }

    case GET_RECEIVED_REQUESTS_PENDING: return {loading: true}

    default: return state
  }
}

export const sentRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_SENT_REQUESTS_FULFILLED: {
      return {loading: false, data: payload}
    }

    case GET_SENT_REQUESTS_PENDING: return {loading: true}

    default: return state
  }
}

export const did = function (state = null, {type, payload}) {
  switch (type) {
    case GET_DID_FULFILLED: {
      return {loading: false, ...payload}
    }

    case GET_DID_PENDING: return {loading: true}

    default: return state
  }
}

export const balance = function (state = null, {type, payload}) {
  switch (type) {
    case SET_BALANCE: {
      return payload
    }
    default: return state
  }
}

export const wallet = (state = null, {type, payload}) => {
  switch (type) {
    case GET_WALLET_FULFILLED: {
      // Wallet not present
      if(!payload) {
        return { loading: false }
      }
      // Wallet present
      const root = payload.root
      const wallet = HDNode.fromBase58(root, network)
      const fundingKeyPair = wallet.derivePath("m/44'/0'/0'/0/0").keyPair
      const receivingAddress = fundingKeyPair.getAddress()
      const ownerKeyPair = wallet.derivePath("m/44'/0'/2'/0/0")
      const ownerPubKey = ownerKeyPair.getPublicKeyBuffer().toString('hex')
      const recoveryKeyPair = wallet.derivePath("m/44'/0'/3'/0/0")
      const recoveryAddress = recoveryKeyPair.getAddress()
      return {
        root: wallet,
        fundingKeyPair,
        receivingAddress,
        ownerKeyPair,
        ownerPubKey,
        recoveryAddress,
        loading: false
      }
    }

    case GET_WALLET_PENDING: {
      return {loading: true}
    }

    default: return state
  }
}

export const ownClaims = function (state = null, {type, payload}) {
  switch (type) {
    case GET_OWN_CLAIMS_FULFILLED: {
      return {loading: false, data: payload}
    }

    case GET_OWN_CLAIMS_PENDING: return {loading: true}

    default: return state
  }
}

export const othersClaims = (state = null, {type, payload}) => {
  switch (type) {
    case GET_OTHERS_CLAIMS_FULFILLED: {
      return {loading: false, data: payload}
    }

    case GET_OTHERS_CLAIMS_PENDING: return {loading: true}

    default: return state
  }
}

export const myKnowsClaims = (state = null, {type, payload}) => {
  switch (type) {
    case GET_MY_KNOWS_CLAIMS_FULFILLED:
      return {loading: false, data: payload}

    case GET_MY_KNOWS_CLAIMS_PENDING:
      return {loading: true}

    default:
      return state
  }
}
