import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './shared/error/error-boundary';
import AppComponent from './app';
import { loadIcons } from './config/icon-loader';
import Firebase from './shared/services/firebase';
import { createStores, StoresProvider } from './shared/stores';
import { createBrowserHistory } from 'history';
import { FIREBASE_DEV_CONFIG } from './config/constants';

loadIcons();

const browserHistory = createBrowserHistory();
const firebase = new Firebase(FIREBASE_DEV_CONFIG);
const rootStore = createStores(browserHistory, firebase);

const rootEl = document.getElementById('root');

const render = Component =>
  // eslint-disable-next-line react/no-render-return-value
  ReactDOM.render(
    <StoresProvider value={rootStore}>
      <ErrorBoundary>
        <div>
          <Component />
        </div>
      </ErrorBoundary>
    </StoresProvider>,
    rootEl
  );

render(AppComponent);
