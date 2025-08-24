import '../css/app.scss';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import store from './Store/store';
import { route as routeFn } from 'ziggy-js';

declare global {
  var route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
createInertiaApp({
  title: title => `${title} - ${appName}`,
  resolve: name =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob('./Pages/**/*.tsx')
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <ReduxProvider store={store}>
        <App {...props} />
      </ReduxProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
