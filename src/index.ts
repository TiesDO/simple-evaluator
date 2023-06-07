import Tokenizer from './tokenizer'
import { evalutatePostFixExpression, toPostFix } from './expresioniser'

export default function evaluate(expression: string, context: Object = {}): any {
  const tokens = [...new Tokenizer(expression)]
  const postfix = toPostFix(tokens)
  return evalutatePostFixExpression(postfix, context)
}
