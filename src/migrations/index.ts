import * as migration_20261010_193809_initial from './20261010_193809_initial';

export const migrations = [
  {
    up: migration_20261010_193809_initial.up,
    down: migration_20261010_193809_initial.down,
    name: '20261010_193809_initial'
  },
];
