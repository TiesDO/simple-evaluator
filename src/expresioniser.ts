import { Token, TokenType } from './tokenizer'

function precedence(operator: TokenType) {
  switch(operator) {
    case TokenType.Period: return 0;

    case TokenType.Multiply:
    case TokenType.Divide: return 1;

    case TokenType.Add:
    case TokenType.Subtract: return 2;

    default: return -1
  }
}

function isOperand(token: TokenType) {
  return [TokenType.String, TokenType.Number, TokenType.True, TokenType.False,
    TokenType.Undefined, TokenType.Null, TokenType.Ident].includes(token)
}

export default function evalutatePostFixExpression(tokens: Token[]): any {
  const operandStack = []

  for (const token of tokens) {
    if (isOperand(token.type)) {
      operandStack.push(token)
    } else {
      if (operandStack.length < 2) { throw Error("not enough operands on stack") }

      const right = <Token>operandStack.pop()
      const left = <Token>operandStack.pop()

      operandStack.push(evaluateOperator(left, right, token.type))
    }
  }

  if (operandStack.length !== 1) {
    throw Error("uhmm")
  }

  return operandStack[0]
}

export function evaluateOperator(left: Token, right: Token, operator: TokenType): Token {
  switch (operator) {
    case TokenType.Add: return new Token(TokenType.Number, left.value + right.value)
    default: throw Error("unknown operator")
  }
}

// Convert an infix expression to its postfix equivelant
export function toPostFix(tokens: Token[]): Token[] {
  const tokenStack: Token[] = []
  const output: Token[] = []

  for(const token of tokens) {
    if (isOperand(token.type)) {
      output.push(token)
      continue
    }

    if (token.type === TokenType.LBrace) {
      tokenStack.push(token)
      continue
    }

    if (token.type === TokenType.RBrace) {
      while(tokenStack.length && tokenStack.at(-1)?.type !== TokenType.LBrace) {
        output.push(<Token>tokenStack.pop())
      }
      tokenStack.pop()
    } else {
      while(
        tokenStack.length && tokenStack.at(-1)?.type !== TokenType.LBrace
        && precedence(<TokenType>tokenStack.at(-1)?.type) >= precedence(token.type)
      ) {
        output.push(<Token>tokenStack.pop())
      }
      tokenStack.push(token)
    }
  }

  while(tokenStack.length) {
    output.push(<Token>tokenStack.pop())
  }

  return output
}
