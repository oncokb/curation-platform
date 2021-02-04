import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';

import { IRootStore } from 'app/shared/stores';

export type ILogsPageProps = StoreProps;

export const LogsPage = (props: ILogsPageProps) => {
  const [filter, setFilter] = useState('');

  useEffect(() => {
    props.getLoggers();
  }, []);

  const getLogs = () => {
    if (!props.isFetching) {
      props.getLoggers();
    }
  };

  const changeLevel = (loggerName, level) => () => props.changeLogLevel(loggerName, level);

  const changeFilter = evt => setFilter(evt.target.value);

  const getClassName = (level, check, className) => (level === check ? `btn btn-sm btn-${className}` : 'btn btn-sm btn-light');

  const filterFn = l => l.name.toUpperCase().includes(filter.toUpperCase());

  const { logs, isFetching } = props;
  const loggers = logs ? Object.entries(logs.loggers).map(e => ({ name: e[0], level: e[1].effectiveLevel })) : [];

  return (
    <div>
      <h2 id="logs-page-heading">Logs</h2>
      <p>There are {loggers.length.toString()} loggers.</p>

      <span>Filter</span>
      <input type="text" value={filter} onChange={changeFilter} className="form-control" disabled={isFetching} />

      <table className="table table-sm table-striped table-bordered" aria-describedby="logs-page-heading">
        <thead>
          <tr title="click to order">
            <th>
              <span>Name</span>
            </th>
            <th>
              <span>Level</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loggers.filter(filterFn).map((logger, i) => (
            <tr key={`log-row-${i}`}>
              <td>
                <small>{logger.name}</small>
              </td>
              <td>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'TRACE')}
                  className={getClassName(logger.level, 'TRACE', 'primary')}
                >
                  TRACE
                </button>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'DEBUG')}
                  className={getClassName(logger.level, 'DEBUG', 'success')}
                >
                  DEBUG
                </button>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'INFO')}
                  className={getClassName(logger.level, 'INFO', 'info')}
                >
                  INFO
                </button>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'WARN')}
                  className={getClassName(logger.level, 'WARN', 'warning')}
                >
                  WARN
                </button>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'ERROR')}
                  className={getClassName(logger.level, 'ERROR', 'danger')}
                >
                  ERROR
                </button>
                <button
                  disabled={isFetching}
                  onClick={changeLevel(logger.name, 'OFF')}
                  className={getClassName(logger.level, 'OFF', 'secondary')}
                >
                  OFF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const mapStoreToProps = ({ adminStore }: IRootStore) => ({
  logs: adminStore.logs,
  isFetching: adminStore.loading,
  getLoggers: adminStore.getLoggers,
  changeLogLevel: adminStore.changeLogLevel,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(LogsPage);
