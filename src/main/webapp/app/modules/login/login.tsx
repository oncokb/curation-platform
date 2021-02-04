import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { IRootStore } from 'app/shared/stores';
import LoginModal from './login-modal';

export interface ILoginProps extends StoreProps, RouteComponentProps<{}> {}

export const Login = (props: ILoginProps) => {
  const [showModal, setShowModal] = useState(props.showModal);

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleLogin = (username, password, rememberMe = false) => props.login(username, password, rememberMe);

  const handleClose = () => {
    setShowModal(false);
    props.history.push('/');
  };

  const { location, isAuthenticated } = props;
  const { from } = (location.state as any) || { from: { pathname: '/', search: location.search } };
  if (isAuthenticated) {
    return <Redirect to={from} />;
  }
  return <LoginModal showModal={showModal} handleLogin={handleLogin} handleClose={handleClose} loginError={props.loginError} />;
};

const mapStoreToProps = ({ authStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  loginError: authStore.loginError,
  showModal: authStore.showModalLogin,
  login: authStore.login,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Login);
