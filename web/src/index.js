import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root'
import Index from './Index';
import reportWebVitals from './reportWebVitals';
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import mermaid from 'mermaid'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import All from './List/all';
import Search from './List/search';
import Editor from './Detail/edit';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
const renderer = new marked.Renderer();
renderer.code = function (code, language) {
  if (code.match(/^sequenceDiagram/) || code.match(/^graph/)) {
    return '<pre class="mermaid">' + code + '</pre>';
  } else {
    return '<pre><code>' + code + '</code></pre>';
  }
};

marked.setOptions({ headerIds: false, mangle: false, gfm: true, breaks: true, renderer })
mermaid.initialize({ startOnLoad: false });
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Index />
      },
      {
        path: "/index",
        element: <Index />
      },
      {
        path: "/all",
        element: <All marked={marked} />
      },
      {
        path: '/search',
        element: <Search marked={marked} />
      },
      {
        path: "/edit",
        element: <Editor marked={marked} />
      },
      {
        path: "/add",
        element: <Editor marked={marked} />
      }
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
