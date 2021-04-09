import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'app/shared/stores';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { PAGE_ROUTE } from 'app/config/constants';
import { NavLink as Link } from 'react-router-dom';
import GoogleButton from 'react-google-button';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

interface IPage {
  title: string;
  link: string;
  key: string;
}

const Header = () => {
  const { authenticationStore, routerStore } = useStores();
  const pages: IPage[] = [
    { title: 'Genes', link: PAGE_ROUTE.GENES, key: 'nav_1' },
    { title: 'Variant', link: PAGE_ROUTE.VARIANT, key: 'nav_2' },
    { title: 'Drugs', link: PAGE_ROUTE.DRUGS, key: 'nav_3' },
    { title: 'Tools', link: PAGE_ROUTE.TOOLS, key: 'nav_4' },
    { title: 'Queues', link: PAGE_ROUTE.QUEUES, key: 'nav_5' },
  ];
  const getLink = (page: IPage) => {
    return (
      <Nav.Link key={page.key} as={Link} to={page.link} className={'mr-auto'}>
        {page.title}
      </Nav.Link>
    );
  };
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand>Curation Platform</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">{authenticationStore.isAuthenticated && pages.map(page => getLink(page))}</Nav>
          <Nav>
            {authenticationStore.isAuthenticated ? (
              <>
                <Nav.Item>
                  <div className="float-left" style={{ color: 'white' }}>
                    <span>
                      {authenticationStore.account.email}({authenticationStore.account.role})
                    </span>
                    <br />
                    <Link className="float-right" to={PAGE_ROUTE.LOGOUT} style={{ color: 'white' }}>
                      Sign out
                    </Link>
                  </div>
                  <img className="float-right ml-2" style={{ width: '50px' }} src={authenticationStore.account.photoURL}></img>
                </Nav.Item>
              </>
            ) : (
              <GoogleButton type="light" onClick={authenticationStore.login}>
                Sign in
              </GoogleButton>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default observer(Header);
