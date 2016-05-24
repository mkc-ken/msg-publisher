'use strict'

import { execSync } from 'child_process'

function isDebug() {
  const debug = process.env.DEBUG
  if (debug) {
    if (debug == 'false' || debug == '0') return false
    return true
  }
  return false
}

function get_local_vm_ip() {
  if (env === 'development') {
    const cmd = 'docker-machine ip local'
    return execSync(cmd).toString().trim()
  }
  return
}

const env = process.env.NODE_ENV || 'development'
const debug = isDebug()
const local_vm_ip = get_local_vm_ip()
const port = process.env.PORT || 7070
const rabbit_ip = process.env.RABBIT_IP || local_vm_ip

export default {
  env: env,
  debug: debug,
  applicationName: "msg-publisher",
  port: port,
  amqp_namespace: "mkm",
  storage: {
    rabbit: {
      host: rabbit_ip,
      port: 5672
    }
  }
}
