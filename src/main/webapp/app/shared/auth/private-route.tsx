import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Route, Redirect, RouteProps } from 'react-router-dom';

import { IRootStore } from 'app/shared/stores';
import ErrorBoundary from 'app/shared/error/error-boundary';

interface IOwnProps extends RouteProps {
  hasAnyAuthorities?: string[];
}

export interface IPrivateRouteProps extends IOwnProps, StoreProps {}

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};

export const PrivateRouteComponent = ({
  component: Component,
  isAuthenticated,
  sessionHasBeenFetched,
  account,
  hasAnyAuthorities = [],
  ...rest
}: IPrivateRouteProps) => {
  const isAuthorized = hasAnyAuthority(account.authorities, hasAnyAuthorities);
  const checkAuthorities = props =>
    isAuthorized ? (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    ) : (
      <div className="insufficient-authority">
        <div className="alert alert-danger">You are not authorized to access this page.</div>
      </div>
    );

  const renderRedirect = props => {
    if (!sessionHasBeenFetched) {
      return <div></div>;
    } else {
      return isAuthenticated ? (
        checkAuthorities(props)
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            search: props.location.search,
            state: { from: props.location },
          }}
        />
      );
    }
  };

  if (!Component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

const mapStoreToProps = ({ authStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  account: authStore.account,
  sessionHasBeenFetched: authStore.sessionHasBeenFetched,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

/**
 * A route wrapped in an authentication check so that routing happens only when you are authenticated.
 * Accepts same props as React router Route.
 * The route also checks for authorization if hasAnyAuthorities is specified.
 */
export const PrivateRoute = connect(mapStoreToProps)(PrivateRouteComponent);

export default PrivateRoute;
