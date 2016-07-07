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

let _local_vm_ip
function get_local_vm_ip() {
  if (!_local_vm_ip && env === 'development') {
    try {
      const cmd = 'docker-machine ip local'
      _local_vm_ip = execSync(cmd).toString().trim()
    } catch (err) {}
  }
  return _local_vm_ip
}

const env = process.env.NODE_ENV || 'development'
const debug = isDebug()
const port = process.env.PORT || 7070

const rabbit_host = process.env.RABBIT_HOST || get_local_vm_ip()
const rabbit_port = process.env.RABBIT_PORT || 5672
const rabbit_uri = process.env.RABBIT_PASS || undefined

export default {
  env: env,
  debug: debug,
  applicationName: "msg-publisher",
  port: port,
  amqp_namespace: "mkm",
  storage: {
    rabbit: {
      host: rabbit_host,
      port: rabbit_port,
      uri: rabbit_uri
    }
  }
}
