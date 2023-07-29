/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { Router, Route, Routes } from "@solidjs/router";

import { PaymentsScreen, ActivityScreen, SettingsScreen } from './Screen'

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
    <Router>
      <Routes>
        <Route path="/payments" component={PaymentsScreen} />
        <Route path="/" component={ActivityScreen} />
        <Route path="/settings" component={SettingsScreen} />
      </Routes>
    </Router>
  ),
  root!
);
