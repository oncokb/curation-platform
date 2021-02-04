import './header.scss';

import React, { useState } from 'react';

import { Navbar, Nav, NavbarToggler, NavbarBrand, Collapse } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { NavLink as Link } from 'react-router-dom';
import SimpleLoadingBar from 'react-simple-loading-bar';

import { Home, Brand } from './header-components';
import { AdminMenu, EntitiesMenu, AccountMenu } from '../menus';
import { IRootStore } from 'app/shared/stores';
import { connect } from 'app/shared/util/typed-inject';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
}

export const Header = (props: IHeaderProps & StoreProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderDevRibbon = () =>
    props.isInProduction === false ? (
      <div className="ribbon dev">
        <a href="">Development</a>
      </div>
    ) : null;

  const toggleMenu = () => setMenuOpen(!menuOpen);

  /* jhipster-needle-add-element-to-menu - JHipster will add new menu items here */

  return (
    <div id="app-header">
      {renderDevRibbon()}
      <SimpleLoadingBar activeRequests={props.count} />
      <Navbar dark expand="sm" fixed="top" className="jh-navbar">
        <NavbarToggler aria-label="Menu" onClick={toggleMenu} />
        <Brand />
        <Collapse isOpen={menuOpen} navbar>
          <Nav id="header-tabs" className="ml-auto" navbar>
            <Home />
            {props.isAuthenticated && <EntitiesMenu />}
            {props.isAuthenticated && props.isAdmin && <AdminMenu showSwagger={props.isSwaggerEnabled} />}
            <AccountMenu isAuthenticated={props.isAuthenticated} />
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

const mapStoreToProps = ({ loadingStore }: IRootStore) => ({
  count: loadingStore.count,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Header);
