import RootStore from './root.store';

export default class AppStore {
  private readonly rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
}
