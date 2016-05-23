'use strict';

import config from './config'
import logger from './utils/logger'
import CATEGORIES from './categories'
import { ValidationError } from './utils/errors'

const log = logger.child({module: 'deliverer_factory'})

export default (opts) => {
  const options = Object.assign({}, opts)
  const { impl } = options

  return {
    queue: (category, req) => {
      return new Promise((resolve, reject) => {
        // TBD apply data points sanitization

        // only the category of system can be broadcast
        if (!req.user_id && category !== CATEGORIES.SYSTEM)
          throw new ValidationError('missing user_id')

        if (!req.message && typeof req.message !== 'string')
          throw new ValidationError('missing message')

        // TBD set message expiry? default?

        const msg = {
          message: req.message,
          // blob represents a blob of application specific data
          blob: req.blob
        }

        let ok
        if(req.user_id)
          ok = impl.send(req.user_id, category, msg)
        else
          ok = impl.broadcast(category, msg)

        ok.then(
          (receipt) => {
            resolve(receipt)
          },
          (err) => {
            reject(err)
          })
      })
    }
  }
}
