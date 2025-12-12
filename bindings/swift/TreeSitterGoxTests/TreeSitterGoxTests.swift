import XCTest
import SwiftTreeSitter
import TreeSitterGox

final class TreeSitterGoxTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_gox())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading GoX grammar")
    }
}
