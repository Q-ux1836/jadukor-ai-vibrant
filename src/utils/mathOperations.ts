
export const isMathProblem = (input: string) => {
  const mathPatterns = [
    /\d+\s*[+\-*/÷×]\s*\d+/,
    /what\s+is\s+\d+/i,
    /calculate/i,
    /solve/i,
    /\d+\s*\+\s*\d+/,
    /\d+\s*\-\s*\d+/,
    /\d+\s*\*\s*\d+/,
    /\d+\s*\/\s*\d+/,
    /\(\s*\d+/,
    /sqrt|square\s+root/i,
    /percentage|percent/i
  ];
  return mathPatterns.some(pattern => pattern.test(input));
};

export const solveMathProblem = (input: string) => {
  try {
    // Extract mathematical expressions
    const mathExpressions = input.match(/[\d+\-*/().\s]+/g);
    if (!mathExpressions) return null;

    let result = '';
    for (let expr of mathExpressions) {
      expr = expr.trim();
      if (expr.length > 0 && /\d/.test(expr)) {
        try {
          // Safe evaluation of mathematical expressions
          const cleanExpr = expr.replace(/[^0-9+\-*/().]/g, '');
          if (cleanExpr) {
            // eslint-disable-next-line no-new-func
            const evalResult = Function('"use strict"; return (' + cleanExpr + ')')();
            result += `${cleanExpr} = ${evalResult}\n`;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (result) {
      return `🧮 **Mathematical Solution:**\n\n${result}\n*Calculated locally by Mistry AI's ancient arithmetic scrolls*`;
    }
  } catch (error) {
    return null;
  }
  return null;
};
