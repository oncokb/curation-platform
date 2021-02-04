const StorageMock = () => {
  let storage = {};
  return {
    getItem: key => (key in storage ? storage[key] : null),
    setItem: (key, value) => (storage[key] = value || ''),
    removeItem: key => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(global, 'localStorage', {
  value: StorageMock(),
});

Object.defineProperty(global, 'sessionStorage', {
  value: StorageMock(),
});
