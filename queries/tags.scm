; Go tags come from tree-sitter-go (listed after this file in tree-sitter.json).

(
  (comment)* @doc
  .
  (gox_elem_function_declaration
    name: (identifier) @name) @definition.function
  (#strip! @doc "^//\\s*")
  (#set-adjacent! @doc @definition.function)
)

(
  (comment)* @doc
  .
  (gox_elem_method_declaration
    name: (field_identifier) @name) @definition.method
  (#strip! @doc "^//\\s*")
  (#set-adjacent! @doc @definition.method)
)
