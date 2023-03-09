import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabase('AppLogistica.db');

export default db;