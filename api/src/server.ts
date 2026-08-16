import { createApp } from './app.js';
import * as store from './store.js';

const PORT = 4000;

store.reset();

createApp().listen(PORT, () => {
  console.log(`Publisher API listening on http://localhost:${PORT}`);
});
