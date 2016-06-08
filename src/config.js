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
const rabbit_ip = process.env.RABBIT_IP || get_local_vm_ip()

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
