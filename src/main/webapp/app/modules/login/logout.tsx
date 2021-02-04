import React, { useLayoutEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';

import { IRootStore } from 'app/shared/stores';

export interface ILogoutProps extends StoreProps {
  idToken: string;
  logoutUrl: string;
}

export const Logout = (props: ILogoutProps) => {
  useLayoutEffect(() => {
    props.logout();
    const logoutUrl = props.logoutUrl;
    if (logoutUrl) {
      // if Keycloak, logoutUrl has protocol/openid-connect in it
      window.location.href = logoutUrl.includes('/protocol')
        ? logoutUrl + '?redirect_uri=' + window.location.origin
        : logoutUrl + '?id_token_hint=' + props.idToken + '&post_logout_redirect_uri=' + window.location.origin;
    }
  });

  return (
    <div className="p-5">
      <h4>Logged out successfully!</h4>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  logoutUrl: storeState.authStore.logoutUrl,
  idToken: storeState.authStore.idToken,
  logout: storeState.authStore.logout,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Logout);
