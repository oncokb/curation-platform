import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Table, Input, Row, Col, Badge } from 'reactstrap';

import { IRootStore } from 'app/shared/stores';

export type IConfigurationPageProps = StoreProps;

export const ConfigurationPage = (props: IConfigurationPageProps) => {
  const [filter, setFilter] = useState('');
  const [reversePrefix, setReversePrefix] = useState(false);
  const [reverseProperties, setReverseProperties] = useState(false);

  useEffect(() => {
    props.getConfigurations();
    props.getEnv();
  }, []);

  const changeFilter = evt => setFilter(evt.target.value);

  const envFilterFn = configProp => configProp.toUpperCase().includes(filter.toUpperCase());

  const propsFilterFn = configProp => configProp.prefix.toUpperCase().includes(filter.toUpperCase());

  const changeReversePrefix = () => setReversePrefix(!reversePrefix);

  const changeReverseProperties = () => setReverseProperties(!reverseProperties);

  const getContextList = contexts =>
    Object.values(contexts)
      .map((v: any) => v.beans)
      .reduce((acc, e) => ({ ...acc, ...e }));

  const { configuration } = props;

  const configProps = configuration && configuration.configProps ? configuration.configProps : {};

  const env = configuration && configuration.env ? configuration.env : {};

  return (
    <div>
      <h2 id="configuration-page-heading">Configuration</h2>
      <span>Filter</span> <Input type="search" value={filter} onChange={changeFilter} name="search" id="search" />
      <label>Spring configuration</label>
      <Table className="table table-striped table-bordered table-responsive d-table">
        <thead>
          <tr>
            <th onClick={changeReversePrefix}>Prefix</th>
            <th onClick={changeReverseProperties}>Properties</th>
          </tr>
        </thead>
        <tbody>
          {configProps.contexts
            ? Object.values(getContextList(configProps.contexts))
                .filter(propsFilterFn)
                .map((property, propIndex) => (
                  <tr key={propIndex}>
                    <td>{property['prefix']}</td>
                    <td>
                      {Object.keys(property['properties']).map((propKey, index) => (
                        <Row key={index}>
                          <Col md="4">{propKey}</Col>
                          <Col md="8">
                            <Badge className="float-right badge-secondary break">{JSON.stringify(property['properties'][propKey])}</Badge>
                          </Col>
                        </Row>
                      ))}
                    </td>
                  </tr>
                ))
            : null}
        </tbody>
      </Table>
      {env.propertySources
        ? env.propertySources.map((envKey, envIndex) => (
            <div key={envIndex}>
              <h4>
                <span>{envKey.name}</span>
              </h4>
              <Table className="table table-sm table-striped table-bordered table-responsive d-table">
                <thead>
                  <tr key={envIndex}>
                    <th className="w-40">Property</th>
                    <th className="w-60">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(envKey.properties)
                    .filter(envFilterFn)
                    .map((propKey, propIndex) => (
                      <tr key={propIndex}>
                        <td className="break">{propKey}</td>
                        <td className="break">
                          <span className="float-right badge badge-secondary break">{envKey.properties[propKey].value}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          ))
        : null}
    </div>
  );
};

const mapStoreToProps = ({ adminStore }: IRootStore) => ({
  configuration: adminStore.configuration,
  isFetching: adminStore.loading,
  getConfigurations: adminStore.getConfigurations,
  getEnv: adminStore.getEnv,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ConfigurationPage);
