import { History } from 'history';
import { RouterStore as BaseRouterStore, syncHistoryWithStore } from 'mobx-react-router';

export default class RouterStore extends BaseRouterStore {
  constructor(history?: History) {
    super();
    if (history) {
      this.history = syncHistoryWithStore(history, this);
    }
  }
}
