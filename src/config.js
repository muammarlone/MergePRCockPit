const electronIsDev = require('electron-is-dev');

if (require('os').platform() === 'win32') {
  require('dotenv').config({ path: '.env' });
} else {
  require('dotenv').config();
}

module.exports = {
  isDev: electronIsDev,
  github: {
    token: process.env.GITHUB_TOKEN || '',
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
    clientSecret: process.env.REACT_APP_GITHUB_CLIENT_SECRET || ''
  },
  features: {
    autoSync: process.env.REACT_APP_ENABLE_AUTO_SYNC === 'true',
    syncIntervalMs: parseInt(process.env.REACT_APP_SYNC_INTERVAL_MS || '30000'),
    ollamaEnabled: process.env.REACT_APP_OLLAMA_ENABLED === 'true',
    ollamaUrl: process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
