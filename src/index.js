import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.storage = {
  get: async (key, shared = true) => {
    try {
      const prefix = shared ? 'nfh_shared_' : 'nfh_personal_';
      const raw = localStorage.getItem(prefix + key);
      return raw ? { key, value: raw, shared } : null;
    } catch { return null; }
  },
  set: async (key, value, shared = true) => {
    try {
      const prefix = shared ? 'nfh_shared_' : 'nfh_personal_';
      localStorage.setItem(prefix + key, value);
      return { key, value, shared };
    } catch { return null; }
  },
  delete: async (key, shared = true) => {
    try {
      const prefix = shared ? 'nfh_shared_' : 'nfh_personal_';
      localStorage.removeItem(prefix + key);
      return { key, deleted: true, shared };
    } catch { return null; }
  },
  list: async (prefix = '', shared = true) => {
    try {
      const storePrefix = shared ? 'nfh_shared_' : 'nfh_personal_';
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(storePrefix + prefix))
        .map(k => k.slice(storePrefix.length));
      return { keys, prefix, shared };
    } catch { return { keys: [] }; }
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
