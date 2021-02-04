import React, { useState, useEffect } from 'react';

import { connect } from 'app/shared/util/typed-inject';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Row, Col, Button } from 'reactstrap';

import { IRootStore } from 'app/shared/stores';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
export type IUserPasswordProps = StoreProps;

export const PasswordPage = (props: IUserPasswordProps) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    props.reset();
    props.getSession();
    return () => props.reset();
  }, []);

  const handleValidSubmit = (event, values) => {
    props.savePassword(values.currentPassword, values.newPassword);
  };

  const updatePassword = event => setPassword(event.target.value);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="password-title">Password for {props.account.login}</h2>
          <AvForm id="password-form" onValidSubmit={handleValidSubmit}>
            <AvField
              name="currentPassword"
              label="Current password"
              placeholder={'Current password'}
              type="password"
              validate={{
                required: { value: true, errorMessage: 'Your password is required.' },
              }}
            />
            <AvField
              name="newPassword"
              label="New password"
              placeholder={'New password'}
              type="password"
              validate={{
                required: { value: true, errorMessage: 'Your password is required.' },
                minLength: { value: 4, errorMessage: 'Your password is required to be at least 4 characters.' },
                maxLength: { value: 50, errorMessage: 'Your password cannot be longer than 50 characters.' },
              }}
              onChange={updatePassword}
            />
            <PasswordStrengthBar password={password} />
            <AvField
              name="confirmPassword"
              label="New password confirmation"
              placeholder="Confirm the new password"
              type="password"
              validate={{
                required: {
                  value: true,
                  errorMessage: 'Your confirmation password is required.',
                },
                minLength: {
                  value: 4,
                  errorMessage: 'Your confirmation password is required to be at least 4 characters.',
                },
                maxLength: {
                  value: 50,
                  errorMessage: 'Your confirmation password cannot be longer than 50 characters.',
                },
                match: {
                  value: 'newPassword',
                  errorMessage: 'The password and its confirmation do not match!',
                },
              }}
            />
            <Button color="success" type="submit">
              Save
            </Button>
          </AvForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ authStore, passwordStore }: IRootStore) => ({
  account: authStore.account,
  isAuthenticated: authStore.isAuthenticated,
  getSession: authStore.getSession,
  savePassword: passwordStore.savePassword,
  reset: passwordStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(PasswordPage);
