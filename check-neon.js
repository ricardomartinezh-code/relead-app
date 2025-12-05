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
  console.log('🔍 Probando conexión con Neon...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no configurada');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔗 Conectando...');
    const res = await pool.query('SELECT NOW() as current_time, version()');
    console.log('✅ ¡CONEXIÓN EXITOSA!\n');
    console.log('📊 Datos del servidor:');
    console.log(`   Hora: ${res.rows[0].current_time}`);
    console.log(`   Versión: ${res.rows[0].version.split(',')[0]}\n`);

    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    
    console.log(`📋 Tablas: ${tables.rows.length}`);
    tables.rows.forEach(t => console.log(`   - ${t.table_name}`));
    
  } catch(e) {
    console.error('❌ ERROR:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
