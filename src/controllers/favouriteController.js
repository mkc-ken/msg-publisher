'use strict'

import logger from '../utils/logger'
import wrapper from '../utils/routerFnWrapper'
import { ValidationError } from '../utils/errors'
import deliverer_factory from '../deliverer_factory'
import amqp_deliverer from '../implementations/amqp_deliverer'
import CATEGORIES from '../categories'

const log = logger.child({module: 'favouriteController'})
const deliverer = deliverer_factory({ impl: amqp_deliverer })

export default {
  init: (router) => {
    router.post('/favourites', wrapper(async (req, res) => {
      log.debug({ messageBody: req.body }, 'new favourite message delivery requested')

      const receipt = await deliverer.queue(CATEGORIES.FAVOURITE, req.body)
      log.debug({ receipt: receipt }, 'favourite message delivered')
      res.json(receipt)
    }))
  }
}
