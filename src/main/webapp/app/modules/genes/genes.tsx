import { PAGE_ROUTE } from 'app/config/constants';
import { useStores } from 'app/shared/stores';
import { observer } from 'mobx-react-lite';
import React from 'react';

const Genes = () => {
  const { routerStore } = useStores();
  return <div>Genes Page</div>;
};

export default observer(Genes);
