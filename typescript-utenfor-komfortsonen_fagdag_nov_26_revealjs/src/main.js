import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';
import 'highlight.js/styles/atom-one-dark.css';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import './style.css';

const deck = new Reveal({
  plugins: [Highlight],

  // Display configuration
  width: 960,
  height: 700,
  margin: 0.04,

  // Transition
  transition: 'slide',
  transitionSpeed: 'default',

  // Behavior
  controls: true,
  progress: true,
  center: true,
  hash: true,

  // Code highlighting
  highlight: {
    highlightOnLoad: true,
    escapeHTML: false,
    defaultLanguage: 'typescript'
  }
});

deck.initialize();
