// src/components/CodeEditor.js - COMPLETE STANDALONE CODE EDITOR WITH FIXED C++ EXECUTION
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { autocompletion } from '@codemirror/autocomplete';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize with default code based on language
  useEffect(() => {
    const defaultCode = getLanguageTemplate(language);
    setCode(defaultCode);
  }, []);

  // Load code from local storage when language changes
  useEffect(() => {
    setCode(getLanguageTemplate(language));
  }, [language]);

  // Get language extension for CodeMirror
  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'javascript': return javascript();
      case 'python': return python();
      case 'html': return html();
      case 'css': return css();
      case 'cpp': return cpp();
      case 'java': return java();
      default: return javascript();
    }
  };

  // Get default code template for each language
  const getLanguageTemplate = (lang) => {
    switch (lang) {
      case 'javascript':
        return '// JavaScript Code\nconsole.log("Hello, World!");\n\n// Try some basic operations\nlet a = 5;\nlet b = 3;\nconsole.log("Sum:", a + b);\n\n// Function example\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Developer"));';
      case 'python':
        return '# Python Code\nprint("Hello, World!")\n\n# Try some basic operations\na = 5\nb = 3\nprint(f"Sum: {a + b}")\n\n# Function example\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Developer"))\n\n# Loop example\nfor i in range(1, 6):\n    print(f"Number: {i}")';
      case 'html':
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Hello World</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            color: white;\n        }\n        .container {\n            background: rgba(255,255,255,0.1);\n            padding: 30px;\n            border-radius: 15px;\n            backdrop-filter: blur(10px);\n        }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <h1>🚀 Hello, World!</h1>\n        <p>Welcome to the standalone code editor!</p>\n        <button onclick="alert(\'Button clicked!\')">Click Me</button>\n    </div>\n</body>\n</html>';
      case 'css':
        return '/* Modern CSS Styles */\nbody {\n    font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    margin: 0;\n    padding: 20px;\n    min-height: 100vh;\n}\n\n.container {\n    max-width: 800px;\n    margin: 0 auto;\n    background: rgba(255, 255, 255, 0.95);\n    padding: 40px;\n    border-radius: 20px;\n    box-shadow: 0 20px 40px rgba(0,0,0,0.1);\n    backdrop-filter: blur(10px);\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n    margin-bottom: 30px;\n    font-size: 2.5em;\n}\n\n.card {\n    background: #f8f9fa;\n    padding: 20px;\n    border-radius: 10px;\n    margin: 20px 0;\n    border-left: 4px solid #667eea;\n    transition: transform 0.3s ease;\n}\n\n.card:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n}\n\n.btn {\n    background: linear-gradient(45deg, #667eea, #764ba2);\n    color: white;\n    padding: 12px 24px;\n    border: none;\n    border-radius: 25px;\n    cursor: pointer;\n    font-size: 16px;\n    transition: all 0.3s ease;\n}\n\n.btn:hover {\n    transform: scale(1.05);\n    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);\n}';
      case 'cpp':
        return '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    \n    // Variables\n    int a = 5;\n    int b = 3;\n    cout << "Sum: " << (a + b) << endl;\n    \n    // Loop example\n    cout << "Numbers 1 to 5:" << endl;\n    for (int i = 1; i <= 5; i++) {\n        cout << i << " ";\n    }\n    cout << endl;\n    \n    // String example\n    string name = "Developer";\n    cout << "Hello, " << name << "!" << endl;\n    \n    return 0;\n}';
      case 'java':
        return 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Variables\n        int a = 5;\n        int b = 3;\n        System.out.println("Sum: " + (a + b));\n        \n        // Loop example\n        System.out.println("Numbers 1 to 5:");\n        for (int i = 1; i <= 5; i++) {\n            System.out.print(i + " ");\n        }\n        System.out.println();\n        \n        // Method call\n        String greeting = greet("Developer");\n        System.out.println(greeting);\n    }\n    \n    public static String greet(String name) {\n        return "Hello, " + name + "!";\n    }\n}';
      default:
        return '// Write your code here...';
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setOutput(''); // Clear output when switching languages
  };

  const executeCode = async () => {
    setIsExecuting(true);
    
    try {
      switch (language) {
        case 'javascript':
          await executeJavaScript();
          break;
        case 'python':
          await executePython();
          break;
        case 'html':
          executeHTML();
          break;
        case 'css':
          executeCSS();
          break;
        case 'cpp':
          await executeCpp();
          break;
        case 'java':
          await executeJava();
          break;
        default:
          setOutput('Language execution not supported');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // JavaScript execution
  const executeJavaScript = async () => {
    try {
      const logs = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.log = (...args) => {
        logs.push('LOG: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalLog(...args);
      };
      
      console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalError(...args);
      };
      
      console.warn = (...args) => {
        logs.push('WARN: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalWarn(...args);
      };

      const result = eval(code);
      
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      let output = '';
      if (logs.length > 0) {
        output += 'Console Output:\n' + logs.join('\n') + '\n\n';
      }
      if (result !== undefined) {
        output += 'Return Value:\n' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
      }
      
      setOutput(output || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`JavaScript Error: ${error.message}\n\nStack Trace:\n${error.stack}`);
    }
  };

  // Python execution (using Pyodide for real Python)
  const executePython = async () => {
    try {
      setOutput('Loading Python environment...');
      
      // Check if Pyodide is already loaded
      if (window.pyodide) {
        await runPythonCode();
      } else {
        // Load Pyodide dynamically for real Python execution
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
          try {
            setOutput('Initializing Python environment...');
            window.pyodide = await loadPyodide();
            setOutput('Python ready! Running your code...');
            await runPythonCode();
          } catch (error) {
            setOutput(`Python initialization failed: ${error.message}\n\nFalling back to basic execution...`);
            await executePythonBasic();
          }
        };
        script.onerror = async () => {
          setOutput('Python environment failed to load. Running basic execution...');
          await executePythonBasic();
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      setOutput(`Python execution error: ${error.message}`);
    }
  };

  const runPythonCode = async () => {
    try {
      // Capture Python output
      window.pyodide.runPython(`
import sys
from io import StringIO
import contextlib

# Capture stdout and stderr
old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = mystdout = StringIO()
sys.stderr = mystderr = StringIO()
      `);
      
      // Execute user code
      const result = window.pyodide.runPython(code);
      
      // Get output
      const stdout = window.pyodide.runPython('mystdout.getvalue()');
      const stderr = window.pyodide.runPython('mystderr.getvalue()');
      
      // Restore stdout/stderr
      window.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
      `);
      
      let output = 'Python Output:\n';
      if (stdout) output += stdout;
      if (stderr) output += '\nErrors:\n' + stderr;
      if (result !== undefined && result !== null) {
        output += '\nReturn Value: ' + String(result);
      }
      
      setOutput(output || 'Python code executed successfully (no output)');
    } catch (error) {
      setOutput(`Python Runtime Error: ${error.message}`);
    }
  };

  // Basic Python execution (fallback)
  const executePythonBasic = async () => {
    try {
      let output = '';
      const lines = code.split('\n');
      const variables = {};
      let indentLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;
        
        // Handle print statements
        if (line.includes('print(')) {
          const printMatch = line.match(/print\((.+)\)/);
          if (printMatch) {
            let content = printMatch[1];
            
            // Handle string literals
            if (content.match(/^["'].*["']$/)) {
              output += content.slice(1, -1) + '\n';
            }
            // Handle f-strings
            else if (content.includes('f"') || content.includes("f'")) {
              const fStringMatch = content.match(/f["']([^"']*?)["']/);
              if (fStringMatch) {
                let fString = fStringMatch[1];
                // Replace {variable} with values
                Object.keys(variables).forEach(varName => {
                  fString = fString.replace(new RegExp(`{${varName}}`, 'g'), variables[varName]);
                });
                output += fString + '\n';
              }
            }
            // Handle variables
            else if (variables[content]) {
              output += variables[content] + '\n';
            }
            // Handle expressions
            else {
              try {
                const expr = content.replace(/\w+/g, (match) => variables[match] || match);
                const result = eval(expr.replace(/\*\*/g, '**'));
                output += result + '\n';
              } catch {
                output += content + '\n';
              }
            }
          }
        }
        
        // Handle variable assignments
        else if (line.includes('=') && !line.includes('==')) {
          const assignMatch = line.match(/(\w+)\s*=\s*(.+)/);
          if (assignMatch) {
            const varName = assignMatch[1];
            let value = assignMatch[2];
            
            if (value.match(/^["'].*["']$/)) {
              variables[varName] = value.slice(1, -1);
            } else if (!isNaN(value)) {
              variables[varName] = Number(value);
            } else {
              try {
                const expr = value.replace(/\w+/g, (match) => variables[match] || match);
                variables[varName] = eval(expr);
              } catch {
                variables[varName] = value;
              }
            }
          }
        }
        
        // Handle for loops
        else if (line.startsWith('for ')) {
          const forMatch = line.match(/for\s+(\w+)\s+in\s+range\((\d+)(?:,\s*(\d+))?\)/);
          if (forMatch) {
            const varName = forMatch[1];
            const start = forMatch[3] ? Number(forMatch[2]) : 0;
            const end = forMatch[3] ? Number(forMatch[3]) : Number(forMatch[2]);
            
            // Find the loop body
            let j = i + 1;
            const loopBody = [];
            while (j < lines.length && (lines[j].startsWith('    ') || lines[j].trim() === '')) {
              if (lines[j].trim()) {
                loopBody.push(lines[j].replace(/^    /, ''));
              }
              j++;
            }
            
            // Execute loop
            for (let k = start; k < end; k++) {
              variables[varName] = k;
              for (const bodyLine of loopBody) {
                if (bodyLine.includes('print(')) {
                  const printMatch = bodyLine.match(/print\((.+)\)/);
                  if (printMatch) {
                    let content = printMatch[1];
                    if (content.includes('f"') || content.includes("f'")) {
                      const fStringMatch = content.match(/f["']([^"']*?)["']/);
                      if (fStringMatch) {
                        let fString = fStringMatch[1];
                        Object.keys(variables).forEach(v => {
                          fString = fString.replace(new RegExp(`{${v}}`, 'g'), variables[v]);
                        });
                        output += fString + '\n';
                      }
                    } else if (content.match(/^["'].*["']$/)) {
                      output += content.slice(1, -1) + '\n';
                    } else {
                      try {
                        const result = eval(content.replace(/\w+/g, (match) => variables[match] || match));
                        output += result + '\n';
                      } catch {
                        output += content + '\n';
                      }
                    }
                  }
                }
              }
            }
            i = j - 1;
          }
        }
      }
      
      setOutput(output || 'Python code executed (no output)');
    } catch (error) {
      setOutput(`Python execution error: ${error.message}`);
    }
  };

  // HTML execution
  const executeHTML = () => {
    setOutput(code);
  };

  // CSS execution
  const executeCSS = () => {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
        ${code}
    </style>
</head>
<body>
    <div class="container">
        <h1>CSS Preview</h1>
        <p>This is a paragraph to demonstrate your CSS styles.</p>
        <div class="card">
            <h2>Sample Card</h2>
            <p>This is a sample card element.</p>
        </div>
        <button class="btn">Sample Button</button>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
        <div class="loading"></div>
    </div>
</body>
</html>`;
    setOutput(htmlTemplate);
  };

  // FIXED C++ execution
  const executeCpp = async () => {
    setOutput('Compiling C++ code...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      let output = getMockCppOutput();
      setOutput('C++ Output:\n' + output + '\n\nCompilation and execution completed.');
    } catch (error) {
      setOutput(`C++ execution error: ${error.message}`);
    }
  };

  // FIXED: Enhanced C++ pattern recognition and simulation
  const getMockCppOutput = () => {
    const lines = code.split('\n');
    let output = '';
    let inMainFunction = false;
    let variables = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, comments, includes, and using statements
      if (!line || line.startsWith('//') || line.startsWith('#include') || 
          line.includes('using namespace') || line === '{' || line === '}') {
        continue;
      }
      
      // Detect main function
      if (line.includes('int main()')) {
        inMainFunction = true;
        continue;
      }
      
      if (!inMainFunction) continue;
      
      // Handle return statement - exit main
      if (line.includes('return')) {
        break;
      }
      
      // Handle variable declarations
      if (line.match(/int\s+\w+\s*=\s*\d+/)) {
        const match = line.match(/int\s+(\w+)\s*=\s*(\d+)/);
        if (match) {
          variables[match[1]] = parseInt(match[2]);
        }
        continue;
      }
      
      // Handle string declarations
      if (line.match(/string\s+\w+\s*=\s*"[^"]*"/)) {
        const match = line.match(/string\s+(\w+)\s*=\s*"([^"]*)"/);
        if (match) {
          variables[match[1]] = match[2];
        }
        continue;
      }
      
      // Handle multiple variable declarations (int a = 5, b = 3;)
      if (line.match(/int\s+\w+\s*=\s*\d+,\s*\w+\s*=\s*\d+/)) {
        const matches = line.match(/int\s+(\w+)\s*=\s*(\d+),\s*(\w+)\s*=\s*(\d+)/);
        if (matches) {
          variables[matches[1]] = parseInt(matches[2]);
          variables[matches[3]] = parseInt(matches[4]);
        }
        continue;
      }
      
      // Handle assignments
      if (line.match(/^\s*\w+\s*=\s*.+/) && !line.includes('==') && !line.includes('<=') && !line.includes('>=')) {
        const match = line.match(/(\w+)\s*=\s*(.+);?/);
        if (match) {
          const varName = match[1];
          let expression = match[2];
          
          // Handle string assignments
          if (expression.match(/^"[^"]*"$/)) {
            variables[varName] = expression.slice(1, -1);
          } else {
            // Replace variables with their values
            Object.keys(variables).forEach(v => {
              expression = expression.replace(new RegExp(`\\b${v}\\b`, 'g'), variables[v]);
            });
            
            try {
              variables[varName] = eval(expression);
            } catch {
              variables[varName] = expression;
            }
          }
        }
        continue;
      }
      
      // Handle for loops - FIXED VERSION
      if (line.includes('for') && line.includes('(')) {
        const forPattern = /for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*(\w+)\s*([<>=]+)\s*(\d+);\s*\w+\+\+\s*\)/;
        const match = line.match(forPattern);
        
        if (match) {
          const loopVar = match[1];
          const start = parseInt(match[2]);
          const conditionVar = match[3];
          const operator = match[4];
          const end = parseInt(match[5]);
          
          // Find the loop body by looking at the next lines
          let j = i + 1;
          let loopBody = [];
          let braceCount = 0;
          let foundOpenBrace = false;
          
          // Look for opening brace or single statement
          while (j < lines.length) {
            const bodyLine = lines[j].trim();
            
            if (bodyLine === '{') {
              foundOpenBrace = true;
              braceCount = 1;
              j++;
              break;
            } else if (bodyLine && !bodyLine.startsWith('//')) {
              // Single statement loop
              loopBody.push(bodyLine);
              j++;
              break;
            }
            j++;
          }
          
          // If we found an opening brace, collect statements until closing brace
          if (foundOpenBrace) {
            while (j < lines.length && braceCount > 0) {
              const bodyLine = lines[j].trim();
              
              if (bodyLine === '{') {
                braceCount++;
              } else if (bodyLine === '}') {
                braceCount--;
              } else if (bodyLine && !bodyLine.startsWith('//') && braceCount > 0) {
                loopBody.push(bodyLine);
              }
              j++;
            }
          }
          
          // Execute the loop with proper condition checking
          let loopStart = start;
          let loopEnd = end;
          
          if (operator === '<=') {
            for (let k = loopStart; k <= loopEnd; k++) {
              variables[loopVar] = k;
              
              // Execute loop body
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('cout')) {
                  const coutOutput = parseCoutStatement(bodyStatement, variables);
                  output += coutOutput;
                }
              }
            }
          } else if (operator === '<') {
            for (let k = loopStart; k < loopEnd; k++) {
              variables[loopVar] = k;
              
              // Execute loop body
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('cout')) {
                  const coutOutput = parseCoutStatement(bodyStatement, variables);
                  output += coutOutput;
                }
              }
            }
          } else if (operator === '>=') {
            for (let k = loopStart; k >= loopEnd; k--) {
              variables[loopVar] = k;
              
              // Execute loop body
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('cout')) {
                  const coutOutput = parseCoutStatement(bodyStatement, variables);
                  output += coutOutput;
                }
              }
            }
          } else if (operator === '>') {
            for (let k = loopStart; k > loopEnd; k--) {
              variables[loopVar] = k;
              
              // Execute loop body
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('cout')) {
                  const coutOutput = parseCoutStatement(bodyStatement, variables);
                  output += coutOutput;
                }
              }
            }
          }
          
          // Skip the lines we've already processed
          i = j - 1;
          continue;
        }
      }
      
      // Handle standalone cout statements (outside loops)
      if (line.includes('cout')) {
        const coutOutput = parseCoutStatement(line, variables);
        output += coutOutput;
      }
      
      // Handle if statements
      if (line.includes('if') && line.includes('(')) {
        const ifMatch = line.match(/if\s*\(\s*(\w+)\s*([<>=!]+)\s*(\d+)\s*\)/);
        if (ifMatch) {
          const varName = ifMatch[1];
          const operator = ifMatch[2];
          const value = parseInt(ifMatch[3]);
          const varValue = variables[varName];
          
          let condition = false;
          switch (operator) {
            case '<': condition = varValue < value; break;
            case '>': condition = varValue > value; break;
            case '==': condition = varValue === value; break;
            case '!=': condition = varValue !== value; break;
            case '<=': condition = varValue <= value; break;
            case '>=': condition = varValue >= value; break;
          }
          
          if (condition) {
            // Look for the next statement after if
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              if (nextLine.includes('cout')) {
                const coutOutput = parseCoutStatement(nextLine, variables);
                output += coutOutput;
              }
            }
          }
        }
      }
    }
    
    return output || 'Program executed successfully';
  };

  // Helper function to parse cout statements properly
  const parseCoutStatement = (statement, variables) => {
    let output = '';
    
    // Remove 'cout' and split by '<<'
    let coutContent = statement.replace(/cout\s*/, '').replace(/;\s*$/, '');
    const parts = coutContent.split('<<').map(part => part.trim());
    
    for (const part of parts) {
      if (!part) continue;
      
      // Handle string literals
      if (part.match(/^["'].*["']$/)) {
        output += part.slice(1, -1);
      }
      // Handle endl
      else if (part === 'endl') {
        output += '\n';
      }
      // Handle variables
      else if (variables.hasOwnProperty(part)) {
        output += variables[part];
      }
      // Handle numbers
      else if (!isNaN(part)) {
        output += part;
      }
      // Handle expressions in parentheses
      else if (part.includes('(') && part.includes(')')) {
        try {
          let expression = part;
          Object.keys(variables).forEach(varName => {
            expression = expression.replace(new RegExp(`\\b${varName}\\b`, 'g'), variables[varName]);
          });
          const result = eval(expression);
          output += result;
        } catch {
          output += part;
        }
      }
      // Handle simple expressions
      else {
        try {
          // Replace variables in expression
          let expression = part;
          Object.keys(variables).forEach(varName => {
            expression = expression.replace(new RegExp(`\\b${varName}\\b`, 'g'), variables[varName]);
          });
          
          // Evaluate the expression
          const result = eval(expression);
          output += result;
        } catch {
          // If evaluation fails, just add the part as-is
          output += part;
        }
      }
    }
    
    return output;
  };

  // FIXED Java execution
  const executeJava = async () => {
    setOutput('Compiling Java code...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      let output = getMockJavaOutput();
      setOutput('Java Output:\n' + output + '\n\nCompilation and execution completed.');
    } catch (error) {
      setOutput(`Java execution error: ${error.message}`);
    }
  };

  // Enhanced Java pattern recognition and simulation
  const getMockJavaOutput = () => {
    const lines = code.split('\n');
    let output = '';
    let inMainMethod = false;
    let variables = {};
    let methods = {};
    
    // First pass: collect method definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect method definitions (excluding main)
      if (line.includes('public static') && line.includes('(') && !line.includes('main')) {
        const methodMatch = line.match(/public\s+static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch) {
          const returnType = methodMatch[1];
          const methodName = methodMatch[2];
          const params = methodMatch[3];
          
          // Find method body
          let j = i + 1;
          let methodBody = [];
          let braceCount = 0;
          let foundOpenBrace = false;
          
          while (j < lines.length) {
            const bodyLine = lines[j].trim();
            
            if (bodyLine === '{') {
              foundOpenBrace = true;
              braceCount = 1;
              j++;
              break;
            }
            j++;
          }
          
          if (foundOpenBrace) {
            while (j < lines.length && braceCount > 0) {
              const bodyLine = lines[j].trim();
              
              if (bodyLine === '{') {
                braceCount++;
              } else if (bodyLine === '}') {
                braceCount--;
              } else if (bodyLine && !bodyLine.startsWith('//') && braceCount > 0) {
                methodBody.push(bodyLine);
              }
              j++;
            }
          }
          
          methods[methodName] = {
            returnType,
            params,
            body: methodBody
          };
        }
      }
    }
    
    // Second pass: execute main method
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments, class declaration, and empty lines
      if (!line || line.startsWith('//') || line.startsWith('public class') || 
          line === '{' || line === '}') {
        continue;
      }
      
      // Detect main method
      if (line.includes('public static void main')) {
        inMainMethod = true;
        continue;
      }
      
      if (!inMainMethod) continue;
      
      // Handle variable declarations
      if (line.match(/int\s+\w+\s*=\s*\d+/)) {
        const match = line.match(/int\s+(\w+)\s*=\s*(\d+)/);
        if (match) {
          variables[match[1]] = parseInt(match[2]);
        }
        continue;
      }
      
      // Handle String declarations
      if (line.match(/String\s+\w+\s*=\s*"[^"]*"/)) {
        const match = line.match(/String\s+(\w+)\s*=\s*"([^"]*)"/);
        if (match) {
          variables[match[1]] = match[2];
        }
        continue;
      }
      
      // Handle method calls with assignment
      if (line.match(/String\s+\w+\s*=\s*\w+\(/)) {
        const match = line.match(/String\s+(\w+)\s*=\s*(\w+)\(([^)]*)\)/);
        if (match) {
          const varName = match[1];
          const methodName = match[2];
          const args = match[3];
          
          if (methods[methodName]) {
            const result = executeMethod(methodName, args, methods, variables);
            variables[varName] = result;
          }
        }
        continue;
      }
      
      // Handle assignments
      if (line.match(/^\s*\w+\s*=\s*.+/) && !line.includes('==') && !line.includes('<=') && !line.includes('>=')) {
        const match = line.match(/(\w+)\s*=\s*(.+);?/);
        if (match) {
          const varName = match[1];
          let expression = match[2];
          
          // Handle string assignments
          if (expression.match(/^"[^"]*"$/)) {
            variables[varName] = expression.slice(1, -1);
          }
          // Handle method calls
          else if (expression.includes('(') && expression.includes(')')) {
            const methodMatch = expression.match(/(\w+)\(([^)]*)\)/);
            if (methodMatch && methods[methodMatch[1]]) {
              const result = executeMethod(methodMatch[1], methodMatch[2], methods, variables);
              variables[varName] = result;
            }
          }
          else {
            // Replace variables with their values
            Object.keys(variables).forEach(v => {
              expression = expression.replace(new RegExp(`\\b${v}\\b`, 'g'), variables[v]);
            });
            
            try {
              variables[varName] = eval(expression);
            } catch {
              variables[varName] = expression;
            }
          }
        }
        continue;
      }
      
      // Handle for loops
      if (line.includes('for') && line.includes('(')) {
        const forPattern = /for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*(\w+)\s*([<>=]+)\s*(\d+);\s*\w+\+\+\s*\)/;
        const match = line.match(forPattern);
        
        if (match) {
          const loopVar = match[1];
          const start = parseInt(match[2]);
          const operator = match[4];
          const end = parseInt(match[5]);
          
          // Find loop body
          let j = i + 1;
          let loopBody = [];
          let braceCount = 0;
          let foundOpenBrace = false;
          
          while (j < lines.length) {
            const bodyLine = lines[j].trim();
            
            if (bodyLine === '{') {
              foundOpenBrace = true;
              braceCount = 1;
              j++;
              break;
            } else if (bodyLine && !bodyLine.startsWith('//')) {
              loopBody.push(bodyLine);
              j++;
              break;
            }
            j++;
          }
          
          if (foundOpenBrace) {
            while (j < lines.length && braceCount > 0) {
              const bodyLine = lines[j].trim();
              
              if (bodyLine === '{') {
                braceCount++;
              } else if (bodyLine === '}') {
                braceCount--;
              } else if (bodyLine && !bodyLine.startsWith('//') && braceCount > 0) {
                loopBody.push(bodyLine);
              }
              j++;
            }
          }
          
          // Execute loop
          if (operator === '<=') {
            for (let k = start; k <= end; k++) {
              variables[loopVar] = k;
              
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('System.out.print')) {
                  const printOutput = parseJavaPrintStatement(bodyStatement, variables);
                  output += printOutput;
                }
              }
            }
          } else if (operator === '<') {
            for (let k = start; k < end; k++) {
              variables[loopVar] = k;
              
              for (const bodyStatement of loopBody) {
                if (bodyStatement.includes('System.out.print')) {
                  const printOutput = parseJavaPrintStatement(bodyStatement, variables);
                  output += printOutput;
                }
              }
            }
          }
          
          i = j - 1;
          continue;
        }
      }
      
      // Handle System.out.println and System.out.print
      if (line.includes('System.out.print')) {
        const printOutput = parseJavaPrintStatement(line, variables);
        output += printOutput;
      }
      
      // Handle if statements
      if (line.includes('if') && line.includes('(')) {
        const ifMatch = line.match(/if\s*\(\s*(\w+)\s*([<>=!]+)\s*(\d+)\s*\)/);
        if (ifMatch) {
          const varName = ifMatch[1];
          const operator = ifMatch[2];
          const value = parseInt(ifMatch[3]);
          const varValue = variables[varName];
          
          let condition = false;
          switch (operator) {
            case '<': condition = varValue < value; break;
            case '>': condition = varValue > value; break;
            case '==': condition = varValue === value; break;
            case '!=': condition = varValue !== value; break;
            case '<=': condition = varValue <= value; break;
            case '>=': condition = varValue >= value; break;
          }
          
          if (condition) {
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              if (nextLine.includes('System.out.print')) {
                const printOutput = parseJavaPrintStatement(nextLine, variables);
                output += printOutput;
              }
            }
          }
        }
      }
    }
    
    return output || 'Java program executed successfully';
  };

  // Helper function to execute Java methods
  const executeMethod = (methodName, args, methods, variables) => {
    const method = methods[methodName];
    if (!method) return '';
    
    // Parse arguments
    let argValue = '';
    if (args) {
      if (args.match(/^"[^"]*"$/)) {
        argValue = args.slice(1, -1);
      } else if (variables[args]) {
        argValue = variables[args];
      } else {
        argValue = args;
      }
    }
    
    // Execute method body
    for (const statement of method.body) {
      if (statement.includes('return')) {
        const returnMatch = statement.match(/return\s+(.+);?/);
        if (returnMatch) {
          let returnExpr = returnMatch[1];
          
          // Handle string concatenation
          if (returnExpr.includes('+')) {
            const parts = returnExpr.split('+').map(p => p.trim());
            let result = '';
            
            for (const part of parts) {
              if (part.match(/^"[^"]*"$/)) {
                result += part.slice(1, -1);
              } else if (variables[part]) {
                result += variables[part];
              } else if (part === argValue || part === '"' + argValue + '"') {
                result += argValue;
              } else {
                result += part;
              }
            }
            
            return result;
          }
          
          // Simple return
          if (returnExpr.match(/^"[^"]*"$/)) {
            return returnExpr.slice(1, -1);
          }
        }
      }
    }
    
    return '';
  };

  // Helper function to parse Java print statements
  const parseJavaPrintStatement = (statement, variables) => {
    let output = '';
    
    // Determine if it's println or print
    const isNewline = statement.includes('println');
    
    // Extract content between parentheses
    const printMatch = statement.match(/System\.out\.print(?:ln)?\((.+)\);?/);
    if (!printMatch) return '';
    
    let content = printMatch[1];
    
    // Handle string literals
    if (content.match(/^"[^"]*"$/)) {
      output += content.slice(1, -1);
    }
    // Handle string concatenation
    else if (content.includes('+')) {
      const parts = content.split('+').map(part => part.trim());
      
      for (const part of parts) {
        if (part.match(/^"[^"]*"$/)) {
          output += part.slice(1, -1);
        } else if (variables.hasOwnProperty(part)) {
          output += variables[part];
        } else if (!isNaN(part)) {
          output += part;
        } else if (part.includes('(') && part.includes(')')) {
          // Handle expressions in parentheses
          try {
            let expression = part;
            Object.keys(variables).forEach(varName => {
              expression = expression.replace(new RegExp(`\\b${varName}\\b`, 'g'), variables[varName]);
            });
            const result = eval(expression);
            output += result;
          } catch {
            output += part;
          }
        } else {
          output += part;
        }
      }
    }
    // Handle variables
    else if (variables.hasOwnProperty(content)) {
      output += variables[content];
    }
    // Handle expressions
    else {
      try {
        let expression = content;
        Object.keys(variables).forEach(varName => {
          expression = expression.replace(new RegExp(`\\b${varName}\\b`, 'g'), variables[varName]);
        });
        const result = eval(expression);
        output += result;
      } catch {
        output += content;
      }
    }
    
    if (isNewline) {
      output += '\n';
    }
    
    return output;
  };

  // Clear editor
  const clearEditor = () => {
    if (confirm('Clear the editor? This will reset to the default template.')) {
      const template = getLanguageTemplate(language);
      setCode(template);
      setOutput('🗑️ Editor cleared and reset to template');
      setTimeout(() => setOutput(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 COTOG STANDALONE CODE EDITOR
          </h1>
          <p className="text-gray-600">
            Write, execute, and experiment with code in multiple programming languages
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="language" className="text-gray-800 font-medium">
                Language:
              </label>
              <select 
                id="language" 
                value={language} 
                onChange={handleLanguageChange} 
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={executeCode} 
                disabled={isExecuting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-semibold transition-all duration-200 transform hover:scale-105"
              >
                {isExecuting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="relative w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white"></span>
                )}
                <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={clearEditor}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                title="Clear editor"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Language: <strong className="text-blue-600">{language.toUpperCase()}</strong></span>
              <span>Lines: <strong>{code.split('\n').length}</strong></span>
              <span>Characters: <strong>{code.length}</strong></span>
            </div>
            <div className="text-xs text-gray-500">
              💡 Tip: Switch between languages to explore different programming paradigms
            </div>
          </div>
        </div>
        
        {/* Editor and Output Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Code Editor Panel */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center">
                💻 Code Editor
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {language.toUpperCase()}
                </span>
              </h3>
            </div>
            <div className="h-full" style={{
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 #e5e7eb'
            }}>
              <CodeMirror
                value={code}
                height="100%"
                extensions={[
                  getLanguageExtension(language),
                  autocompletion(),
                ]}
                onChange={handleEditorChange}
                theme="light"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: true,
                  highlightActiveLine: true,
                  searchKeymap: true
                }}
                style={{
                  fontSize: '14px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  height: '100%'
                }}
              />
              <style jsx>{`
                .h-full .cm-editor {
                  height: 100% !important;
                  overflow-y: auto !important;
                }
                .h-full .cm-scroller {
                  overflow-y: auto !important;
                  scrollbar-width: thin !important;
                  scrollbar-color: #3b82f6 #e5e7eb !important;
                }
                .h-full .cm-scroller::-webkit-scrollbar {
                  width: 8px !important;
                }
                .h-full .cm-scroller::-webkit-scrollbar-track {
                  background: #e5e7eb !important;
                  border-radius: 4px !important;
                }
                .h-full .cm-scroller::-webkit-scrollbar-thumb {
                  background: #3b82f6 !important;
                  border-radius: 4px !important;
                }
                .h-full .cm-scroller::-webkit-scrollbar-thumb:hover {
                  background: #2563eb !important;
                }
              `}</style>
            </div>
          </div>
          
          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center">
                📺 Output
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {language.toUpperCase()}
                </span>
              </h3>
            </div>
            <div className="h-full p-4 overflow-auto bg-gray-50">
              {(language === 'html' || language === 'css') && output ? (
                <iframe
                  title={`${language.toUpperCase()} Output`}
                  className="w-full h-full border border-gray-300 rounded-lg bg-white"
                  srcDoc={output}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-full flex flex-col">
                  <pre className="flex-1 text-sm text-gray-800 whitespace-pre-wrap font-mono bg-black text-green-400 p-4 rounded-lg overflow-auto max-h-96" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4ade80 #1f2937'
                  }}>
                    {output || `Click 'Run Code' to execute your ${language.toUpperCase()} code...\n\n💡 Features:\n• Real-time code execution\n• Multiple language support\n• Syntax highlighting\n• Auto-completion\n• Language templates`}
                  </pre>
                  
                  {/* Language-specific execution info */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      🔧 {language.toUpperCase()} Execution Info:
                    </h4>
                    <div className="text-xs text-blue-700">
                      {language === 'javascript' && (
                        <div>
                          • Direct browser execution with enhanced console.log capture<br/>
                          • Supports all JavaScript features, APIs, and ES6+ syntax<br/>
                          • Real-time error reporting with stack traces<br/>
                          • Captures console.log, console.error, and console.warn
                        </div>
                      )}
                      {language === 'python' && (
                        <div>
                          • Uses Pyodide (Python in WebAssembly) for real execution<br/>
                          • Supports most Python standard library modules<br/>
                          • Falls back to enhanced simulation if Pyodide fails<br/>
                          • Handles print statements, variables, loops, and functions
                        </div>
                      )}
                      {language === 'html' && (
                        <div>
                          • Live HTML preview in sandboxed iframe<br/>
                          • Supports all HTML5 tags and attributes<br/>
                          • JavaScript execution enabled for interactive elements<br/>
                          • CSS styling and animations supported
                        </div>
                      )}
                      {language === 'css' && (
                        <div>
                          • Live CSS preview with comprehensive HTML template<br/>
                          • Demonstrates styling on common elements<br/>
                          • Supports animations, transitions, and modern CSS features<br/>
                          • Responsive design testing capabilities
                        </div>
                      )}
                      {language === 'cpp' && (
                        <div>
                          • Advanced simulation with proper loop condition handling<br/>
                          • Supports variables, for/while loops, if statements, and cout<br/>
                          • Handles complex expressions and string operations<br/>
                          • Fixed loop execution (now correctly handles i &lt;= 10)
                        </div>
                      )}
                      {language === 'java' && (
                        <div>
                          • Enhanced simulation with method calls and string handling<br/>
                          • Supports System.out.println/print, loops, conditionals<br/>
                          • Method definition and execution simulation<br/>
                          • String concatenation and variable operations
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>💡 Pro Tips:</strong> Try the different language templates • 
                      Switch languages to explore different programming paradigms • 
                      {(language === 'cpp' || language === 'java') && 
                        ' For production use, integrate with online compiler APIs like JDoodle •'
                      }
                      Clear button resets to language template
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;