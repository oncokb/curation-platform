import React from 'react';
import { Switch } from 'react-router-dom';
import Welcome from 'app/modules/welcome/welcome';
import PrivateRoute from 'app/shared/auth/private-route';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import PageNotFound from 'app/shared/error/page-not-found';
import { Drugs } from './modules/drugs/drugs';
import { Feedback } from './modules/feedback/feedback';
import Genes from './modules/genes/genes';
import { Variant } from './modules/variant/variant';
import { Tools } from './modules/tools/tools';
import { Gene } from './modules/gene/gene';
import { Queues } from './modules/qeues/queues';
import { PAGE_ROUTE } from './config/constants';
import { Logout } from './modules/login/logout';

const Routes = () => {
  return (
    <div className="view-routes">
      <Switch>
        <ErrorBoundaryRoute path={PAGE_ROUTE.WELCOME_PAGE} exact component={Welcome} />
        <PrivateRoute path="/genes" exact component={Genes} />
        <PrivateRoute path="/variant" exact component={Variant} />
        <PrivateRoute path="/tools" exact component={Tools} />
        <PrivateRoute path="/gene/:geneName" exact component={Gene} />
        <PrivateRoute path="/feedback" exact component={Feedback} />
        <PrivateRoute path="/queues" exact component={Queues} />
        <PrivateRoute path="/drugs" exact component={Drugs} />
        <ErrorBoundaryRoute path={PAGE_ROUTE.LOGOUT} exact component={Logout} />
        <ErrorBoundaryRoute component={PageNotFound} />
      </Switch>
    </div>
  );
};

export default Routes;
