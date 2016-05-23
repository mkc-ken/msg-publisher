'use strict'

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'
import deliverer_factory from '../deliverer_factory'

const log = logger.child({module: 'favouriteController'})
const deliverer = deliverer_factory({ impl: {} })

export default {
  init: (router) => {
    router.post('/favourites', (req, res) => {
      log.debug('new favourite message delivery requested')

      let msg = {}
      // TBD validation should be extracted out of fm_selector since it's the controller's job
      deliverer.broadcast(msg).then(
        (receipt) => {
          log.debug({ receipt: receipt }, 'favourite message delivered')
          res.json(receipt)
        },
        (err) => {
          log.warn(err)
          let status = 500
          if (err instanceof ValidationError) status = 400
          res.status(status)
          res.json({status: { code: status, message: err.message }})
        })
    })
  }
}