'use strict'

import logger from '../utils/logger'
import wrapper from '../utils/routerFnWrapper'
import { ValidationError } from '../utils/errors'
import deliverer_factory from '../deliverer_factory'
import amqp_deliverer from '../implementations/amqp_deliverer'
import CATEGORIES from '../categories'

const log = logger.child({module: 'miscController'})
const deliverer = deliverer_factory({ impl: amqp_deliverer })

export default {
  init: (router) => {
    router.post('/misc', wrapper(async (req, res) => {
      log.debug({ messageBody: req.body }, 'new miscellaneous message delivery requested')

      const receipt = await deliverer.queue(CATEGORIES.MISC, req.body)
      log.debug({ receipt: receipt }, 'miscellaneous message delivered')
      res.json(receipt)
    }))
  }
}
