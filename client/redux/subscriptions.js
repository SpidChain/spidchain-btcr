import client from 'apollo'
import _ from 'lodash'
import gql from 'graphql-tag'

import signClaim from 'bitcoin/signClaim'
import verifyClaim from 'bitcoin/verifyClaim'
import db from 'db'
import {
  addClaimSignatureRequest,
  addReceivedRequest,
  checkOwnershipProof,
  addClaimSignature,
  addClaim
} from 'redux/actions'

// Listening on ownership proof requests

const getOwnershipRequests = gql`
  query getOwnershipRequests($receiverDid: String) {
     getOwnershipRequests(receiverDid: $receiverDid) {
       _id
       claim
       senderDid
       nonce
    }
  }
`

const setReceived = gql`
  mutation setReceived($_id: String) {
     setReceived(_id: $_id) {
       received
    }
  }
`

const sendClaim = gql`
  mutation sendClaim($senderDid: String, $receiverDid: String, $claim: String, $claimType: String, $subjects: [String]) {
    sendClaim(senderDid: $senderDid, receiverDid: $receiverDid, claim: $claim, claimType: $claimType, subjects: $subjects) {
       _id
    }
  }
`

const ownershipRequestsObs = (did) => client.watchQuery({
  query: getOwnershipRequests,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const ownershipRequestsSub = (did, dispatch, walletRoot) => ownershipRequestsObs(did).subscribe({
  next: ({data: {getOwnershipRequests}}) => {
    _.each(getOwnershipRequests, async ({_id, claim, senderDid, nonce}) => {
      // TODO: fix this?
      const n = await db.nonces.get({nonce: parseInt(nonce, 16)})
      debugger
      if (!_.isUndefined(n)) {
        const claimObj = JSON.parse(claim)
        debugger
        // TODO: verify with did on claim
        if (verifyClaim({signedDocument: claimObj, signerDid: senderDid})) {
          // sign and send back
          const rotationIx = 0
          const controlAccount = Number(process.env.controlAccount)
          const ownerRoot = walletRoot.derivePath("m/44'/0'")
            .deriveHardened(controlAccount)
            .derive(0)
          debugger
          const newClaim = await signClaim({claim: claimObj, ownerRoot, rotationIx, did})
          debugger
          await dispatch(addReceivedRequest({claim: newClaim, senderDid}))
          await client.mutate({
            mutation: sendClaim,
            variables: {
              senderDid: did,
              receiverDid: senderDid,
              claim: JSON.stringify(newClaim),
              claimType: 'KNOWS',
              subjects: [did, senderDid]
            }
          })
        }
        db.nonces.delete({nonce: n})
      }
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

// Listening on new ownership proofs messages

const getOwnershipProofs = gql`
  query getOwnershipProofs($senderDid: String) {
     getOwnershipProofs(senderDid: $senderDid) {
       _id
       receiverDid
       signature
    }
  }
`
const ownershipProofsObs = (did) => client.watchQuery({
  query: getOwnershipProofs,
  pollInterval: 10000,
  variables: {senderDid: did}
})

export const ownershipProofsSub = (did, dispatch) => ownershipProofsObs(did).subscribe({
  next: ({data: {getOwnershipProofs}}) => {
    _.each(getOwnershipProofs, async ({_id, receiverDid, signature}) => {
      await dispatch(checkOwnershipProof({_id, receiverDid, signature}))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

// Listening on new claim signature requests

const getClaimSignatureRequests = gql`
  query getClaimSignatureRequests($receiverDid: String) {
     getClaimSignatureRequests(receiverDid: $receiverDid) {
       _id
       senderDid
       claimId
       claim
    }
  }
`

const claimSignatureRequestsObs = (did) => client.watchQuery({
  query: getClaimSignatureRequests,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const claimSignatureRequestsSub = (did, dispatch) => claimSignatureRequestsObs(did).subscribe({
  next: ({data: {getClaimSignatureRequests}}) => {
    _.each(getClaimSignatureRequests, async ({_id, senderDid, claimId, claim}) => {
      await dispatch(addClaimSignatureRequest({senderDid, claimId, claim}))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

const getClaimSignatures = gql`
  query getClaimSignatures($receiverDid: String) {
     getClaimSignatures(receiverDid: $receiverDid) {
       _id
       claimId
       senderDid
       claimSignature
    }
  }
`

const claimSignatureObs = (did) => client.watchQuery({
  query: getClaimSignatures,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const claimSignaturesSub = (did, dispatch) => claimSignatureObs(did).subscribe({
  next: ({data: {getClaimSignatures}}) => {
    _.each(getClaimSignatures, async ({_id, senderDid, claimId, claimSignature}) => {
      await dispatch(addClaimSignature({
        senderDid,
        claimId,
        claimSignature: JSON.parse(claimSignature)
      }))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

const getClaims = gql`
  query getClaims($receiverDid: String) {
    getClaims(receiverDid: $receiverDid) {
      _id
      senderDid
      claim
      claimType
      subjects
    }
  }
`

const claimObs = (did) => client.watchQuery({
  query: getClaims,
  pollInterval: 10000,
  variables: {receiverDid: did}
})

export const claimsSub = (did, dispatch) => claimObs(did).subscribe({
  next: ({data: {getClaims}}) => {
    _.each(getClaims, async ({_id, senderDid, claim, claimType, subjects}) => {
      const claimObj = JSON.parse(claim)
      debugger
      await dispatch(addClaim({
        senderDid,
        claim: claimObj,
        type: claimType,
        subjects
      }))
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})
