export enum TokenType {
  Ident,
  String,
  Number,
  Boolean,
  Undefined,
  Null,
  Object,

  Period,
  LBracket,
  RBracket,
  LBrace,
  RBrace,

  Equal,
  Lesser,
  Greater,
  GreaterEqual,
  LesserEqual,
  NotEqual,

  Add,
  Subtract,
  Divide,
  Multiply,
  Exponent,
  Modulo,

  LogicalAnd,
  LogicalOr,

  Unknown,
}

const _a = "a".charCodeAt(0)
const _z = "z".charCodeAt(0)
const _A = "A".charCodeAt(0)
const _Z = "Z".charCodeAt(0)
const _0 = "0".charCodeAt(0)
const _9 = "9".charCodeAt(0)

const KEYWORDS = ['true', 'false', 'null', 'undefined']

function isDigit(char: string): boolean {
  const c = char.charCodeAt(0)
  return _0 <= c && c <= _9
}

function isLetter(char: string): boolean {
  const c = char.charCodeAt(0)
  return (_a <= c && c <= _z) || (_A <= c && c <= _Z)
}

function isUnderscore(char: string): boolean {
  return "_".charCodeAt(0) === char.charCodeAt(0)
}

export interface IToken {
  classification: "operand" | "operator"
  type: TokenType
}

export class OperandToken implements IToken {
  public get classification(): "operand" { return "operand" }
  constructor(
    public readonly type: TokenType,
    public readonly value?: any) {
  }
}

export class OperatorToken implements IToken {
  public get classification(): "operator" { return "operator" }

  constructor(public readonly type: TokenType) {}

  public evaluate(left: OperandToken, right: OperandToken, context: object): any {
    let result: any
    let type: TokenType = TokenType.Unknown

    switch(this.type) {
      case TokenType.Add:
        result = left.value + right.value
        type = left.type
      break;
      case TokenType.Subtract:
        result = left.value - right.value
        type = left.type
      break;
      case TokenType.Multiply:
        result = left.value * right.value
        type = left.type
      break;
      case TokenType.Divide:
        result = left.value / right.value
        type = left.type
      break;

      case TokenType.Period:
        result = left.value[right.value]
        type = TokenType.Ident
      break;

      case TokenType.Equal:
        result = left.value === right.value
        type = TokenType.Boolean
      break;
      case TokenType.NotEqual:
        result = left.value !== right.value
        type = TokenType.Boolean
      break;
      case TokenType.Lesser:
        result = left.value < right.value
        type = TokenType.Boolean
      break;
      case TokenType.LesserEqual:
        result = left.value <= right.value
        type = TokenType.Boolean
      break;
      case TokenType.Greater:
        result = left.value > right.value
        type = TokenType.Boolean
      break;
      case TokenType.GreaterEqual:
        result = left.value >= right.value
        type = TokenType.Boolean
      break;

      case TokenType.Unknown: default: return undefined
    }

    return new OperandToken(type, result)
  }
}

export function isOperand(token: TokenType) {
  return [TokenType.String, TokenType.Number, TokenType.Boolean,
    TokenType.Undefined, TokenType.Null, TokenType.Ident, TokenType.Object].includes(token)
}

export default class Tokenizer {
  private idx: number
  private previous: IToken | undefined
  private argumentLevel: number = 0

  private get char() { return this.expression.charAt(this.idx) }
  private get nextChar() { return this.expression.charAt(this.idx + 1) }
  private get withinBounds() { return this.idx < this.expression.length }
  private get notDone() { return this.idx <= this.expression.length }
  private get isWhiteSpace(): boolean { return this.char === ' ' || this.char === '\n' || this.char === '\r' || this.char === '\t' }

  private get isDigit(): boolean { return isDigit(this.char) }
  private get isLetter(): boolean { return isLetter(this.char) }

  constructor(private expression: string) {
    this.idx = 0
  }

  readAll(): IToken[] {
    const tokens: IToken[] = []
    let current: IToken | undefined
    do {
      current = this.read()
      if (!current) { break; }

      switch(current?.type) {
        case TokenType.LBracket: tokens.push(new OperatorToken(TokenType.Period))

        default: tokens.push(current as IToken)
      }
    } while(current)

    return tokens
  }

  read(): IToken | undefined {
    let type: TokenType = TokenType.Unknown
    let charCount: number = 1
    let value: any;

    this.skipWhiteSpace()

    switch(this.char) {
      // object accessors
      case '.': type = TokenType.Period; break;
      case '[': type = TokenType.LBracket; break;
      case ']': type = TokenType.RBracket; break;

      // method/scope
      case '(': type = TokenType.LBrace; break;
      case ')': type = TokenType.RBrace; break;

      // comparison operators
      case '=': [type, charCount] = this.tokenizeEqual(); break;
      case '<': [type, charCount] = this.tokenizeLesser(); break;
      case '>': [type, charCount] = this.tokenizeGreater(); break;
      case '!': [type, charCount] = this.tokenizeNotEqual(); break;

      // arithmic operators
      case '+': type = TokenType.Add; break;
      case '-': type = TokenType.Subtract; break;
      case '/': type = TokenType.Divide; break;
      case '*': [type, charCount] = this.tokenizeMultiply(); break;
      case '%': type = TokenType.Modulo; break;

      // logical operators
      case '&': [type, charCount] = this.tokenizeAnd(); break;
      case '|': [type, charCount] = this.tokenizeOr(); break;

      case '"': case "'": [type, charCount, value] = this.tokenizeStringLiteral(); break;

      default:
        if (this.isDigit) {
          [type, charCount, value] = this.tokenizeNumber(); break;
        } else if (this.isLetter) {
          [type, charCount, value] = this.tokenizeWord(); break;
        }
    }

    this.idx += charCount

    if (this.notDone) {
      const token = isOperand(type)
        ? new OperandToken(type, value)
        : new OperatorToken(type)

      this.previous = token
      return token
    } else {
      return undefined
    }
  }

  private skipWhiteSpace() {
    while (this.withinBounds && this.isWhiteSpace) {
      this.idx++
    }
  }

  private tokenizeEqual(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '='
      ? [TokenType.Equal, 2]
      : [TokenType.Unknown, 1]
  }

  private tokenizeLesser(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '='
      ? [TokenType.LesserEqual, 2]
      : [TokenType.Lesser, 1]
  }

  private tokenizeGreater(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '='
      ? [TokenType.GreaterEqual, 2]
      : [TokenType.Greater, 1]
  }

  // TODO: flip boolean values etc
  private tokenizeNotEqual(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '='
      ? [TokenType.NotEqual, 2]
      : [TokenType.Unknown, 1]
  }

  private tokenizeMultiply(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '*'
      ? [TokenType.Exponent, 2]
      : [TokenType.Multiply, 1]
  }

  private tokenizeAnd(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '&'
      ? [TokenType.LogicalAnd, 2]
      : [TokenType.Unknown, 1]
  }

  private tokenizeOr(): [TokenType, number] {
    return this.withinBounds && this.nextChar === '|'
      ? [TokenType.LogicalOr, 2]
      : [TokenType.Unknown, 1]
  }

  private offsetInBounds(index: number): boolean {
    return this.idx + index < this.expression.length
  }

  private charAtOffset(index: number): string {
    return this.expression[this.idx + index]
  }

  private tokenizeStringLiteral(): [TokenType, number, string] {
    const wrapChar = this.char
    let offset = 1
    let value = ""

    do {
      value += this.charAtOffset(offset)
      offset++
    } while(this.offsetInBounds(offset) && this.charAtOffset(offset) !== wrapChar)

    return [TokenType.String, offset + 1, value]
  }

  private tokenizeNumber(): [TokenType, number, number] {
    let offset = 0
    let value = ""

    do {
      value += this.charAtOffset(offset)
      offset++
    } while (this.offsetInBounds(offset) && isDigit(this.charAtOffset(offset)))

    // TODO: floats n shit
    return [TokenType.Number, offset, parseInt(value, 10)]
  }

  private tokenizeWord(): [TokenType, number, any] {
    let offset = 0
    let value: any = ""

    do {
      value += this.charAtOffset(offset)
      offset++
    } while (this.offsetInBounds(offset) && (isLetter(this.charAtOffset(offset)) || isUnderscore(this.charAtOffset(offset))))

    let type: TokenType;

    switch(value) {
      case KEYWORDS[0]:
        type = TokenType.Boolean
        value = true
      break;
      case KEYWORDS[1]:
        type = TokenType.Boolean
        value = false
      break;
      case KEYWORDS[2]:
        type = TokenType.Null
        value = null
      break;
      case KEYWORDS[3]:
        type = TokenType.Undefined
        value = undefined
      break;
      default: 
        type = this.previous?.type === TokenType.Period
          ? TokenType.Ident
          : TokenType.Object
      break;
    }

    return [type, offset, value]
  }
}
