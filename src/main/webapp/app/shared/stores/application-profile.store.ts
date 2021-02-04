import { action, observable } from 'mobx';
import BaseStore from 'app/shared/util/base-store';
import axios, { AxiosResponse } from 'axios';

export class ApplicationProfileStore extends BaseStore {
  @observable public ribbonEnv = '';
  @observable public isInProduction = true;
  @observable public isSwaggerEnabled = false;

  @action
  getProfile = this.readHandler(this.getProfileGen);

  *getProfileGen() {
    const result: AxiosResponse = yield axios.get('/management/info');
    const activeProfiles = result.data['activeProfiles'];
    if (activeProfiles) {
      const ribbonProfiles = result.data['display-ribbon-on-profiles'].split(',').filter(profile => activeProfiles.includes(profile));
      if (ribbonProfiles.length !== 0) {
        this.ribbonEnv = ribbonProfiles[0];
      }
      this.isInProduction = activeProfiles.includes('prod');
      this.isSwaggerEnabled = activeProfiles.includes('swagger');
    }
    return result;
  }
}

export default ApplicationProfileStore;
