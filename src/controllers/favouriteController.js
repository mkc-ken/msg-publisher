'use strict'

import logger from '../utils/logger'
import { ValidationError } from '../utils/errors'
import deliverer_factory from '../deliverer_factory'
import amqp_deliverer from '../implementations/amqp_deliverer'
import CATEGORIES from '../categories'

const log = logger.child({module: 'favouriteController'})
const deliverer = deliverer_factory({ impl: amqp_deliverer })

export default {
  init: (router) => {
    router.post('/favourites', (req, res) => {
      log.debug('new favourite message delivery requested')

      // TBD validation should be extracted out of fm_selector since it's the controller's job
      deliverer.queue(CATEGORIES.FAVOURITE, req.body).then(
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
