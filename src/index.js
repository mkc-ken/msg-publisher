'use strict'

import express from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import blocked from 'blocked'

import config from './config'
import logger from './utils/logger'
import { ValidationError, AuthenticationError } from './utils/errors'
import controllers from './controllers'

const log = logger.child({ module: 'index' })
const app = express()
const apiRouter = express.Router()
controllers.init(apiRouter)

//enable helmet
app.use(helmet())

//bind api routes
app.use('/v1', bodyParser.json(), bodyParser.urlencoded({ extended:true }), apiRouter)

//bind default error handler
app.use((err, req, res, next) => {
  log.error(err)
  let status = 500
  if (err instanceof ValidationError) status = 400
  if (err instanceof AuthenticationError) status = 401
  res.status(status)
  res.json({ status: { code: status, message: err.message } })
})

app.listen(config.port)
log.info('start listening on port %s', config.port)

// issue warnings if eventloop got delayed by more than 200ms
blocked((ms) => {
  log.warn('eventloop delayed by %d ms', ms)
}, { threshold: 200 });
