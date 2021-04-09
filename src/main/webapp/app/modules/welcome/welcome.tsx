// import './home.scss';

import React from 'react';
import { useStores } from 'app/shared/stores';
import { observer } from 'mobx-react-lite';
import { Redirect } from 'react-router-dom';
import { Row } from 'react-bootstrap';

const Welcome = () => {
  const { authenticationStore, routerStore } = useStores();
  const { from } = (routerStore.location.state as any) || {
    from: { pathname: '/genes', search: location.search },
  };
  if (authenticationStore.isAuthenticated) {
    return <Redirect to={from} />;
  }
  return (
    <Row className="justify-content-center">
      OncoKB is proprietary resource. If you are not authorized to access this system, please exit immediately.
    </Row>
  );
};

export default observer(Welcome);
