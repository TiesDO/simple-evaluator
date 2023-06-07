import Tokenizer, { Token, TokenType } from '../tokenizer'
import evalutatePostFixExpression, { toPostFix } from '../expresioniser'

test("to post fix", () => {
  const input = [
    new Token(TokenType.Number, 1),
    new Token(TokenType.Multiply),
    new Token(TokenType.LBrace),
    new Token(TokenType.Number, 2),
    new Token(TokenType.Add),
    new Token(TokenType.Number, 3),
    new Token(TokenType.Add),
    new Token(TokenType.Number, 4),
    new Token(TokenType.RBrace),
  ]
  const expected = [
    new Token(TokenType.Number, 1),
    new Token(TokenType.Number, 2),
    new Token(TokenType.Number, 3),
    new Token(TokenType.Add),
    new Token(TokenType.Number, 4),
    new Token(TokenType.Add),
    new Token(TokenType.Multiply),
  ]

  expect(toPostFix(input)).toEqual(expected)
})

describe("evaluate basic expression", () => {
  it("5 + 4", () => {
    const tokens = [...new Tokenizer("5+    4")]
    expect(evalutatePostFixExpression(toPostFix(tokens))).toHaveProperty("value", 9)
  })
})
