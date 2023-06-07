import evaluate from '../index'
import { log } from 'console'
import Tokenizer from '../tokenizer'
import { evalutatePostFixExpression, toPostFix } from '../expresioniser'

describe("expression output", () => {
  it("is equal", () => {
    const expression = '6 * (82 - 80)'
    expect(evaluate(expression)).toBe(eval(expression))
  })
})

describe("performance", () => {
  function runStdEval(expression: string, amount: number): number {
    const start: number = performance.now()

    for (let i = 0; i < amount; i++) {
      eval(expression)
    }

    const end: number = performance.now()
    return end - start
  }

  function runCustomEval(expression: string, amount: number): number {
    const start: number = performance.now()

    for (let i = 0; i < amount; i++) {
      evaluate(expression)
    }

    const end: number = performance.now()
    return end - start
  }

  function runPreppedCustomEval(expression: string, amount: number): number {
    const prep = toPostFix(new Tokenizer(expression).readAll())

    const start: number = performance.now()

    for (let i = 0; i < amount; i++) {
      evalutatePostFixExpression(prep, {})
    }

    const end: number = performance.now()
    return end - start
  }

  function getAvg(benchmark: () => number, amount: number): number {
    return Array<number>(amount).fill(0)
      .map(time => time + benchmark())
      .reduce((a, b) => a + b) / amount
  }

  describe("100 * 1000 iterations", () => {
    it("performs", () => {
      const expression = '6 * (82 - 80)'
      log(`expression: ${expression}
standard eval: ${getAvg(() => runStdEval(expression, 1000), 100)}ms
custom eval: ${getAvg(() => runCustomEval(expression, 1000), 100)}ms
prepped eval: ${getAvg(() => runPreppedCustomEval(expression, 1000), 100)}ms`)
    })

  })
})
