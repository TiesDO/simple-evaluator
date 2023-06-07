import Tokenizer, { OperandToken, OperatorToken, TokenType } from '../tokenizer'
import { evalutatePostFixExpression, toPostFix } from '../expresioniser'
import evaluate from '..'

test("to post fix", () => {
  const input = [
    new OperandToken(TokenType.Number, 1),
    new OperatorToken(TokenType.Multiply),
    new OperatorToken(TokenType.LBrace),
    new OperandToken(TokenType.Number, 2),
    new OperatorToken(TokenType.Add),
    new OperandToken(TokenType.Number, 3),
    new OperatorToken(TokenType.Add),
    new OperandToken(TokenType.Number, 4),
    new OperatorToken(TokenType.RBrace),
  ]
  const expected = [
    new OperandToken(TokenType.Number, 1),
    new OperandToken(TokenType.Number, 2),
    new OperandToken(TokenType.Number, 3),
    new OperatorToken(TokenType.Add),
    new OperandToken(TokenType.Number, 4),
    new OperatorToken(TokenType.Add),
    new OperatorToken(TokenType.Multiply),
  ]

  expect(toPostFix(input)).toEqual(expected)
})

describe("evaluate basic expression", () => {
  it("5 + 4 = 9", () => {
    expect(evaluate('5 +    4', {})).toBe(9)
  })

  it("5 + 4 - 8 = 1", () => {
    expect(evaluate("5+    4 -   8", {})).toBe(1)
  })

  it("8 + 2 * 6 = 20", () => {
    expect(evaluate("8 + 2 * 6", {})).toBe(20)
  })

  it("(8 + 2) * 6 = 60", () => {
    expect(evaluate("(8 + 2) * 6", {})).toBe(60)
  })

  it("6 * (8 / 2) = 24", () => {
    expect(evaluate("6 * (8 / 2)", {})).toBe(24)
  })
})

describe("property access", () => {
  it("evaluates properties to the context provided value", () => {
    const context = { session: { count: 3 } }
    const result = evaluate('session.count', context)

    expect(result).toBe(3)
  })

  it("evaluates multiple properties", () => {
    const context = { my: { left: 3, right:  4 } }
    const result = evaluate('my.left * my.right', context)

    expect(result).toBe(12)
  })
})

describe("array indexing", () => {
  it("can do array indexes", () => {
    const context = { foo: { bar: [1,2,3] }, bazz: [4,5,6]}
    expect(evaluate('foo.bar[4 - 2]', context)).toBe(3)
    expect(evaluate('bazz[2]', context)).toBe(6)
    expect(evaluate('bazz[foo.bar[1]]', context)).toBe(6)
    expect(evaluate('foo.bar[1] * foo.bar[2]', context)).toBe(6)
    expect(evaluate('(foo.bar[1] * foo.bar[2]) - (3 - bazz[foo.bar[1]])', context)).toBe(9)
    // (2 * 3) - (3 - 6) = 6 - - 3 = 9
    // TODO: parse signed numbers and floats
  })
})


