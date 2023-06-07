import Tokenizer, { IToken, TokenType } from './tokenizer'
import { evalutatePostFixExpression, toPostFix } from './expresioniser'

export default function evaluate(expression: string, context: Object = {}): any {
  const tokens = new Tokenizer(expression).readAll()
  const postfix = toPostFix(tokens)
  return evalutatePostFixExpression(postfix, context)
}
