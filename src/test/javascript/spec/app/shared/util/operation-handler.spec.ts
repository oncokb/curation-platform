import { handleOperation, OperationStatus } from 'app/shared/util/operation-handler';

describe('Operation handler', () => {
  describe('handleOperation', () => {
    it('success', function* () {
      const mockValue = {};
      const operationHandler = jest.fn();
      const iterator = handleOperation(
        {},
        function* mockCallback() {
          return yield Promise.resolve(mockValue);
        },
        operationHandler
      );
      yield iterator;
      expect(operationHandler).toHaveBeenNthCalledWith(1, OperationStatus.IN_PROGRESS);
      expect(operationHandler).toHaveBeenNthCalledWith(2, OperationStatus.SUCCESSFUL, mockValue);
    });

    it('rejection', function* () {
      const mockValue = {};
      const operationHandler = jest.fn();
      const iterator = handleOperation(
        {},
        function* mockCallback() {
          return yield Promise.reject(mockValue);
        },
        operationHandler
      );
      try {
        yield iterator;
      } catch (e) {
        expect(e).toEqual(mockValue);
      }
      expect(operationHandler).toHaveBeenNthCalledWith(1, OperationStatus.IN_PROGRESS);
      expect(operationHandler).toHaveBeenNthCalledWith(2, OperationStatus.ERROR, null, mockValue);
    });

    it('error', function* () {
      const error = new Error('Whoops!');
      const operationHandler = jest.fn();
      const iterator = handleOperation(
        {},
        function* mockCallback() {
          return yield new Promise(() => {
            throw error;
          });
        },
        operationHandler
      );

      try {
        yield iterator;
      } catch (e) {
        expect(e).toEqual(error);
      }
      expect(operationHandler).toHaveBeenNthCalledWith(1, OperationStatus.IN_PROGRESS);
      expect(operationHandler).toHaveBeenNthCalledWith(2, OperationStatus.ERROR, null, error);
    });
  });
});
