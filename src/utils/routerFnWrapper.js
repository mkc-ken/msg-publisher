'use strict'

export default (func) => {
  return (...args) => {
    // expecting func to return a promise
    // expecting func to be called with [req, res, next]
    //
    // this wrapper is to make sure errors get passed to next
    func(...args).catch(args[2])
  }
}
