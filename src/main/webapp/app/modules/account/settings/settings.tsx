import React, { useEffect } from 'react';
import { Button, Col, Alert, Row } from 'reactstrap';
import { connect } from 'app/shared/util/typed-inject';

import { AvForm, AvField } from 'availity-reactstrap-validation';

import { IRootStore } from 'app/shared/stores';
export type IUserSettingsProps = StoreProps;

export const SettingsPage = (props: IUserSettingsProps) => {
  useEffect(() => {
    props.getSession();
    return () => {
      props.reset();
    };
  }, []);

  const handleValidSubmit = (event, values) => {
    const account = {
      ...props.account,
      ...values,
    };

    props.saveAccountSettings(account);
    event.persist();
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="settings-title">User settings for {props.account.login}</h2>
          <AvForm id="settings-form" onValidSubmit={handleValidSubmit}>
            {/* First name */}
            <AvField
              className="form-control"
              name="firstName"
              label="First Name"
              id="firstName"
              placeholder="Your first name"
              validate={{
                required: { value: true, errorMessage: 'Your first name is required.' },
                minLength: { value: 1, errorMessage: 'Your first name is required to be at least 1 character' },
                maxLength: { value: 50, errorMessage: 'Your first name cannot be longer than 50 characters' },
              }}
              value={props.account.firstName}
            />
            {/* Last name */}
            <AvField
              className="form-control"
              name="lastName"
              label="Last Name"
              id="lastName"
              placeholder="Your last name"
              validate={{
                required: { value: true, errorMessage: 'Your last name is required.' },
                minLength: { value: 1, errorMessage: 'Your last name is required to be at least 1 character' },
                maxLength: { value: 50, errorMessage: 'Your last name cannot be longer than 50 characters' },
              }}
              value={props.account.lastName}
            />
            {/* Email */}
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
              value={props.account.email}
            />
            <Button color="primary" type="submit">
              Save
            </Button>
          </AvForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ authStore, settingsStore }: IRootStore) => ({
  account: authStore.account,
  isAuthenticated: authStore.isAuthenticated,
  getSession: authStore.getSession,
  saveAccountSettings: settingsStore.saveAccountSettings,
  reset: settingsStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SettingsPage);
