import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import mermaid from 'mermaid'
import katex from 'katex'

function mathsExpression(expr) {
    if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
      expr = expr.substr(2, expr.length - 4)
      return katex.renderToString(expr)
    } else if (expr.match(/^\$[\s\S]*\$$/)) {
      expr = expr.substr(1, expr.length - 2)
      return katex.renderToString(expr)
    }
  }
  
  const coreMarked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );
  const renderer = new coreMarked.Renderer();
  const overrideCode = function (code, language) {
    console.log(code, language)
    if (language == "mermaid" && (code.match(/^sequenceDiagram/) || code.match(/^graph/))) {
      return '<pre class="mermaid">' + code + '</pre>';
    } else {
      if (!language) {
        const renderMath = mathsExpression(code) 
        console.log(renderMath)
        if (renderMath) return renderMath
      }
      return '<pre><code>' + code + '</code></pre>';
    }
  };
  renderer.code = overrideCode
  renderer.codespan = overrideCode
  
  coreMarked.setOptions({ headerIds: false, mangle: false, gfm: true, breaks: true })
  coreMarked.use({renderer})
  mermaid.initialize({ startOnLoad: false });

  export default coreMarked