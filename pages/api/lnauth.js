// verify it's signed
// store pubkey in db
// create user with pubkey and name truncated pubkey
import secp256k1 from 'secp256k1'
import models from '../../api/models'

export default async ({ query }, res) => {
  try {
    const sig = Buffer.from(query.sig, 'hex')
    const k1 = Buffer.from(query.k1, 'hex')
    const key = Buffer.from(query.key, 'hex')
    const signature = secp256k1.signatureImport(sig)
    if (secp256k1.ecdsaVerify(signature, k1, key)) {
      await models.lnAuth.update({ where: { k1: query.k1 }, data: { pubkey: query.key } })
      return res.status(200).json({ status: 'OK' })
    }
  } catch (error) {
    console.log(error)
  }

  let reason = 'signature verification failed'
  if (!query.sig) {
    reason = 'no sig query variable provided'
  } else if (!query.k1) {
    reason = 'no k1 query variable provided'
  } else if (!query.key) {
    reason = 'no key query variable provided'
  }
  return res.status(400).json({ status: 'ERROR', reason })
}
