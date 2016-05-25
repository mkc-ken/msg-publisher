'use strict';

import config from './config'
import CATEGORIES from './categories'
import { ValidationError } from './utils/errors'
import logger from './utils/logger'

const log = logger.child({module: 'deliverer_factory'})

export default (opts) => {
  const options = Object.assign({}, opts)
  const { impl } = options

  return {
    queue: (category, data) => {
      return new Promise((resolve, reject) => {
        // TBD apply data points sanitization

        // only the category of system can be broadcast
        if (!data.user_id && category !== CATEGORIES.SYSTEM)
          throw new ValidationError('missing user_id')

        if (!data.message && typeof data.message !== 'string')
          throw new ValidationError('missing message')

        // TBD set message expiry? default?

        const user_id = data.user_id
        const msg = {
          message: data.message,
          // blob represents a blob of application specific data
          blob: data.blob
        }

        let ok
        if(user_id) {
          log.debug(`sending ${category} message to ${user_id}`)
          ok = impl.send(user_id, category, msg)
        }
        else {
          log.debug(`broadcasting ${category} message`)
          ok = impl.broadcast(category, msg)
        }

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
