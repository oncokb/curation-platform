import { PAGE_ROUTE } from 'app/config/constants';
import { useStores } from 'app/shared/stores';
import { observer } from 'mobx-react-lite';
import React, { useLayoutEffect } from 'react';
import { Row } from 'react-bootstrap';

export const Logout = () => {
  const { authenticationStore, routerStore } = useStores();
  useLayoutEffect(() => {
    authenticationStore.logout();
    const logoutUrl = authenticationStore.logoutUrl;
    if (logoutUrl) {
      // if Keycloak, logoutUrl has protocol/openid-connect in it
      window.location.href = logoutUrl.includes('/protocol')
        ? logoutUrl + '?redirect_uri=' + window.location.origin
        : logoutUrl + '?id_token_hint=' + authenticationStore.idToken + '&post_logout_redirect_uri=' + window.location.origin;
    }
    setTimeout(() => {
      routerStore.history.push(PAGE_ROUTE.WELCOME_PAGE);
    }, 1000);
  });
  return (
    <Row className="p-5 justify-content-center">
      <h4>Logged out successfully!</h4>
    </Row>
  );
};

export default observer(Logout);
