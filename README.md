# Simple expression Evaluator

How to use

```js
import evaluate from 'simple-evaluator'

evaluate('7 + 3 * 2') // 13

// with context
const context = { foo: 5, bar: [1, 2, 3]}

evaluate('foo < bar[0] + bar[1] + bar[2]', context) // (5 < 6) true
```
