const { migrate } = require('../migrate/helpers/migrate.js');
const { createMapItem } = require('./helpers/itemMigratorFactory.js');

const v3Table = 'components_digital_exhibitions_digital_exhibitions';

// Tables that should not be proccessed later
const processedTables = [v3Table];

// Custom migration function, handles DB reads and writes
async function migrateTables() {
  await migrate(
    v3Table,
    'components_digital_exhibitions',
    createMapItem({
      isItem: (data) => !data.description,
      fields: ['id', 'digitals', 'commons'],
    })
  );
}

module.exports = {
  processedTables,
  migrateTables,
};
