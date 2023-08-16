import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root'
import Index from './Index';
import reportWebVitals from './reportWebVitals';
import coreMarked from './Detail/marked-instance';
import 'katex/dist/katex.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import All from './List/all';
import Search from './List/search';
import Editor from './Detail/edit';


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
        element: <All marked={coreMarked} />
      },
      {
        path: '/search',
        element: <Search marked={coreMarked} />
      },
      {
        path: "/edit",
        element: <Editor marked={coreMarked} />
      },
      {
        path: "/add",
        element: <Editor marked={coreMarked} />
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
