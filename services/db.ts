import Dexie, { Table } from 'dexie';
import { Ride, Refuel } from '../types';

export class AppDB extends Dexie {
  rides!: Table<Ride, number>;
  refuels!: Table<Refuel, number>;

  constructor() {
    super('index.db');
    // FIX: Cast 'this' to Dexie to resolve a potential type inference issue where
    // the 'version' method was not found on the subclass type AppDB.
    (this as Dexie).version(1).stores({
      rides: '++id, dateStart',
      refuels: '++id, date',
    });
  }
}

export const db = new AppDB();