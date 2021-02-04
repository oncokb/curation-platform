import React, { useEffect } from 'react';

import { connect } from 'app/shared/util/typed-inject';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Button, Alert, Col, Row } from 'reactstrap';

import { IRootStore } from 'app/shared/stores';

export const PasswordResetInit = (props: StoreProps) => {
  useEffect(() => {
    return () => {
      props.reset();
    };
  }, []);

  const handleValidSubmit = (event, values) => {
    props.handlePasswordResetInit(values.email);
    event.preventDefault();
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>Reset your password</h1>
          <Alert color="warning">
            <p>Enter the email address you used to register</p>
          </Alert>
          <AvForm onValidSubmit={handleValidSubmit}>
            <AvField
              name="email"
              label="Email"
              placeholder={'Your email'}
              type="email"
              validate={{
                required: { value: true, errorMessage: 'Your email is required.' },
                minLength: { value: 5, errorMessage: 'Your email is required to be at least 5 characters.' },
                maxLength: { value: 254, errorMessage: 'Your email cannot be longer than 50 characters.' },
              }}
            />
            <Button color="primary" type="submit">
              Reset password
            </Button>
          </AvForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ passwordResetStore }: IRootStore) => ({
  handlePasswordResetInit: passwordResetStore.handlePasswordResetInit,
  reset: passwordResetStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(PasswordResetInit);
