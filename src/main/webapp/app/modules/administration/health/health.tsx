import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';

import { Table, Badge, Col, Row, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/shared/stores';
import HealthModal from './health-modal';

export type IHealthPageProps = StoreProps;

export const HealthPage = (props: IHealthPageProps) => {
  const [healthObject, setHealthObject] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    props.systemHealth();
  }, []);

  const getSystemHealth = () => {
    if (!props.isFetching) {
      props.systemHealth();
    }
  };

  const getSystemHealthInfo = (name, healthObj) => () => {
    setShowModal(true);
    setHealthObject({ ...healthObj, name });
  };

  const handleClose = () => setShowModal(false);

  const renderModal = () => <HealthModal healthObject={healthObject} handleClose={handleClose} showModal={showModal} />;

  const { health, isFetching } = props;
  const data = (health || {}).components || {};

  return (
    <div>
      <h2 id="health-page-heading">Health Checks</h2>
      <p>
        <Button onClick={getSystemHealth} color={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
          <FontAwesomeIcon icon="sync" />
          &nbsp; Refresh
        </Button>
      </p>
      <Row>
        <Col md="12">
          <Table bordered aria-describedby="health-page-heading">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data).map((configPropKey, configPropIndex) =>
                configPropKey !== 'status' ? (
                  <tr key={configPropIndex}>
                    <td>{configPropKey}</td>
                    <td>
                      <Badge color={data[configPropKey].status !== 'UP' ? 'danger' : 'success'}>{data[configPropKey].status}</Badge>
                    </td>
                    <td>
                      {data[configPropKey].details ? (
                        <a onClick={getSystemHealthInfo(configPropKey, data[configPropKey])}>
                          <FontAwesomeIcon icon="eye" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      {renderModal()}
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  health: storeState.adminStore.health,
  isFetching: storeState.adminStore.loading,
  systemHealth: storeState.adminStore.systemHealth,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(HealthPage);
