'use strict'

import amqplib from 'amqplib'
import config from '../config'
import logger from '../utils/logger'

const log = logger.child({module: 'amqp_deliverer'})

const rabbitConfig = config.storage.rabbit
const amqpConnUri = rabbitConfig.uri ? rabbitConfig.uri : `amqp://${rabbitConfig.host}:${rabbitConfig.port}`
const amqpConn = amqplib.connect(amqpConnUri)
const namespace = (config.amqp_namespace || 'mkm') + '.'
// prepare exchange keys
const ekeyBroadcast = namespace + 'ibc.broadcast'
const ekeyPrivate = namespace + 'ibc.private'
// prepare routing key
const rkeyPrivate = namespace + 'ibc.private.'

amqpConn.catch((err) => {
  log.error(err, 'amqp connection failed')
  process.exit(1)
});

// trap interrupt signals to perform cleanup before exit
['SIGINT','SIGUSR2'].forEach((signal) => {
  process.on(signal, () => {
    amqpConn.then((conn) => {
      conn.close()
      log.debug('amqp disconnected')
      process.exit(0)
    })
  })
})

export default {
  send: (user_id, category, msg) => {
    const privateRoutingKey = rkeyPrivate + user_id
    const amqpOk = amqpConn.then((conn) => {
      // create an amqp channel for the spark instance
      return conn.createChannel().then((ch) => {
        // make sure the topic exchagne exists
        let ok = ch.assertExchange(ekeyPrivate, 'topic', { durable: true })
        // publish message
        ok = ok.then(() => {
          const pubOpts = { headers: { category: category } }
          const msgBuffer = Buffer.from(JSON.stringify(msg))
          return ch.publish(ekeyPrivate, privateRoutingKey, msgBuffer, pubOpts)
        })
        // release channel when done publishing
        return ok.then(() => {
          return ch.close()
        })
      })
    })

    return amqpOk.then(
      () => {
        return { status: 'ok' }
      },
      (err) => {
        log.error(err)
        throw new Error(`failed on sending message to category ${category} routing key ${privateRoutingKey}`)
      })
  },
  broadcast: (category, msg) => {
    const amqpOk = amqpConn.then((conn) => {
      // create an amqp channel for the spark instance
      return conn.createChannel().then((ch) => {
        // make sure the fanout exchagne exists
        let ok = ch.assertExchange(ekeyBroadcast, 'fanout', { durable: true })
        // publish message
        ok = ok.then(() => {
          const pubOpts = { headers: { category: category } }
          const msgBuffer = Buffer.from(JSON.stringify(msg))
          return ch.publish(ekeyBroadcast, '', msgBuffer, pubOpts)
        })
        // release channel when done publishing
        return ok.then(() => {
          return ch.close()
        })
      })
    })

    return amqpOk.then(
      () => {
        return { status: 'ok' }
      },
      (err) => {
        log.error(err)
        throw new Error(`failed on broadcasting message to category ${category}`)
      })
  }
}
