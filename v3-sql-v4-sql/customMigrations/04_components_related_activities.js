const { migrate } = require('../migrate/helpers/migrate.js');
const { createMapItem } = require('./helpers/itemMigratorFactory.js');

const v3Table = 'components_related_activities_related_activities';

// Tables that should not be proccessed later
const processedTables = [v3Table];

// Custom migration function, handles DB reads and writes
async function migrateTables() {
  await migrate(
    v3Table,
    'components_related_activities',
    createMapItem({
      isItem: (data) => !data.description,
      fields: ['id', 'activities'],
    })
  );
}

module.exports = {
  processedTables,
  migrateTables,
};
