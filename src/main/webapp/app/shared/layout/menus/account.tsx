import { PAGE_ROUTE } from 'app/config/constants';
import { useStores } from 'app/shared/stores';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Dropdown, Nav } from 'react-bootstrap';
import MenuItem from './menu-item';

const AccountMenu = () => {
  const { authenticationStore } = useStores();
  return (
    <Dropdown as={Nav.Item}>
      <Dropdown.Toggle id={'account-menu'} as={Nav.Link}>
        Account
      </Dropdown.Toggle>
      <Dropdown.Menu alignRight={true}>
        <MenuItem icon="sign-out-alt" to={PAGE_ROUTE.LOGOUT}>
          Item One
        </MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default observer(AccountMenu);
