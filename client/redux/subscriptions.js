import client from 'apollo'
import _ from 'lodash'
import gql from 'graphql-tag'

import signClaim from 'bitcoin/signClaim'
import verifyClaim from 'bitcoin/verifyClaim'
import db from 'db'
import {
  addClaimSignatureRequest,
  addKnowsClaim,
  addClaimSignature,
  addClaim
} from 'redux/actions'

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
      if (!_.isUndefined(n)) {
        const claimObj = JSON.parse(claim)
        // TODO: verify with did on claim
        if (await verifyClaim({signedDocument: claimObj, signerDid: senderDid})) {
          // sign and send back
          const rotationIx = 0
          const controlAccount = Number(process.env.controlAccount)
          const ownerRoot = walletRoot.derivePath("m/44'/0'")
            .deriveHardened(controlAccount)
            .derive(0)
          const newClaim = await signClaim({claim: claimObj, ownerRoot, rotationIx, did})
          await dispatch(addKnowsClaim({claim: newClaim, senderDid}))
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
        db.nonces.delete(n.nonce)
      }
      await client.mutate({
        mutation: setReceived,
        variables: {_id}
      })
    })
  }
})

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
