import { render } from 'preact';
import { App } from './App';
import { initPWA } from './lib/pwa';
import './styles.css';

render(<App />, document.getElementById('app')!);
initPWA();
