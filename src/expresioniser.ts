import Tokenizer, { IToken, OperandToken, OperatorToken, TokenType, isOperand } from './tokenizer'

function precedence(operator: TokenType) {
  switch(operator) {
    case TokenType.Period: return 3;

    case TokenType.Multiply:
    case TokenType.Divide: return 2;

    case TokenType.Add:
    case TokenType.Subtract: return 1;

    default: return -1
  }
}

function isOperandToken(token: IToken): token is OperandToken {
  return token.classification === "operand"
}

function isOperatorToken(token: IToken): token is OperatorToken {
  return token.classification === "operator"
}

export function evalutatePostFixExpression(tokens: IToken[], context: object): any {
  const operandStack: OperandToken[] = []

  for (const token of tokens) {
    if (isOperandToken(token)) {
      operandStack.push(token)
    } else if (isOperatorToken(token)) {
      if (operandStack.length < 2) { throw Error("not enough operands on stack") }

      const right: OperandToken = operandStack.pop() as OperandToken
      let left: OperandToken = operandStack.pop() as OperandToken

      if (left.type === TokenType.Object) {
        const value: any = context[left.value as keyof object]
        left = new OperandToken(TokenType.Ident, value)
      }

      operandStack.push(token.evaluate(left, right, context))
    }
  }

  if (operandStack.length !== 1) {
    throw Error("uhmm")
  }

  return operandStack[0].value
}

// Convert an infix expression to its postfix equivelant
export function toPostFix(tokens: IToken[]): IToken[] {
  const tokenStack: IToken[] = []
  const output: IToken[] = []

  for(const token of tokens) {
    if (isOperandToken(token)) {
      output.push(token)
      continue
    }

    if (token.type === TokenType.LBrace) {
      tokenStack.push(token)
      continue
    }

    if (token.type === TokenType.LBracket) {
      tokenStack.push(token)
      continue
    }

    if (token.type === TokenType.RBrace) {
      while(tokenStack.length && tokenStack.at(-1)?.type !== TokenType.LBrace) {
        output.push(tokenStack.pop() as IToken)
      }
      tokenStack.pop()
    } else if (token.type === TokenType.RBracket) {
      while(tokenStack.length && tokenStack.at(-1)?.type !== TokenType.LBracket) {
        output.push(tokenStack.pop() as IToken)
      }
      tokenStack.pop()
    } else {
      while(
        tokenStack.length
        && tokenStack.at(-1)?.type !== TokenType.LBrace
        && tokenStack.at(-1)?.type !== TokenType.LBracket
        && precedence(tokenStack.at(-1)?.type as TokenType) >= precedence(token.type)
      ) {
        output.push(tokenStack.pop() as IToken)
      }
      tokenStack.push(token)
    }
  }

  while(tokenStack.length) {
    output.push(tokenStack.pop() as IToken)
  }

  return output
}
