import * as MobxReactRouter from 'mobx-react-router';
import { RouterStore } from 'app/shared/stores';

jest.mock('mobx-react-router', () => ({
  syncHistoryWithStore: jest.fn(),
  RouterStore: jest.requireActual('mobx-react-router').RouterStore,
}));

describe('Router store tests', () => {
  it('should syncHistoryWithStore', () => {
    const history = {};
    const store = new RouterStore(history as any);
    expect(MobxReactRouter.syncHistoryWithStore).toHaveBeenCalledWith(history, store);
  });
});
