export function ValidationError(message) {
  this.name = 'ValidationError'
  this.message = message || 'validation failed'
  this.stack = (new Error(this.message)).stack
}
ValidationError.prototype = Object.create(Error.prototype)
ValidationError.prototype.constructor = ValidationError
