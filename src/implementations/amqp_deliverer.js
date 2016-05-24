'use strict'

import amqplib from 'amqplib'
import config from '../config'
import logger from '../utils/logger'

const log = logger.child({module: 'amqp_deliverer'})
const amqpConn = amqplib.connect('amqp://' + config.storage.rabbit.host + ':' + config.storage.rabbit.port)
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
    })
  })
})

export default {
  send: (user_id, category, msg) => {
    const privateRoutingKey = rkeyPrivate + user_id
    let openedCh
    const amqpOk = amqpConn.then((conn) => {
      // create an amqp channel for the spark instance
      return conn.createChannel().then((ch) => {
        openedCh = ch
        // make sure the fanout exchagne for broadcast exists
        let fanoutOk = ch.assertExchange(ekeyPrivate, 'topic', { durable: true })
        // publish message
        return fanoutOk.then(() => {
          const pubOpts = { headers: { category: category } }
          const msgBuffer = Buffer.from(JSON.stringify(msg))
          return ch.publish(ekeyBroadcast, privateRoutingKey, msgBuffer, pubOpts)
        })
      })
    })

    let cleanupOk = openedCh ? openedCh.close() : Promise.resolve()
    return Promise.all([amqpOk, cleanupOk]).then(
      () => {
        return { status: 'ok' }
      },
      (err) => {
        log.error(err)
        throw new Error(`failed on sending message to category ${category} routing key ${privateRoutingKey}`)
      })
  },
  broadcast: (category, msg) => {
    let openedCh
    const amqpOk = amqpConn.then((conn) => {
      // create an amqp channel for the spark instance
      return conn.createChannel().then((ch) => {
        openedCh = ch
        // make sure the fanout exchagne for broadcast exists
        let fanoutOk = ch.assertExchange(ekeyBroadcast, 'fanout', { durable: true })
        // publish message
        return fanoutOk.then(() => {
          const pubOpts = { headers: { category: category } }
          const msgBuffer = Buffer.from(JSON.stringify(msg))
          return ch.publish(ekeyBroadcast, '', msgBuffer, pubOpts)
        })
      })
    })

    let cleanupOk = openedCh ? openedCh.close() : Promise.resolve()
    return Promise.all([amqpOk, cleanupOk]).then(
      () => {
        return { status: 'ok' }
      },
      (err) => {
        log.error(err)
        throw new Error(`failed on broadcasting message to category ${category}`)
      })
  }
}
