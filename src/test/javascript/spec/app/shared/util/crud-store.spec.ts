import axios, { AxiosResponse } from 'axios';
import { part } from '../../utils';
import CrudStore from 'app/shared/util/crud-store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Crud store tests', () => {
  const apiUrl = '/api/entities';

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      store = new CrudStore(null, apiUrl);
      jest.clearAllMocks();
    });

    it('getAllFromLastUrl should get and resetEntities', function* () {
      const now = 1562449572531;
      Date.now = jest.fn().mockReturnValue(now);
      const data = new Object();
      const count = 3;
      const axiosResponse = part<AxiosResponse>({ data, headers: { 'x-total-count': count } });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.getAllFromLastUrl();
      expect(axiosMock.get).toBeCalledWith(`/api/entities?cacheBuster=${now}`);
      expect(store.entities).toStrictEqual(data);
      expect(store.totalItems).toBe(count);
      expect(result).toBe(axiosResponse);
    });

    it('getAll should call getAllFromLastUrl', function* () {
      const data = new Object();
      store.getAllFromLastUrl = jest.fn().mockImplementationOnce(function* () {
        return yield Promise.resolve(data);
      });
      const result = yield* store.getAll();
      expect(store.getAllFromLastUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(data);
    });
  });
});
