package tree_sitter_gox

// #cgo !windows CFLAGS: -std=c11 -fPIC
// #cgo  windows CFLAGS: -std=c11
// #include "../../src/parser.c"
// #if __has_include("../../src/scanner.c")
// #include "../../src/scanner.c"
// #endif
import "C"

import "unsafe"

// Get the tree-sitter Language for this grammar.
func Language() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_gox())
}
