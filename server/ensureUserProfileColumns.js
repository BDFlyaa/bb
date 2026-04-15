import { DataTypes } from 'sequelize';
import sequelize from './db.js';
import User from './models/User.js';

function resolveTableName() {
  const raw = User.getTableName();
  return typeof raw === 'string' ? raw : raw.tableName;
}

/**
 * 已有库在未执行 alter sync 时缺少 profile 字段会导致 /me、/profile 查询报 500。
 * 启动时按需补列，避免依赖 DB_SYNC_ALTER。
 */
export async function ensureUserProfileColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = resolveTableName();

  let desc;
  try {
    desc = await queryInterface.describeTable(tableName);
  } catch (e) {
    console.warn(
      `[ensureUserProfileColumns] 跳过：无法读取表 ${tableName}：`,
      e.message
    );
    return;
  }

  const hasCol = (c) =>
    Object.prototype.hasOwnProperty.call(desc, c) ||
    Object.keys(desc).some((k) => k.toLowerCase() === c.toLowerCase());

  const adds = [];

  if (!hasCol('nickname')) {
    adds.push(() =>
      queryInterface.addColumn(tableName, 'nickname', {
        type: DataTypes.STRING(64),
        allowNull: true,
      })
    );
  }
  if (!hasCol('avatar')) {
    adds.push(() =>
      queryInterface.addColumn(tableName, 'avatar', {
        type: DataTypes.STRING(512),
        allowNull: true,
        defaultValue: '',
      })
    );
  }
  if (!hasCol('bio')) {
    adds.push(() =>
      queryInterface.addColumn(tableName, 'bio', {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: '',
      })
    );
  }

  for (const run of adds) {
    try {
      await run();
    } catch (e) {
      const msg = e?.parent?.sqlMessage || e?.message || '';
      if (String(msg).includes('Duplicate column')) continue;
      throw e;
    }
  }

  if (adds.length) {
    console.log(
      `[ensureUserProfileColumns] 已为表 ${tableName} 补充 ${adds.length} 个字段（nickname/avatar/bio）`
    );
  }
}
