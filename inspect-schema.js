const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar .env manualmente
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^=\s]+)\s*=\s*['"]?(.+?)['"]?\s*$/);
    if (match && !match[1].startsWith('#')) {
      process.env[match[1]] = match[2];
    }
  });
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Obtener todas las tablas
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);

    console.log('📋 Tablas encontradas:\n');

    for (const { table_name } of tables.rows) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Tabla: ${table_name}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Obtener columnas
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table_name]);

      console.log('\nColumnas:');
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        console.log(`  - ${col.column_name}: ${col.data_type} (${nullable})`);
        if (col.column_default) {
          console.log(`    Default: ${col.column_default}`);
        }
      });

      // Obtener constraints
      const constraints = await pool.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = $1
      `, [table_name]);

      if (constraints.rows.length > 0) {
        console.log('\nConstraints:');
        constraints.rows.forEach(c => {
          console.log(`  - ${c.constraint_name} (${c.constraint_type})`);
        });
      }
    }

    console.log('\n✅ Schema inspección completada\n');
    
  } catch(e) {
    console.error('❌ ERROR:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
