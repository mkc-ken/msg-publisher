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
    queue: async (category, data) => {
      // TBD apply data points sanitization

      // only the category of system can be broadcast
      if (!data.user_id && category !== CATEGORIES.SYSTEM)
        throw new ValidationError('missing user_id')

      if (!data.message && typeof data.message !== 'string')
        throw new ValidationError('missing message')

      const user_id = data.user_id
      const msg = {
        message: data.message,
        // blob represents application specific data
        blob: data.blob
        // TBD set message expiry? default?
      }

      const err_msg = 'error delivering message'
      if(user_id) {
        log.debug({ message: msg }, `sending ${category} message to ${user_id}`)
        try {
          return await impl.send(user_id, category, msg)
        } catch (err) {
          log.error(err, 'error sending message')
          throw new Error(err_msg)
        }
      }
      else {
        log.debug({ message: msg }, `broadcasting ${category} message`)
        try {
          return await impl.broadcast(category, msg)
        } catch (err) {
          log.error(err, 'error broadcasting message')
          throw new Error(err_msg)
        }
      }
    }
  }
}
