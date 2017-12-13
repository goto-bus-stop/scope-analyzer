var test = require('tape')
var assignParent = require('estree-assign-parent')
var parse = require('acorn').parse
var scan = require('../')

function crawl (src) {
  var ast = assignParent(parse(src))
  scan.crawl(ast)
  return ast
}

test('register variable declarations in scope', function (t) {
  t.plan(5)
  var ast = crawl('var a, b; const c = 0; let d')

  var scope = scan.scope(ast)
  t.ok(scope.has('a'))
  t.ok(scope.has('b'))
  t.ok(scope.has('c'))
  t.ok(scope.has('d'))
  t.notOk(scope.has('e'))
})

test('register variable declarations in block scope', function (t) {
  t.plan(4)
  var ast = crawl('var a, b; { let b; }')
  var scope = scan.scope(ast)
  t.ok(scope.has('a'))
  t.ok(scope.has('b'))
  scope = scan.scope(ast.body[1])
  t.ok(scope.has('b'))
  t.notOk(scope.has('a'))
})

test('register non variable declarations (function, class, parameter)', function (t) {
  t.plan(4)
  var ast = crawl('function a (b, a) {} class X {}')
  var scope = scan.scope(ast)
  t.ok(scope.has('a'))
  t.ok(scope.has('X'))
  scope = scan.scope(ast.body[0]) // function declaration
  t.ok(scope.has('a'))
  t.ok(scope.has('b'))
})

test('shadowing', function (t) {
  t.plan(8)
  var ast = crawl(`
    var a
    { let a }
    function b (b) {
      var a
    }
  `)
  var root = scan.scope(ast)
  var block = scan.scope(ast.body[1])
  var fn = scan.scope(ast.body[2])
  t.ok(root.has('a'))
  t.ok(root.has('b'))
  t.ok(block.has('a'))
  t.notEqual(block.getBinding('a'), root.getBinding('a'))
  t.ok(fn.has('b'))
  t.notEqual(fn.getBinding('b'), root.getBinding('b'))
  t.ok(fn.has('a'))
  t.notEqual(fn.getBinding('a'), root.getBinding('a'))
})

test('references', function (t) {
  t.plan(5)

  var src = `
    var a = 0
    a++
    a++
    function b (b) {
      console.log(b(a))
    }
    b(function (b) { return a + b })
  `
  var ast = crawl(src)

  var root = scan.scope(ast)
  var fn = scan.scope(ast.body[3])
  var callback = scan.scope(ast.body[4].expression.arguments[0])

  var a = root.getBinding('a')
  t.equal(a.getReferences().length, 5)
  var b = root.getBinding('b')
  t.equal(b.getReferences().length, 2)
  var b2 = fn.getBinding('b')
  t.equal(b2.getReferences().length, 2)
  var b3 = callback.getBinding('b')
  t.equal(b3.getReferences().length, 2)

  // try to rewrite some things
  var result = src.split('')
  a.getReferences().forEach(function (ref) { result[ref.start] = 'x' })
  b.getReferences().forEach(function (ref) { result[ref.start] = 'y' })
  b2.getReferences().forEach(function (ref) { result[ref.start] = 'z' })
  b3.getReferences().forEach(function (ref) { result[ref.start] = 'w' })
  t.equal(result.join(''), `
    var x = 0
    x++
    x++
    function y (z) {
      console.log(z(x))
    }
    y(function (w) { return x + w })
  `, 'references were associated correctly')
})
