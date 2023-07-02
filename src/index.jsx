/* @refresh reload */
import { render } from 'solid-js/web';
import "tailwindcss/tailwind.css";
import './index.css';
import Notepad from './Parchment.jsx';

render(() => <Notepad/>, document.getElementById('root'));
