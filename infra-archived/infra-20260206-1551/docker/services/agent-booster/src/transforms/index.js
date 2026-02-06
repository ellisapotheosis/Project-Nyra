/**
 * Code Transform Implementations
 * Pattern-based AST transforms using Babel
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const prettier = require('prettier');

/**
 * Convert var declarations to const/let
 */
async function varToConst(code, options = {}) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    VariableDeclaration(path) {
      if (path.node.kind === 'var') {
        // Check if variable is reassigned
        const binding = path.scope.getBinding(path.node.declarations[0].id.name);
        const isReassigned = binding && binding.constantViolations.length > 0;

        path.node.kind = isReassigned ? 'let' : 'const';
      }
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Add TypeScript type annotations
 */
async function addTypes(code, options = {}) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      if (!path.node.returnType) {
        // Infer return type based on return statements
        let hasReturn = false;
        path.traverse({
          ReturnStatement(returnPath) {
            hasReturn = true;
          }
        });

        // Add void or any type annotation
        const typeAnnotation = t.tsTypeAnnotation(
          hasReturn ? t.tsAnyKeyword() : t.tsVoidKeyword()
        );
        path.node.returnType = typeAnnotation;
      }

      // Add parameter types if missing
      path.node.params.forEach(param => {
        if (t.isIdentifier(param) && !param.typeAnnotation) {
          param.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
        }
      });
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Remove console.log statements
 */
async function removeConsole(code, options = {}) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object, { name: 'console' })
      ) {
        path.remove();
      }
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Add structured logging
 */
async function addLogging(code, options = {}) {
  const loggerName = options.loggerName || 'logger';

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  // Add logger import at top
  const importDeclaration = t.importDeclaration(
    [t.importSpecifier(t.identifier(loggerName), t.identifier(loggerName))],
    t.stringLiteral('./logger')
  );

  ast.program.body.unshift(importDeclaration);

  // Replace console.log with logger calls
  traverse(ast, {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
        t.isIdentifier(path.node.callee.property, { name: 'log' })
      ) {
        // Replace with logger.info
        path.node.callee.object.name = loggerName;
        path.node.callee.property.name = 'info';
      }
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Convert callbacks to async/await
 */
async function asyncAwait(code, options = {}) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    CallExpression(path) {
      // Look for common callback patterns
      const callee = path.node.callee;
      const args = path.node.arguments;

      // Check if last argument is a function (callback pattern)
      if (args.length > 0 && t.isFunction(args[args.length - 1])) {
        const callback = args[args.length - 1];

        // Check if callback has (err, data) signature
        if (callback.params.length >= 2) {
          // Wrap in try-catch with await
          const awaitExpr = t.awaitExpression(
            t.callExpression(callee, args.slice(0, -1))
          );

          path.replaceWith(awaitExpr);
        }
      }
    },

    FunctionDeclaration(path) {
      // Make function async if it contains await
      let hasAwait = false;
      path.traverse({
        AwaitExpression() {
          hasAwait = true;
        }
      });

      if (hasAwait && !path.node.async) {
        path.node.async = true;
      }
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Add error handling (try-catch)
 */
async function addErrorHandling(code, options = {}) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      // Wrap function body in try-catch if not already wrapped
      const body = path.node.body.body;

      if (body.length > 0 && !t.isTryStatement(body[0])) {
        const tryBlock = t.tryStatement(
          t.blockStatement(body),
          t.catchClause(
            t.identifier('error'),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier('logger'),
                    t.identifier('error')
                  ),
                  [
                    t.objectExpression([
                      t.objectProperty(
                        t.identifier('error'),
                        t.memberExpression(t.identifier('error'), t.identifier('message'))
                      ),
                      t.objectProperty(
                        t.identifier('function'),
                        t.stringLiteral(path.node.id?.name || 'anonymous')
                      )
                    ])
                  ]
                )
              ),
              t.throwStatement(t.identifier('error'))
            ])
          )
        );

        path.node.body.body = [tryBlock];
      }
    }
  });

  const output = generate(ast, {}, code);
  return output.code;
}

/**
 * Format code with Prettier
 */
async function formatCode(code, options = {}) {
  const formatted = await prettier.format(code, {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    tabWidth: 2,
    ...options
  });

  return formatted;
}

module.exports = {
  'var-to-const': varToConst,
  'add-types': addTypes,
  'remove-console': removeConsole,
  'add-logging': addLogging,
  'async-await': asyncAwait,
  'add-error-handling': addErrorHandling,
  'format-code': formatCode
};
