// 🔍 DATABASE INSPECTION UTILITY
// This tool helps you inspect your Supabase database structure
// Run this from your browser console or import it in your app

import { supabase } from './supabaseClient';

export interface TableInfo {
  schema: string;
  name: string;
  type: 'table' | 'view';
  columns?: ColumnInfo[];
  rowCount?: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  foreignKey?: {
    schema: string;
    table: string;
    column: string;
  };
}

export interface DatabaseInspection {
  tables: TableInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  issues: string[];
}

export interface ForeignKeyInfo {
  fromSchema: string;
  fromTable: string;
  fromColumn: string;
  toSchema: string;
  toTable: string;
  toColumn: string;
}

export interface IndexInfo {
  schema: string;
  table: string;
  name: string;
  definition: string;
}

/**
 * Inspect the complete database structure
 */
export const inspectDatabase = async (): Promise<DatabaseInspection> => {
  console.log('🔍 Starting database inspection...');
  
  const inspection: DatabaseInspection = {
    tables: [],
    foreignKeys: [],
    indexes: [],
    issues: []
  };

  try {
    // Get all tables
    const tables = await getTables();
    inspection.tables = tables;

    // Get column details for each table
    for (const table of tables) {
      if (table.type === 'table') {
        table.columns = await getTableColumns(table.schema, table.name);
        table.rowCount = await getRowCount(table.schema, table.name);
      }
    }

    // Get foreign keys
    inspection.foreignKeys = await getForeignKeys();

    // Get indexes
    inspection.indexes = await getIndexes();

    // Check for issues
    inspection.issues = await checkForIssues(inspection);

    console.log('✅ Database inspection complete!');
    return inspection;

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
    inspection.issues.push(`Inspection error: ${error}`);
    return inspection;
  }
};

/**
 * Get all tables and views in public and api schemas
 */
const getTables = async (): Promise<TableInfo[]> => {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        table_schema,
        table_name,
        CASE WHEN table_type = 'BASE TABLE' THEN 'table' ELSE 'view' END as type
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'api')
        AND table_type IN ('BASE TABLE', 'VIEW')
      ORDER BY table_schema, table_name;
    `
  });

  if (error) {
    // Fallback: try direct queries to information_schema
    console.warn('RPC not available, trying alternative method...');
    return await getTablesAlternative();
  }

  return (data || []).map((row: any) => ({
    schema: row.table_schema,
    name: row.table_name,
    type: row.type
  }));
};

/**
 * Alternative method to get tables (direct query)
 */
const getTablesAlternative = async (): Promise<TableInfo[]> => {
  const tables: TableInfo[] = [];
  const schemas = ['public', 'api'];

  for (const schema of schemas) {
    try {
      // Try to query a known table to see if schema exists
      const testQuery = supabase.from(schema === 'public' ? 'users' : 'users').select('*').limit(0);
      // This will fail if table doesn't exist, but that's okay
    } catch (e) {
      // Continue
    }

    // We'll need to use SQL queries via a different method
    // For now, return common table names
    const commonTables = ['users', 'property', 'ug', 'user_projects', 'user_designs', 'layouts'];
    for (const tableName of commonTables) {
      try {
        const { error } = await supabase.from(tableName).select('*').limit(0);
        if (!error) {
          tables.push({ schema, name: tableName, type: 'table' });
        }
      } catch (e) {
        // Table doesn't exist or can't access
      }
    }
  }

  return tables;
};

/**
 * Get column information for a table
 */
const getTableColumns = async (schema: string, tableName: string): Promise<ColumnInfo[]> => {
  // Since we can't directly query information_schema via Supabase client,
  // we'll try to infer structure by attempting to query the table
  const columns: ColumnInfo[] = [];

  try {
    // Try to get one row to see structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (!error && data && data.length > 0) {
      // Infer column types from the data
      const sampleRow = data[0];
      for (const [key, value] of Object.entries(sampleRow)) {
        columns.push({
          name: key,
          type: inferType(value),
          nullable: value === null,
          defaultValue: null,
          isPrimaryKey: false, // Can't determine without schema query
          foreignKey: undefined
        });
      }
    }
  } catch (error) {
    console.warn(`Could not inspect columns for ${schema}.${tableName}:`, error);
  }

  return columns;
};

/**
 * Infer PostgreSQL type from JavaScript value
 */
const inferType = (value: any): string => {
  if (value === null) return 'unknown';
  if (typeof value === 'string') return 'text';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return 'integer';
    return 'numeric';
  }
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'timestamptz';
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return 'jsonb';
  return 'unknown';
};

/**
 * Get row count for a table
 */
const getRowCount = async (schema: string, tableName: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn(`Could not get row count for ${schema}.${tableName}:`, error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.warn(`Error getting row count for ${schema}.${tableName}:`, error);
    return 0;
  }
};

/**
 * Get foreign key relationships
 */
const getForeignKeys = async (): Promise<ForeignKeyInfo[]> => {
  // This requires SQL queries to information_schema
  // For now, return empty array - user should use SQL script
  return [];
};

/**
 * Get indexes
 */
const getIndexes = async (): Promise<IndexInfo[]> => {
  // This requires SQL queries to pg_indexes
  // For now, return empty array - user should use SQL script
  return [];
};

/**
 * Check for common database issues
 */
const checkForIssues = async (inspection: DatabaseInspection): Promise<string[]> => {
  const issues: string[] = [];

  // Check for tables with no rows (might indicate issues)
  for (const table of inspection.tables) {
    if (table.type === 'table' && table.rowCount === 0) {
      issues.push(`Table ${table.schema}.${table.name} has no rows`);
    }
  }

  // Check for tables without columns (shouldn't happen, but check)
  for (const table of inspection.tables) {
    if (table.type === 'table' && (!table.columns || table.columns.length === 0)) {
      issues.push(`Table ${table.schema}.${table.name} has no columns or couldn't be inspected`);
    }
  }

  return issues;
};

/**
 * Print inspection results in a readable format
 */
export const printInspection = (inspection: DatabaseInspection) => {
  console.log('\n📊 DATABASE INSPECTION RESULTS\n');
  console.log('═'.repeat(60));

  console.log('\n📋 TABLES:');
  console.log('-'.repeat(60));
  for (const table of inspection.tables) {
    console.log(`\n${table.schema}.${table.name} (${table.type})`);
    if (table.rowCount !== undefined) {
      console.log(`  Rows: ${table.rowCount}`);
    }
    if (table.columns && table.columns.length > 0) {
      console.log('  Columns:');
      for (const col of table.columns) {
        const nullable = col.nullable ? 'NULL' : 'NOT NULL';
        const pk = col.isPrimaryKey ? ' [PK]' : '';
        const fk = col.foreignKey ? ` [FK → ${col.foreignKey.schema}.${col.foreignKey.table}.${col.foreignKey.column}]` : '';
        console.log(`    - ${col.name}: ${col.type} ${nullable}${pk}${fk}`);
      }
    }
  }

  if (inspection.foreignKeys.length > 0) {
    console.log('\n🔗 FOREIGN KEYS:');
    console.log('-'.repeat(60));
    for (const fk of inspection.foreignKeys) {
      console.log(
        `${fk.fromSchema}.${fk.fromTable}.${fk.fromColumn} → ${fk.toSchema}.${fk.toTable}.${fk.toColumn}`
      );
    }
  }

  if (inspection.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    console.log('-'.repeat(60));
    for (const issue of inspection.issues) {
      console.log(`  - ${issue}`);
    }
  } else {
    console.log('\n✅ No issues found!');
  }

  console.log('\n' + '═'.repeat(60));
};

/**
 * Export inspection to JSON
 */
export const exportInspection = (inspection: DatabaseInspection): string => {
  return JSON.stringify(inspection, null, 2);
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).inspectDatabase = async () => {
    const inspection = await inspectDatabase();
    printInspection(inspection);
    return inspection;
  };

  (window as any).exportDatabase = async () => {
    const inspection = await inspectDatabase();
    const json = exportInspection(inspection);
    console.log('\n📄 JSON Export:');
    console.log(json);
    return json;
  };
}

