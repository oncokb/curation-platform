import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Button, Col, Progress, Row, Table } from 'reactstrap';
import {
  CacheMetrics,
  DatasourceMetrics,
  GarbageCollectorMetrics,
  HttpRequestMetrics,
  JvmMemory,
  JvmThreads,
  EndpointsRequestsMetrics,
  SystemMetrics,
  Translate,
} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_TIMESTAMP_FORMAT, APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT, APP_WHOLE_NUMBER_FORMAT } from 'app/config/constants';
import { IRootStore } from 'app/shared/stores';

export type IMetricsPageProps = StoreProps;

export const MetricsPage = (props: IMetricsPageProps) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    props.systemMetrics();
    props.systemThreadDump();
  }, []);

  const getMetrics = () => {
    if (!props.isFetching) {
      props.systemMetrics();
      props.systemThreadDump();
    }
  };

  const { metrics, threadDump, isFetching } = props;

  return (
    <div>
      <h2 id="metrics-page-heading">Application Metrics</h2>
      <p>
        <Button onClick={getMetrics} color={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
          <FontAwesomeIcon icon="sync" />
          &nbsp; Refresh
        </Button>
      </p>
      <hr />

      <Row>
        <Col sm="12">
          <h3>JVM Metrics</h3>
          <Row>
            <Col md="4">
              {metrics && metrics.jvm ? <JvmMemory jvmMetrics={metrics.jvm} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} /> : ''}
            </Col>
            <Col md="4">{threadDump ? <JvmThreads jvmThreads={threadDump} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} /> : ''}</Col>
            <Col md="4">
              {metrics && metrics.processMetrics ? (
                <SystemMetrics
                  systemMetrics={metrics.processMetrics}
                  wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT}
                  timestampFormat={APP_TIMESTAMP_FORMAT}
                />
              ) : (
                ''
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {metrics && metrics.garbageCollector ? (
        <GarbageCollectorMetrics garbageCollectorMetrics={metrics.garbageCollector} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} />
      ) : (
        ''
      )}
      {metrics && metrics['http.server.requests'] ? (
        <HttpRequestMetrics
          requestMetrics={metrics['http.server.requests']}
          twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT}
          wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT}
        />
      ) : (
        ''
      )}
      {metrics && metrics.services ? (
        <EndpointsRequestsMetrics endpointsRequestsMetrics={metrics.services} wholeNumberFormat={APP_WHOLE_NUMBER_FORMAT} />
      ) : (
        ''
      )}

      {metrics.cache ? (
        <Row>
          <Col sm="12">
            <CacheMetrics cacheMetrics={metrics.cache} twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT} />
          </Col>
        </Row>
      ) : (
        ''
      )}

      {metrics.databases && JSON.stringify(metrics.databases) !== '{}' ? (
        <Row>
          <Col sm="12">
            <DatasourceMetrics datasourceMetrics={metrics.databases} twoDigitAfterPointFormat={APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT} />
          </Col>
        </Row>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  metrics: storeState.adminStore.metrics,
  isFetching: storeState.adminStore.loading,
  threadDump: storeState.adminStore.threadDump,
  systemMetrics: storeState.adminStore.systemMetrics,
  systemThreadDump: storeState.adminStore.systemThreadDump,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(MetricsPage);
