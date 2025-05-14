import * as migration_20250404_194215_initial from './20250404_194215_initial';
import * as migration_20250513_005622 from './20250513_005622';
import * as migration_20250513_030553 from './20250513_030553';
import * as migration_20250514_015050 from './20250514_015050';

export const migrations = [
  {
    up: migration_20250404_194215_initial.up,
    down: migration_20250404_194215_initial.down,
    name: '20250404_194215_initial',
  },
  {
    up: migration_20250513_005622.up,
    down: migration_20250513_005622.down,
    name: '20250513_005622',
  },
  {
    up: migration_20250513_030553.up,
    down: migration_20250513_030553.down,
    name: '20250513_030553',
  },
  {
    up: migration_20250514_015050.up,
    down: migration_20250514_015050.down,
    name: '20250514_015050'
  },
];
