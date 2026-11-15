import { DatabaseStore } from '../server/src/db/store.js';
const store = new DatabaseStore();
const backup = store.createBackup('pre-upgrade');
console.log('Backup created:', backup);
