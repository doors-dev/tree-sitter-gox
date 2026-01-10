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
    $._gox_element_open_head_name,
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
      $._gox_element,
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

    _gox_paren_expression: $ => choice(
      $.parenthesized_expression,
      seq('(', $.gox_func, ')'),
    ),
    _gox_element: $ => choice(alias($._gox_head_wrapper, $.gox_element), $.gox_element),
    _gox_head_wrapper: $ => field('content', $._gox_head),
    _gox_base_content: $ => choice(
      $._gox_head,
      $.gox_erroneous_close_head,
      $.gox_doctype,
      $.gox_element,
      $._gox_tilde,
      $.gox_comment,
    ),
    _gox_content: $ => choice(
      $._gox_base_content,
      $.gox_space_filler,
      $.gox_plain_text,
    ),
    gox_doctype: $ => seq(
      '<!',
      alias($._gox_doctype, 'doctype'),
      alias(/[^>]+/, $.gox_doctype_identifier),
      alias('>', $.gox_head_end),
    ),
    _gox_doctype: _ => /[Dd][Oo][Cc][Tt][Yy][Pp][Ee]/,
    _gox_head: $ => choice(
      $.gox_head,
      $.gox_raw_head,
      $.gox_script_head,
      $.gox_style_head,
      $.gox_void_head,
      $.gox_self_closing_head,
    ),
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
    gox_element: $ => seq(
      field('open', alias($.gox_element_open_head, $.gox_open_head)),
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
    gox_element_open_head: $ => seq(
      alias('<', $.gox_open_head_beg),
      $._gox_element_open_head_name,
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
      $.gox_literal_attr,
      $._gox_class_attr,
      $.gox_bool_attr,
      alias($._gox_arg, $.gox_attr_mod),
      $.comment,
    ),
    _gox_class_attr: $ => choice(
      $.gox_class_attr,
      $.gox_class_literal_attr,
    ),
    gox_class_attr: $ => seq(
      alias(/[Cc][Ll][Aa][Ss][Ss]/, $.gox_attr_name),
      alias('=', $.gox_attr_eq),
      choice(
        field('value', $.gox_func),
        seq('(', field('value', $.gox_func), ')'),
        field('value', $._gox_attr_value),
      ),
    ),
    gox_class_literal_attr: $ => seq(
      alias(/[Cc][Ll][Aa][Ss][Ss]/, $.gox_attr_name),
      alias('=', $.gox_attr_assign),
      field('value', $._gox_literal_value),
    ),
    gox_attr: $ => seq(
      field('name', $.gox_attr_name),
      alias('=', $.gox_attr_assign),
      choice(
        field('value', $.gox_func),
        seq(
          alias('(', $.gox_redundant),
          field('value', $.gox_func),
          alias(')', $.gox_redundant)
        ),
        field('value', $._gox_attr_value),
      ),
    ),
    _gox_attr_value: $ => choice($.nil, $.parenthesized_expression, $.type_conversion_expression),
    gox_literal_attr: $ => seq(
      field('name', $.gox_attr_name),
      alias('=', $.gox_attr_assign),
      field('value', $._gox_literal_value),
    ),
    gox_bool_attr: $ => seq(
      field('name', $.gox_attr_name),
      optional(seq(
        alias('=', $.gox_attr_assign),
        field('value', choice($.true, $.false)),
      )),
    ),
    gox_attr_name: _ => /[A-Za-z_:][A-Za-z0-9._:-]*/,
    gox_multi_arg: $ => choice(
      seq(
        $.variadic_argument,
        optional(','),
      ),
      seq(
        choice($._expression, $.variadic_argument),
        repeat1(seq(',', choice($._expression, $.variadic_argument))),
        optional(','),
      )
    ),
    gox_composite_arg: $ => choice(
      field("arg", alias($.composite_literal, $.gox_single_arg)),
      $._gox_arg,
    ),
    _gox_arg: $ => choice(
      seq(
        '(',
        optional(seq(
          field("arg", alias($._expression, $.gox_single_arg)),
          optional(','),
        )),
        ')'
      ),
      seq(
        '(',
        field("arg", $.gox_multi_arg),
        ')',
      ),
    ),
    _gox_literal_value: $ => choice(
      $._string_literal,
      $.int_literal,
      $.float_literal,
      $.imaginary_literal,
    ),
    gox_func: $ => seq(
      'func',
      field('body', $.block),
    ),
    _gox_tilde: $ => choice(
      $.gox_tilde,
      $.gox_tilde_proxy,
      $.gox_tilde_comment,
    ),
    gox_tilde_proxy: $=>seq(
      alias('~>', $.gox_tilde_marker),
      field('body', $.gox_composite_arg)
    ),
    gox_tilde: $ => seq(
      alias('~', $.gox_tilde_marker),
      choice(
        field(
          "body",
          choice(
            $.gox_tilde_if,
            $.gox_tilde_for,
            alias($.gox_composite_arg, $.gox_tilde_job),
            alias($._gox_literal_value, $.gox_tilde_literal_value),
            $.gox_tilde_block,
          ),
        ),
        field('body', $.gox_func),
        seq(
          alias('(', $.gox_redundant),
          field('body', $.gox_func),
          alias(')', $.gox_redundant)
        ),
      ),
    ),
    gox_tilde_comment: $ => seq(
      alias('~', $.gox_tilde_marker),
      field('comment', $.comment),
    ),
    gox_tilde_block: $ => choice(seq(
      '{',
      field('body', optional($.statement_list)),
      '}',
    ), seq(
      alias('(', $.gox_redundant),
      '{',
      field('body', optional($.statement_list)),
      '}',
      alias(')', $.gox_redundant),
    )),
    gox_block: $ => seq(
      '{',
      field('content', repeat($._gox_content)),
      '}',
    ),
    gox_tilde_if: $ => seq(
      '(',
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
        seq(field('consequence', $.gox_block), ')'),
        seq(
          field('consequence', $.gox_block),
          'else',
          choice(
            seq(field('alternative', $.gox_block), ')'),
            field('alternative', alias($._gox_tilde_if, $.gox_tilde_if)),
          ),
        )
      )
    ),
    gox_tilde_for_setup: $ => seq('for',
      optional(choice($._expression, $.for_clause, $.range_clause))
    ),
    gox_tilde_for: $ => seq(
      '(',
      field(
        'setup',
        $.gox_tilde_for_setup,
      ),
      field('body', $.gox_block),
      ')',
    ),
  }
});
