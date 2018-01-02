var Binding = require('./binding')

module.exports = Scope

function Scope () {
  this.bindings = new Map()
  this.undeclaredBindings = new Map()
}

Scope.prototype.define = function (binding) {
  if (this.bindings.has(binding.name)) {
    var existing = this.bindings.get(binding.name)
    binding.getReferences().forEach(function (ref) {
      existing.add(ref)
    })
  } else {
    this.bindings.set(binding.name, binding)
  }
  return this
}

Scope.prototype.has = function (name) {
  return this.bindings.has(name)
}

Scope.prototype.add = function (name, ref) {
  var binding = this.bindings.get(name)
  if (binding) {
    binding.add(ref)
  }
  return this
}

Scope.prototype.addUndeclared = function (name, ref) {
  if (!this.undeclaredBindings.has(name)) {
    this.undeclaredBindings.set(name, new Binding(name))
  }

  var binding = this.undeclaredBindings.get(name)
  binding.add(ref)
  return this
}

Scope.prototype.getBinding = function (name) {
  return this.bindings.get(name)
}

Scope.prototype.getReferences = function (name) {
  return this.has(name) ? this.bindings.get(name).getReferences() : []
}

Scope.prototype.getUndeclaredNames = function () {
  return Array.from(this.undeclaredBindings.keys())
}

Scope.prototype.forEach = function () {
  this.bindings.forEach.apply(this.bindings, arguments)
}
