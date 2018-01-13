# scope-analyzer change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.3.0 / 2018-01-13

* add `binding.remove(node)` to remove a reference to a binding from the list of references. use `binding.isReferenced()` to check if there are any references left.

## 1.2.0 / 2018-01-02

* track uses of undeclared variable names. use `getUndeclaredNames()` on the root scope to get a list of undeclared names used in the AST.

## 1.1.1 / 2018-01-02

* fix `import { a as b }` being counted as a reference to `a`

## 1.1.0 / 2017-12-26

* account for import declarations
* rename `analyze` to `crawl` (analyze is still available as alias)
* some tests

## 1.0.0 / 2017-11-15

* initial release
