import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FocusStyleManager } from "@blueprintjs/core";
 
FocusStyleManager.onlyShowFocusOnTabs();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App/>
);