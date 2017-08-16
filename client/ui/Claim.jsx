import React from 'react'

const Claim = ({claim}) => (
  <div>
    <p>
      Subject: {claim['@id']}
    </p>
    <div>
      {Object.keys(claim).filter(e => e !== '@context' && e !== '@id' && e !== 'https://w3id.org/security#signature')
        .map((key) => <p key={key}>{key}: {claim[key].toString()}</p>)}
    </div>
  </div>
)

export default Claim
