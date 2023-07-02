/* @refresh reload */
import { render } from 'solid-js/web';
import "tailwindcss/tailwind.css";
import './index.css';
import Parchment from './Parchment.jsx';

render(
  () => <Parchment/>, 
  document.getElementById('root')
);
