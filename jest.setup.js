/**
 * ================================================================
 * JEST SETUP - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Configurações globais para testes
 */

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock sessionStorage
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock IndexedDB
class MockIDBRequest {
  constructor(result = null, error = null) {
    this.result = result;
    this.error = error;
    this.onsuccess = null;
    this.onerror = null;
    this.readyState = 'pending';
  }

  triggerSuccess() {
    this.readyState = 'done';
    if (this.onsuccess) {
      this.onsuccess({ target: this });
    }
  }

  triggerError(error) {
    this.error = error;
    this.readyState = 'done';
    if (this.onerror) {
      this.onerror({ target: this });
    }
  }
}

class MockIDBObjectStore {
  constructor(name, keyPath = 'id', indexes = []) {
    this.name = name;
    this.keyPath = keyPath;
    this.indexes = new Map();
    this.data = new Map();
    
    indexes.forEach(idx => {
      this.indexes.set(idx.name, idx);
    });
  }

  put(item) {
    const key = item[this.keyPath];
    this.data.set(key, item);
    
    const request = new MockIDBRequest(key);
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  add(item) {
    const key = item[this.keyPath];
    if (this.data.has(key)) {
      const request = new MockIDBRequest();
      request.error = new Error('Key already exists');
      setTimeout(() => request.triggerError(request.error), 0);
      return request;
    }
    
    this.data.set(key, item);
    const request = new MockIDBRequest(key);
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  get(key) {
    const request = new MockIDBRequest(this.data.get(key));
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  delete(key) {
    this.data.delete(key);
    const request = new MockIDBRequest();
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  getAll() {
    const values = Array.from(this.data.values());
    const request = new MockIDBRequest(values);
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  clear() {
    this.data.clear();
    const request = new MockIDBRequest();
    setTimeout(() => request.triggerSuccess(), 0);
    return request;
  }

  createIndex(name, keyPath, options = {}) {
    this.indexes.set(name, { name, keyPath, ...options });
  }

  index(name) {
    return this.indexes.get(name);
  }
}

class MockIDBTransaction {
  constructor(db, storeNames, mode = 'readonly') {
    this.db = db;
    this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
    this.mode = mode;
    this.oncomplete = null;
    this.onerror = null;
    this.readyState = 'pending';
  }

  objectStore(name) {
    return this.db.objectStores.get(name);
  }

  commit() {
    setTimeout(() => {
      this.readyState = 'done';
      if (this.oncomplete) {
        this.oncomplete({ target: this });
      }
    }, 0);
  }
}

class MockIDBDatabase {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.objectStoreNames = [];
    this.objectStores = new Map();
  }

  createObjectStore(name, options = {}) {
    const keyPath = options.keyPath || 'id';
    const store = new MockIDBObjectStore(name, keyPath, options.indexes || []);
    this.objectStores.set(name, store);
    this.objectStoreNames.push(name);
    return store;
  }

  transaction(storeNames, mode = 'readonly') {
    return new MockIDBTransaction(this, storeNames, mode);
  }

  close() {
    // Mock close action
  }
}

const mockIDB = {
  databases: new Map(),
  lastVersion: 1,

  open(name, version = 1) {
    return new Promise((resolve, reject) => {
      const request = new MockIDBRequest();
      
      setTimeout(() => {
        let db;
        if (mockIDB.databases.has(name)) {
          db = mockIDB.databases.get(name);
          if (db.version !== version) {
            const upgradeDB = new MockIDBDatabase(name, version);
            request.result = upgradeDB;
            if (request.onupgradeneeded) {
              request.onupgradeneeded({ 
                target: request, 
                oldVersion: db.version,
                newVersion: version 
              });
            }
            mockIDB.databases.set(name, upgradeDB);
            db = upgradeDB;
          }
        } else {
          db = new MockIDBDatabase(name, version);
          mockIDB.databases.set(name, db);
          request.result = db;
          if (request.onupgradeneeded) {
            request.onupgradeneeded({ 
              target: request, 
              oldVersion: 0,
              newVersion: version 
            });
          }
        }
        
        request.triggerSuccess();
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      }, 0);

      resolve(request);
    });
  },

  deleteDatabase(name) {
    mockIDB.databases.delete(name);
    return Promise.resolve();
  },

  cmp(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },
};

// Install IndexedDB mock
if (!global.indexedDB) {
  global.indexedDB = mockIDB;
}

// Mock Navigator (for PWA testing)
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: {
      register: jest.fn(() => Promise.resolve({ scope: '/' })),
      ready: Promise.resolve({ active: {} }),
      controller: null,
    },
    connection: {
      effectiveType: '4g',
      saveData: false,
    },
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock RequestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Suppress console errors in tests unless debugging
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('Not implemented:') ||
      args[0]?.includes?.('ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
