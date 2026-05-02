import sequelize from './db.js';

async function migrate() {
  try {
    await sequelize.query(
      "ALTER TABLE TraceRecords ADD COLUMN sourceName VARCHAR(100) NULL COMMENT '来源点位名称（官方站点名或非官方点位说明）'"
    );
    console.log('✅ sourceName column added successfully');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column name')) {
      console.log('ℹ️  Column sourceName already exists, skipping.');
    } else {
      console.error('❌ Migration failed:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}

migrate();
