import RootStore from './root.store';

export default class WindowStore {
  private readonly rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
}
