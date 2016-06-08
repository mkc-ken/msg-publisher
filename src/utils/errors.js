export function ValidationError(message) {
  this.name = 'ValidationError'
  this.message = message || 'validation failed'
  this.stack = (new Error(this.message)).stack
}
ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.constructor = ValidationError

export function AuthenticationError(message) {
  this.name = 'AuthenticationError'
  this.message = message || 'authentication failed'
  this.stack = (new Error(this.message)).stack
}
AuthenticationError.prototype = Object.create(Error.prototype)
AuthenticationError.prototype.constructor = AuthenticationError
