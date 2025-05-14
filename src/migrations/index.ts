import * as migration_20250404_194215_initial from './20250404_194215_initial';
import * as migration_20250513_005622 from './20250513_005622';
import * as migration_20250513_030553 from './20250513_030553';
import * as migration_20250514_015050 from './20250514_015050';
import * as migration_20250514_030522 from './20250514_030522';
import * as migration_20250514_030653 from './20250514_030653';
import * as migration_20250514_030915 from './20250514_030915';
import * as migration_20250514_032045 from './20250514_032045';
import * as migration_20250514_032457 from './20250514_032457';
import * as migration_20250514_032717 from './20250514_032717';
import * as migration_20250514_211935 from './20250514_211935';

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
    name: '20250514_015050',
  },
  {
    up: migration_20250514_030522.up,
    down: migration_20250514_030522.down,
    name: '20250514_030522',
  },
  {
    up: migration_20250514_030653.up,
    down: migration_20250514_030653.down,
    name: '20250514_030653',
  },
  {
    up: migration_20250514_030915.up,
    down: migration_20250514_030915.down,
    name: '20250514_030915',
  },
  {
    up: migration_20250514_032045.up,
    down: migration_20250514_032045.down,
    name: '20250514_032045',
  },
  {
    up: migration_20250514_032457.up,
    down: migration_20250514_032457.down,
    name: '20250514_032457',
  },
  {
    up: migration_20250514_032717.up,
    down: migration_20250514_032717.down,
    name: '20250514_032717',
  },
  {
    up: migration_20250514_211935.up,
    down: migration_20250514_211935.down,
    name: '20250514_211935'
  },
];
