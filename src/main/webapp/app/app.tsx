import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'app/config/dayjs.ts';

import React, { useEffect } from 'react';
import { Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from 'app/shared/layout/header/header';
import Footer from 'app/shared/layout/footer/footer';
import ErrorBoundary from 'app/shared/error/error-boundary';
import AppRoutes from 'app/routes';
import DocumentTitle from 'react-document-title';
import { useStores } from './shared/stores';
import { Container } from 'react-bootstrap';

const App = () => {
  const { routerStore } = useStores();
  return (
    <DocumentTitle title={'HOME'}>
      <Router history={routerStore.history}>
        <div className="app-container">
          <ToastContainer position={toast.POSITION.TOP_CENTER} className="toastify-container" toastClassName="toastify-toast" />
          <ErrorBoundary>
            <Header />
          </ErrorBoundary>
          <div className="container-fluid">
            <Container fluid id="app-view-container">
              <AppRoutes />
            </Container>
          </div>
          <Footer />
        </div>
      </Router>
    </DocumentTitle>
  );
};

export default App;
