import {HDNode, networks} from 'bitcoinjs-lib'
import {
  GET_SENT_REQUESTS,
  GET_RECEIVED_REQUESTS,
  GET_DID,
  GET_OTHERS_CLAIMS,
  GET_OWN_CLAIMS,
  GET_WALLET,
  START_LOADING,
  STOP_LOADING
} from 'redux/constants'

const network = networks[process.env.network]

export const loading = function (state = false, {type}) {
  switch (type) {
    case START_LOADING: return true

    case STOP_LOADING: return false

    default: return state
  }
}

export const receivedRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_RECEIVED_REQUESTS: return payload

    default: return state
  }
}

export const sentRequests = function (state = null, {type, payload}) {
  switch (type) {
    case GET_SENT_REQUESTS: return payload

    default: return state
  }
}

export const did = function (state = null, {type, payload}) {
  switch (type) {
    case GET_DID: return payload

    default: return state
  }
}

export const wallet = (state = null, {type, payload}) => {
  switch (type) {
    case GET_WALLET: {
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
        recoveryAddress
      }
    }

    default: return state
  }
}

export const ownClaims = function (state = null, {type, payload}) {
  switch (type) {
    case GET_OWN_CLAIMS: return payload

    default: return state
  }
}

export const othersClaims = (state = null, {type, payload}) => {
  switch (type) {
    case GET_OTHERS_CLAIMS: return payload

    default: return state
  }
}
