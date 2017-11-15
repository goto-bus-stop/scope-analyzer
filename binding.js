module.exports = Binding

function Binding (name, definition) {
  this.name = name
  this.definition = definition
  this.references = new Set()

  if (definition) this.add(definition)
}

Binding.prototype.add = function (node) {
  this.references.add(node)
  return this
}

Binding.prototype.getReferences = function () {
  var arr = []
  this.each(function (ref) { arr.push(ref) })
  return arr
}

Binding.prototype.each = function (cb) {
  this.references.forEach(function (ref) { cb(ref) })
  return this
}
