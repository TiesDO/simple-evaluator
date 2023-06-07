import Tokenizer, { TokenType, IToken, isOperand } from '../tokenizer'

describe("token creation", () => {
  const toTokens = (expression: string): IToken[] => {
    return [...new Tokenizer(expression)]
  }

  const testToken = (token: IToken, type: TokenType, value: any = undefined) => {
    expect(token).toHaveProperty("type", type)
    if (isOperand(token.type)) {
      expect(token).toHaveProperty("value", value)
    }
  }

  describe("scope denoters", () => {
    it ("reads period", () => {
      const tokens = toTokens(".")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Period)
    })

    it ("reads opening bracket", () => {
      const tokens = toTokens("[")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.LBracket)
    })

    it ("reads closing bracket", () => {
      const tokens = toTokens("]")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.RBracket)
    })

    it ("reads opening brace", () => {
      const tokens = toTokens("(")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.LBrace)
    })

    it ("reads closing brace", () => {
      const tokens = toTokens(")")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.RBrace)
    })
  })

  describe("arithmic operators", () => {
    it ("reads plus", () => {
      const tokens = toTokens("+")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Add)
    })

    it ("reads plus", () => {
      const tokens = toTokens("-")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Subtract)
    })

    it ("reads plus", () => {
      const tokens = toTokens("/")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Divide)
    })

    it ("reads multiply", () => {
      const tokens = toTokens("*")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Multiply)
    })
  })

  describe("logical operators", () => {
    it ("reads equals", () => {
      const tokens = toTokens("==")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Equal)

      const invalid = toTokens("=")
      const invalid2 = toTokens("===")

      expect(invalid).toHaveLength(1)
      testToken(invalid[0], TokenType.Unknown)

      expect(invalid2).toHaveLength(2)
      testToken(invalid2[0], TokenType.Equal)
      testToken(invalid2[1], TokenType.Unknown)
    })

    it("reads greater than", () => {
      const greaterTokens = toTokens(">")
      const greaterEqualTokens = toTokens(">=")

      expect(greaterTokens).toHaveLength(1)
      testToken(greaterTokens[0], TokenType.Greater)

      expect(greaterEqualTokens).toHaveLength(1)
      testToken(greaterEqualTokens[0], TokenType.GreaterEqual)
    })

    it("reads less than", () => {
      const lessTokens = toTokens("<")
      const lessEqualTokens = toTokens("<=")

      expect(lessTokens).toHaveLength(1)
      testToken(lessTokens[0], TokenType.Lesser)

      expect(lessEqualTokens).toHaveLength(1)
      testToken(lessEqualTokens[0], TokenType.LesserEqual)
    })

    it("reads not equal", () => {
      const tokens = toTokens("!=")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.NotEqual)
    })

    // TODO: Ternary operator
  })

  describe("complex tokens", () => {
    it ("reads identifiers", () => {
      const tokens = toTokens("hello.world")

      expect(tokens).toHaveLength(3)
      testToken(tokens[0], TokenType.Object, "hello")
      testToken(tokens[1], TokenType.Period)
      testToken(tokens[2], TokenType.Ident, "world")
    })

    it ("reads string literals", () => {
      const tokens = toTokens("'hello'")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.String, "hello")
    })

    it ("reads numbers", () => {
      const tokens = toTokens("1337")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Number, 1337)
    })

    it ("reads booleans", () => {
      const trueTokens = toTokens("true")
      const falseTokens = toTokens("false")

      expect(trueTokens).toHaveLength(1)
      testToken(trueTokens[0], TokenType.True)

      expect(falseTokens).toHaveLength(1)
      testToken(falseTokens[0], TokenType.False)
    })

    it ("reads null", () => {
      const tokens = toTokens("null")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Null)
    })

    it ("reads undefined", () => {
      const tokens = toTokens("undefined")

      expect(tokens).toHaveLength(1)
      testToken(tokens[0], TokenType.Undefined)
    })
  })

  it("multiple tokens", () => {
    const expressions = [
      '4 + 2',
      '"my name" == this.name',
      'array[3] + 7 >= (this.status - 1) * 3'
    ]

    const results = [
      [TokenType.Number, TokenType.Add, TokenType.Number],
      [TokenType.String, TokenType.Equal, TokenType.Object, TokenType.Period, TokenType.Ident],
      [TokenType.Object, TokenType.LBracket, TokenType.Number, TokenType.RBracket, TokenType.Add,
      TokenType.Number, TokenType.GreaterEqual, TokenType.LBrace, TokenType.Object,
      TokenType.Period, TokenType.Ident, TokenType.Subtract, TokenType.Number, TokenType.RBrace,
      TokenType.Multiply, TokenType.Number]
    ]

    results.forEach((r, i) => {
      const tokenTypes = toTokens(expressions[i]).map(t => t.type)
      expect(tokenTypes).toEqual(r)
    })
  })
})
