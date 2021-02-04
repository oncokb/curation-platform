import { action, observable } from 'mobx';

export class LoadingBarStore {
  @observable public count = 0;

  constructor() {}

  @action.bound
  showLoading() {
    return ++this.count;
  }

  @action.bound
  hideLoading() {
    return (this.count = Math.max(0, this.count - 1));
  }
}

export default LoadingBarStore;
