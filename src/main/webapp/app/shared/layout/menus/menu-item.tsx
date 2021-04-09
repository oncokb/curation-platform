import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Dropdown } from 'react-bootstrap';

export interface IMenuItem {
  icon: IconProp;
  to: string;
  id?: string;
}

const MenuItem: React.FunctionComponent<IMenuItem> = props => {
  const { to, icon, id, children } = props;
  return (
    <Dropdown.Item as={Link} to={to} id={id}>
      <FontAwesomeIcon icon={icon} fixedWidth /> {children}
    </Dropdown.Item>
  );
};

export default MenuItem;
