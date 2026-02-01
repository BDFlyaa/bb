import sequelize from './db.js';
import TraceRecord from './models/TraceRecord.js';

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');

        // 获取所有表名
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('All Tables:', results.map(r => Object.values(r)[0]));

        // 检查 TraceRecords 是否存在
        const tables = results.map(r => Object.values(r)[0]);
        if (tables.includes('TraceRecords')) {
            console.log('✅ TABLE EXISTS: TraceRecords');

            // 检查列
            const [columns] = await sequelize.query('SHOW COLUMNS FROM TraceRecords');
            console.log('Columns:', columns.map(c => c.Field));
        } else {
            console.log('❌ TABLE MISSING: TraceRecords');
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();
