import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { createStores } from 'app/shared/stores';
import { createBrowserHistory } from 'history';

import setupAxiosInterceptors from './config/axios-interceptor';
import ErrorBoundary from './shared/error/error-boundary';
import AppComponent from './app';
import { loadIcons } from './config/icon-loader';

const browserHistory = createBrowserHistory();
const mobxStores = createStores(browserHistory);

setupAxiosInterceptors(() => mobxStores.authStore.clearAuthentication('login.error.unauthorized'));

loadIcons();

const rootEl = document.getElementById('root');

const render = Component =>
  // eslint-disable-next-line react/no-render-return-value
  ReactDOM.render(
    <ErrorBoundary>
      <Provider {...mobxStores}>
        <div>
          <Component />
        </div>
      </Provider>
    </ErrorBoundary>,
    rootEl
  );

render(AppComponent);
