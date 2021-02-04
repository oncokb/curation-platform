export enum OperationStatus {
  IN_PROGRESS,
  SUCCESSFUL,
  ERROR,
}

export const handleOperation = <T, TArgs>(
  ctx: any,
  param: (...args: TArgs[]) => IterableIterator<Promise<T>>,
  operationHandler: (state: OperationStatus, result?, error?) => void
) =>
  function* (...args: TArgs[]): Generator<any, T, any> | AsyncGenerator<any, T, any> {
    try {
      operationHandler(OperationStatus.IN_PROGRESS);
      const result: T = yield* param.apply(ctx, args);
      operationHandler(OperationStatus.SUCCESSFUL, result);
      return result;
    } catch (e) {
      operationHandler(OperationStatus.ERROR, null, e);
      return yield Promise.reject(e);
    }
  };
