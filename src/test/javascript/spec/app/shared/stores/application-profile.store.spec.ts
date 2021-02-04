import axios from 'axios';
import sinon from 'sinon';
import { ApplicationProfileStore, createStores } from 'app/shared/stores';
import { toJS } from 'mobx';

describe('Profile store tests', () => {
  const initialState = {
    isInProduction: true,
    errorMessage: null,
    isSwaggerEnabled: false,
    loading: false,
    ribbonEnv: '',
    rootStore: null,
    updateSuccess: false,
    updating: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new ApplicationProfileStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });
  });

  describe('Actions', () => {
    let store;
    const resolvedObject = {
      data: {
        activeProfiles: ['whatever'],
        'display-ribbon-on-profiles': 'whatever,dev',
      },
    };

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new ApplicationProfileStore(rootStore as any);
    });

    it('should display ribbon', async () => {
      axios.get = sinon.stub().returns(Promise.resolve(resolvedObject));
      const profile = await store.getProfile();
      expect(profile).toEqual(resolvedObject);
      expect(store.isInProduction).toEqual(false);
      expect(store.isSwaggerEnabled).toEqual(false);
      expect(store.ribbonEnv).toEqual('whatever');
    });

    it('should be in production', async () => {
      const data = {
        data: {
          ...resolvedObject.data,
          activeProfiles: ['prod'],
        },
      };
      axios.get = sinon.stub().returns(Promise.resolve(data));
      const profile = await store.getProfile();
      expect(profile).toEqual(data);
      expect(store.isInProduction).toEqual(true);
      expect(store.isSwaggerEnabled).toEqual(false);
      expect(store.ribbonEnv).toEqual('');
    });

    it('should enable swagger with ribbon', async () => {
      const data = {
        data: {
          ...resolvedObject.data,
          activeProfiles: ['whatever', 'swagger'],
        },
      };
      axios.get = sinon.stub().returns(Promise.resolve(data));
      const profile = await store.getProfile();
      expect(profile).toEqual(data);
      expect(store.isInProduction).toEqual(false);
      expect(store.isSwaggerEnabled).toEqual(true);
      expect(store.ribbonEnv).toEqual('whatever');
    });

    it('should not change state without active profiles', async () => {
      const data = {
        data: {
          ...resolvedObject.data,
          activeProfiles: undefined,
        },
      };
      axios.get = sinon.stub().returns(Promise.resolve(data));
      const profile = await store.getProfile();
      expect(profile).toEqual(data);
      /* eslint-disable-next-line require-atomic-updates */
      store.rootStore = null;
      expect(toJS(store)).toMatchObject(initialState);
    });
  });
});
