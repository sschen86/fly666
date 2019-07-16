module.exports = {
  extends: ['@smartx/eslint-config-tendative', 'eslint-config-alloy/typescript',],
  // parserOptions: { parser: 'babel-eslint' },
  rules: {
    'no-sparse-arrays': 0,
    'camelcase': 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    'comma-dangle': [2, 'always-multiline'],
    'indent': [2, 4, {
        'SwitchCase': 1,
        'VariableDeclarator': 1,
        'outerIIFEBody': 1,
        'MemberExpression': 1,
        'FunctionDeclaration': { 'parameters': 1, 'body': 1 },
        'FunctionExpression': { 'parameters': 1, 'body': 1 },
        'CallExpression': { 'arguments': 1 },
        'ArrayExpression': 1,
        'ObjectExpression': 1,
        'ImportDeclaration': 1,
        'flatTernaryExpressions': false,
        'ignoreComments': false,
    }],
    "@typescript-eslint/semi": ["error",  "never"]
  },
}
