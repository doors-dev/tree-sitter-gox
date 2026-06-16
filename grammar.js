import Go from "tree-sitter-go/grammar.js";
/**
 * @file Gox grammar for tree-sitter
 * @author alex <alex@doors.dev>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar(Go, {
  name: "gox",

  externals: $ => [
    $._gox_open_head_name,
    $._gox_script_open_head_name,
    $._gox_style_open_head_name,
    $._gox_void_open_head_name,
    $._gox_container_open_head_name,
    $._gox_raw_open_head_name,
    $._gox_close_head_name,
    $.gox_erroneous_close_head_name,
    $._gox_self_closer,
    $.gox_implicit_close_head,
    $.gox_raw_text,
    $.gox_comment,
    $.gox_space_filler,
    $.gox_plain_text,
  ],

  reserved: {
    global: $ => [
      'elem',
    ],
  },



  rules: {
    _top_level_declaration: $ => choice(
      $.package_clause,
      $.function_declaration,
      $.method_declaration,
      $.import_declaration,
      $.gox_elem_function_declaration,
      $.gox_elem_method_declaration,
    ),

    _simple_type: $ => choice(
      prec.dynamic(-1, $._type_identifier),
      $.generic_type,
      $.qualified_type,
      $.pointer_type,
      $.struct_type,
      $.interface_type,
      $.array_type,
      $.slice_type,
      prec.dynamic(3, $.map_type),
      $.channel_type,
      $.function_type,
      $.negated_type,
      $.gox_elem_function_type,
    ),

    _expression: $ => choice(
      $.unary_expression,
      $.binary_expression,
      $.selector_expression,
      $.index_expression,
      $.slice_expression,
      $.call_expression,
      $.type_assertion_expression,
      $.type_conversion_expression,
      $.type_instantiation_expression,
      $.identifier,
      alias(choice('new', 'make'), $.identifier),
      $.composite_literal,
      $.func_literal,
      $._string_literal,
      $.int_literal,
      $.float_literal,
      $.imaginary_literal,
      $.rune_literal,
      $.nil,
      $.true,
      $.false,
      $.iota,
      $.parenthesized_expression,
      $.gox_elem_func_literal,
      $.gox_element,
    ),

    gox_elem_function_declaration: $ => prec.right(1, seq(
      'elem',
      field('name', $.identifier),
      field('type_parameters', optional($.type_parameter_list)),
      field('parameters', $.parameter_list),
      field('body', optional($.gox_block)),
    )),

    gox_elem_method_declaration: $ => prec.right(1, seq(
      'elem',
      field('receiver', $.parameter_list),
      field('name', $._field_identifier),
      field('parameters', $.parameter_list),
      field('body', optional($.gox_block)),
    )),
    gox_elem_func_literal: $ => seq(
      'elem',
      field('parameters', $.parameter_list),
      field('body', $.gox_block),
    ),
    gox_elem_function_type: $ => prec.right(seq(
      'elem',
      field('parameters', $.parameter_list),
    )),
    gox_element: $ => field('content', $._gox_head),
    _gox_base_content: $ => choice(
      $._gox_head,
      $.gox_erroneous_close_head,
      $.gox_doctype,
      $._gox_tilde,
      $.gox_comment,
    ),
    _gox_content: $ => choice(
      $._gox_base_content,
      $.gox_space_filler,
      $.gox_plain_text,
    ),
    _gox_head: $ => choice(
      $.gox_head,
      $.gox_raw_head,
      $.gox_script_head,
      $.gox_style_head,
      $.gox_void_head,
      $.gox_container_head,
      $.gox_self_closing_head,
    ),
    gox_doctype: $ => seq(
      '<!',
      alias($._gox_doctype, 'doctype'),
      alias(/[^>]+/, $.gox_doctype_identifier),
      alias('>', $.gox_head_end),
    ),
    _gox_doctype: _ => /[Dd][Oo][Cc][Tt][Yy][Pp][Ee]/,
    gox_head: $ => seq(
      field('open', $.gox_open_head),
      field('content', repeat($._gox_content)),
      field('close', choice($.gox_close_head, $.gox_implicit_close_head)),
    ),
    gox_self_closing_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      field('name', alias($._gox_open_head_name, $.gox_head_name)),
      field('attrs', repeat($._gox_attr)),
      alias($._gox_self_closer, $.gox_self_closing_head_end),
    ),
    gox_container_head: $ => seq(
      field('open', alias($.gox_container_open_head, $.gox_open_head)),
      field('content', repeat($._gox_content)),
      field('close', choice($.gox_close_head, $.gox_implicit_close_head)),
    ),
    gox_void_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      field("name", alias($._gox_void_open_head_name, $.gox_head_name)),
      field('attrs', repeat($._gox_attr)),
      alias(choice('>', '/>'), $.gox_self_closing_head_end),
    ),
    gox_script_head: $ => seq(
      field('open', alias($.gox_script_open_head, $.gox_open_head)),
      field('content', optional($.gox_raw_text)),
      field('close', $.gox_close_head),
    ),
    gox_raw_head: $ => seq(
      field('open', alias($.gox_raw_open_head, $.gox_open_head)),
      field('content', optional($.gox_raw_text)),
      field('close', $.gox_close_head),
    ),
    gox_style_head: $ => seq(
      field('open', alias($.gox_style_open_head, $.gox_open_head)),
      field('content', optional($.gox_raw_text)),
      field('close', $.gox_close_head),
    ),
    gox_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      field('name', alias($._gox_open_head_name, $.gox_head_name)),
      field('attrs', repeat($._gox_attr)),
      alias('>', $.gox_head_end),
    ),
    gox_container_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      $._gox_container_open_head_name,
      alias('>', $.gox_head_end),
    ),
    gox_raw_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      alias($._gox_raw_open_head_name, $.gox_head_name),
      alias('>', $.gox_head_end),
    ),
    gox_script_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      field('name', alias($._gox_script_open_head_name, $.gox_head_name)),
      field('attrs', repeat($._gox_attr)),
      alias('>', $.gox_head_end),
    ),
    gox_style_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      field('name', alias($._gox_style_open_head_name, $.gox_head_name)),
      field('attrs', repeat($._gox_attr)),
      alias('>', $.gox_head_end),
    ),
    gox_close_head: $ => seq(
      alias('</', $.gox_close_head_beg),
      alias($._gox_close_head_name, $.gox_head_name),
      alias('>', $.gox_head_end),
    ),
    gox_erroneous_close_head: $ => seq(
      '</',
      $.gox_erroneous_close_head_name,
      '>',
    ),
    gox_text: _ => /([^<>{}\s~])([^<>{}~]*[^<>{}~\s])?/,
    _gox_attr: $ => choice(
      $.gox_attr,
      alias($._gox_multi_arg, $.gox_attr_mod),
      $.comment,
    ),
    gox_attr: $ => seq(
      field('name', $.gox_attr_name),
      optional(seq(
        alias('=', $.gox_attr_assign),
        $._gox_single_literal_arg,
      )),
    ),
    gox_attr_name: _ => /[A-Za-z_:][A-Za-z0-9._:-]*/,
    _gox_tilde: $ => choice(
      $.gox_tilde,
      $.gox_tilde_proxy,
      $.gox_tilde_comment,
      $.gox_tilde_block,
      $.gox_tilde_snippet,
    ),
    gox_tilde_proxy: $ => seq(
      alias('~>', $.gox_tilde_marker),
      $._gox_multi_literal_arg,
    ),
    gox_tilde: $ => seq(
      alias('~', $.gox_tilde_marker),
      choice(
        field('value', $.gox_tilde_if),
        field('value', $.gox_tilde_for),
        $._gox_multi_literal_arg,
      ),
    ),
    gox_tilde_comment: $ => seq(
      alias('~', $.gox_tilde_marker),
      field('comment', $.comment),
    ),
    gox_tilde_snippet: $ => seq(
      alias('~~', $.gox_tilde_marker),
      field('body', optional($.statement_list)),
      alias('~~', $.gox_tilde_marker),
    ),
    gox_tilde_block: $ => seq(
      alias('~', $.gox_tilde_marker),
      seq(
        '{',
        field('body', optional($.statement_list)),
        '}',
      ),
    ),
    gox_tilde_if: $ => seq(
      alias('(', $.gox_lparen),
      $._gox_tilde_if,
    ),
    gox_tilde_if_setup: $ => seq(
      'if',
      optional(seq(
        field('initializer', $._simple_statement),
        ';',
      )),
      field('condition', $._expression),
    ),
    _gox_tilde_if: $ => seq(
      field("setup", $.gox_tilde_if_setup),
      choice(
        seq(field('consequence', $.gox_block), alias(')', $.gox_rparen)),
        seq(
          field('consequence', $.gox_block),
          'else',
          choice(
            seq(field('alternative', $.gox_block), alias(')', $.gox_rparen)),
            field('alternative', alias($._gox_tilde_if, $.gox_tilde_if)),
          ),
        )
      )
    ),
    gox_tilde_for_setup: $ => seq('for',
      optional(choice($._expression, $.for_clause, $.range_clause))
    ),
    gox_tilde_for: $ => seq(
      alias('(', $.gox_lparen),
      field(
        'setup',
        $.gox_tilde_for_setup,
      ),
      field('body', $.gox_block),
      alias(')', $.gox_rparen),
    ),
    gox_block: $ => seq(
      '{',
      field('content', repeat($._gox_content)),
      '}',
    ),
    _gox_multi_arg: $ => choice(
      $._gox_single_arg,
      seq(
        alias('(', $.gox_lparen),
        field("value", $.gox_multi_arg),
        alias(')', $.gox_rparen),
      ),
    ),
    _gox_multi_literal_arg: $ => choice(
      $._gox_single_literal_arg,
      seq(
        alias('(', $.gox_lparen),
        field("value", $.gox_multi_arg),
        alias(')', $.gox_rparen),
      ),
    ),
    _gox_single_arg: $ => seq(
      alias('(', $.gox_lparen),
      optional(seq(
        field("value", alias($._gox_expression, $.gox_single_arg)),
        optional(','),
      )),
      alias(')', $.gox_rparen),
    ),
    _gox_single_literal_arg: $ => choice(
      choice(
        field('value', alias($.gox_literal, $.gox_single_arg)),
        seq(
          alias('(', $.gox_redundant),
          field('value', alias($.gox_literal, $.gox_single_arg)),
          alias(')', $.gox_redundant)
        ),
      ),
      $._gox_single_arg,
    ),
    gox_multi_arg: $ => choice(
      seq(
        $.variadic_argument,
        optional(','),
      ),
      seq(
        choice($._gox_expression, $.variadic_argument),
        repeat1(seq(',', choice($._gox_expression, $.variadic_argument))),
        optional(','),
      )
    ),
    gox_literal: $ => prec(1, choice(
      $._string_literal,
      $.int_literal,
      $.float_literal,
      $.imaginary_literal,
      $.rune_literal,
      $.true,
      $.false,
      $.gox_func,
      $.composite_literal,
      $.nil,
    )),
    gox_func: $ => seq(
      'func',
      field('body', $.block),
    ),
    _gox_expression: $ => choice(
      $._expression,
      $.gox_expression,
    ),
    gox_expression: $ => seq(
      '{',
      field('body', optional($.statement_list)),
      '}',
    ),
  }
});
