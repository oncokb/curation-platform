import { PAGE_ROUTE } from 'app/config/constants';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import ErrorBoundary from '../error/error-boundary';
import { useStores } from '../stores';
import { getRedirectLoginState } from '../util/common.utils';

export const PrivateRoute = ({ component, ...rest }: RouteProps) => {
  const { authenticationStore, routerStore } = useStores();
  const renderRedirect = (props: any) => {
    return authenticationStore.isAuthenticated ? (
      <ErrorBoundary>{React.createElement(component, props)}</ErrorBoundary>
    ) : (
      <Redirect
        to={{
          pathname: PAGE_ROUTE.WELCOME_PAGE,
          state: getRedirectLoginState(routerStore.location.pathname, routerStore.location.search, routerStore.location.hash),
        }}
      />
    );
  };

  if (!component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

export default observer(PrivateRoute);
