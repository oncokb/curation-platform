import React, { PropsWithChildren } from 'react';
import { DropdownItem } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface IMenuItem {
  icon: IconProp;
  to: string;
  id?: string;
}

export const MenuItem = (props: PropsWithChildren<IMenuItem>) => {
  const { to, icon, id, children } = props;

  return (
    <DropdownItem tag={Link} to={to} id={id}>
      <FontAwesomeIcon icon={icon} fixedWidth /> {children}
    </DropdownItem>
  );
};

export default MenuItem;
