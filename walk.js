var base = require('acorn/dist/walk').base

module.exports = function walk (ast, cb) {
  recurse(ast, null, null)
  function recurse (node, parent, override) {
    var type = override || node.type
    if (node !== parent) node.parent = parent
    cb(node)
    base[type](node, node, recurse)
  }
}
