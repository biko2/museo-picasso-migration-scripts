const { migrate } = require('./helpers/migrate');
const { omit } = require('lodash');
const { snakeCase } = require('lodash/fp');
const { dbV3 } = require('../config/database');
const { migrateUids } = require('./helpers/migrateValues');
const { resolveSourceTableName } = require('./helpers/tableNameHelpers');

const processedTables = ['upload_file', 'upload_file_morph'];
const newTables = ['files', 'files_related_morphs'];

async function migrateTables() {
  // TODO have to migrate values
  console.log('Migrating files');

  const modelsDefs = await dbV3(resolveSourceTableName('core_store')).where(
    'key',
    'like',
    'model_def_%'
  );

  const componentsMap = modelsDefs
    .map((item) => JSON.parse(item.value))
    .flatMap((item) => {
      return Object.entries(item.attributes)
        .filter(([_, attribute]) => attribute.via === 'related' && attribute.plugin === 'upload')
        .map(([key]) => ({
          collectionName: item.collectionName,
          field: key,
          uid: migrateUids(item.uid),
        }));
    })
    .reduce(
      (acc, item) => ({
        ...acc,
        [item.collectionName]: {
          ...acc[item.collectionName],
          [item.field]: item.uid,
        },
      }),
      {}
    );

  await migrate(processedTables[0], newTables[0], (item) => {
    const withRenamedKeys = Object.keys(item).reduce((acc, key) => {
      return {
        ...acc,
        ...{ [snakeCase(key)]: item[key] },
        folder_path: '/',
      };
    }, {});

    const newItem = {
      ...withRenamedKeys,
      created_by_id: item.created_by,
      updated_by_id: item.updated_by,
    };

    return omit(newItem, ['created_by', 'updated_by']);
  });

  await migrate(processedTables[1], newTables[1], (item) => {
    const newItem = {
      ...item,
      file_id: item.upload_file_id,
      related_type: componentsMap[item.related_type]?.[item.field] || item.related_type,
    };

    return omit(newItem, ['upload_file_id', 'id']);
  });
}

const migrateFiles = {
  processedTables,
  migrateTables,
};

module.exports = {
  migrateFiles,
};
