import 'react-toastify/dist/ReactToastify.css';
import './app.scss';

import { hot } from 'react-hot-loader/root';
import 'mobx-react-lite/batchingForReactDom';
import React, { useEffect } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { Card } from 'reactstrap';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { IRootStore } from 'app/shared/stores';
import Header from 'app/shared/layout/header/header';
import Footer from 'app/shared/layout/footer/footer';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import ErrorBoundary from 'app/shared/error/error-boundary';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');

export type IAppProps = StoreProps;

export const App = (props: IAppProps) => {
  useEffect(() => {
    props.getSession();
    props.getProfile();
  }, []);

  const paddingTop = '60px';
  return (
    <Router basename={baseHref}>
      <div className="app-container" style={{ paddingTop }}>
        <ToastContainer position={toast.POSITION.TOP_LEFT} className="toastify-container" toastClassName="toastify-toast" />
        <ErrorBoundary>
          <Header
            isAuthenticated={props.isAuthenticated}
            isAdmin={props.isAdmin}
            ribbonEnv={props.ribbonEnv}
            isInProduction={props.isInProduction}
            isSwaggerEnabled={props.isSwaggerEnabled}
          />
        </ErrorBoundary>
        <div className="container-fluid view-container" id="app-view-container">
          <Card className="jh-card">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </Card>
          <Footer />
        </div>
      </div>
    </Router>
  );
};

const mapStoreToProps = ({ authStore, profileStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  isAdmin: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.ADMIN]),
  ribbonEnv: profileStore.ribbonEnv,
  isInProduction: profileStore.isInProduction,
  isSwaggerEnabled: profileStore.isSwaggerEnabled,
  getSession: authStore.getSession,
  getProfile: profileStore.getProfile,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(hot(observer(App)));
