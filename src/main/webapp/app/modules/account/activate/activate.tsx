import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Row, Col, Alert } from 'reactstrap';
import { getUrlParameter } from 'react-jhipster';

import { IRootStore } from 'app/shared/stores';
const successAlert = (
  <Alert color="success">
    <strong>Your user account has been activated.</strong> Please
    <Link to="/login" className="alert-link">
      sign in
    </Link>
    .
  </Alert>
);

const failureAlert = (
  <Alert color="danger">
    <strong>Your user could not be activated.</strong> Please use the registration form to sign up.
  </Alert>
);

export interface IActivateProps extends StoreProps, RouteComponentProps<{ key: any }> {}

export const ActivatePage = (props: IActivateProps) => {
  useEffect(() => {
    const key = getUrlParameter('key', props.location.search);
    props.activateAction(key);
    return () => {
      props.reset();
    };
  }, []);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>Activation</h1>
          {props.activationSuccess ? successAlert : undefined}
          {props.activationFailure ? failureAlert : undefined}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ activateStore }: IRootStore) => ({
  activationSuccess: activateStore.activationSuccess,
  activationFailure: activateStore.activationFailure,
  activateAction: activateStore.activateAction,
  reset: activateStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ActivatePage);
