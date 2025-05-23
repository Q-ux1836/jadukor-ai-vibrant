
// Math operations utility for জাদুকর (JADOOKOR)
// Handles complex mathematical operations locally

const evaluateMathExpression = (expr) => {
  try {
    // Remove spaces and convert to lowercase for consistent parsing
    const sanitizedExpr = expr.replace(/\s+/g, '').toLowerCase();
    
    // Check if it's a basic calculation that we can handle directly
    if (/^[\d\+\-\*\/\(\)\.\^\%]+$/.test(sanitizedExpr)) {
      // Replace ^ with ** for exponentiation
      const jsExpr = sanitizedExpr.replace(/\^/g, '**');
      
      // Use Function constructor to safely evaluate the expression
      const result = new Function(`return ${jsExpr}`)();
      
      // Format the result nicely
      if (Number.isInteger(result)) {
        return result.toString();
      } else {
        // Round to 4 decimal places for cleaner results
        return Number(result.toFixed(4)).toString();
      }
    }
    
    // Check for special mathematical functions
    if (sanitizedExpr.includes('sqrt')) {
      const numStr = sanitizedExpr.match(/sqrt\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.sqrt(num).toFixed(4);
      }
    }
    
    if (sanitizedExpr.includes('sin')) {
      const numStr = sanitizedExpr.match(/sin\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.sin(num).toFixed(4);
      }
    }
    
    if (sanitizedExpr.includes('cos')) {
      const numStr = sanitizedExpr.match(/cos\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.cos(num).toFixed(4);
      }
    }
    
    if (sanitizedExpr.includes('tan')) {
      const numStr = sanitizedExpr.match(/tan\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.tan(num).toFixed(4);
      }
    }
    
    if (sanitizedExpr.includes('log')) {
      const numStr = sanitizedExpr.match(/log\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.log10(num).toFixed(4);
      }
    }
    
    if (sanitizedExpr.includes('ln')) {
      const numStr = sanitizedExpr.match(/ln\(([^)]+)\)/)?.[1];
      if (numStr) {
        const num = parseFloat(numStr);
        return Math.log(num).toFixed(4);
      }
    }
    
    // Not a pattern we can handle locally
    return '';
  } catch (error) {
    console.error('Math evaluation error:', error);
    return '';
  }
};

// Check if a user input likely contains a math problem
const isMathProblem = (input) => {
  // Basic check for math operators and patterns
  const mathOperators = /[\+\-\*\/\^\%\=]/;
  const mathFunctions = /(sqrt|sin|cos|tan|log|ln)\(/i;
  const hasNumbers = /\d+/;
  
  // Check for patterns like "calculate", "solve", "what is", etc.
  const mathKeywords = /(calculate|compute|solve|evaluate|what is|find the|value of)/i;
  
  return (mathOperators.test(input) && hasNumbers.test(input)) || 
         mathFunctions.test(input) || 
         (mathKeywords.test(input) && hasNumbers.test(input));
};

// Solve a math problem completely locally
const solveMathProblem = (input) => {
  // Extract the actual expression from the input
  let expr = input;
  
  // Remove common prefixes like "calculate", "what is", etc.
  expr = expr.replace(/(calculate|compute|solve|evaluate|what is|find the|value of)/i, '').trim();
  
  // Remove question marks and other punctuation
  expr = expr.replace(/[?!\.]/g, '').trim();
  
  // Try to evaluate the expression
  const result = evaluateMathExpression(expr);
  
  if (result) {
    return `The result of ${expr} is ${result}`;
  }
  
  // If we couldn't solve it locally, return null to indicate the backend should handle it
  return null;
};

module.exports = {
  evaluateMathExpression,
  isMathProblem,
  solveMathProblem
};
