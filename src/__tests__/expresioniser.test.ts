import Tokenizer, { OperandToken, OperatorToken, TokenType } from '../tokenizer'
import { evalutatePostFixExpression, toPostFix } from '../expresioniser'

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
    const tokens = [...new Tokenizer("5+    4")]
    expect(evalutatePostFixExpression(toPostFix(tokens), {})).toBe(9)
  })

  it("5 + 4 - 8 = 1", () => {
    const tokens = [...new Tokenizer("5+    4 -   8")]
    expect(evalutatePostFixExpression(toPostFix(tokens), {})).toBe(1)
  })

  it("8 + 2 * 6 = 20", () => {
    const tokens = [...new Tokenizer("8 + 2 * 6")]
    expect(evalutatePostFixExpression(toPostFix(tokens), {})).toBe(20)
  })

  it("(8 + 2) * 6 = 60", () => {
    const tokens = [...new Tokenizer("(8 + 2) * 6")]
    expect(evalutatePostFixExpression(toPostFix(tokens), {})).toBe(60)
  })

  it("6 * (8 / 2) = 24", () => {
    const tokens = [...new Tokenizer("6 * (8 / 2)")]
    expect(evalutatePostFixExpression(toPostFix(tokens), {})).toBe(24)
  })
})

describe("property access", () => {
  it("evaluates properties to the context provided value", () => {
    const tokens = [...new Tokenizer('session.count')]
    const context = { session: { count: 3 } }
    const result = evalutatePostFixExpression(toPostFix(tokens), context)

    expect(result).toBe(3)
  })

  it("evaluates multiple properties", () => {
    const tokens = [...new Tokenizer('my.left * my.right')]
    const context = { my: { left: 3, right:  4 } }
    const result = evalutatePostFixExpression(toPostFix(tokens), context)

    expect(result).toBe(12)
  })
})
