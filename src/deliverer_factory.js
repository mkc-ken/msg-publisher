'use strict';

import config from './config'
import logger from './utils/logger'

const log = logger.child({module: 'deliverer_factory'})

export default (opts) => {
  const options = Object.assign({}, opts)
  const { impl } = options

  return {
    broadcast: (msg) => {
      return Promise.resolve({})
    }
  }
}
