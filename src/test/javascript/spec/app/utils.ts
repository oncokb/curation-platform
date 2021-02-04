// A dirty way to remove functions and undefined from an object for comparison
export const cleanupObj = obj => JSON.parse(JSON.stringify(obj));
export const part = <T>(partial?: Partial<T>): T => {
  return (partial ? partial : {}) as T;
};
export const stubMethod = (store: any, field: string) => {
  const spy = jest.fn();
  Object.defineProperty(store, field, {
    get() {
      return spy;
    },
  });
  return spy;
};
