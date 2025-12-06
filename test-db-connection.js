#!/usr/bin/env node

/**
 * Script para probar la conexión con la base de datos Neon
 * Uso: node test-db-connection.js
 */

const { Pool } = require('pg');

// Cargar .env si está disponible; no fallar si falta el paquete dotenv.
try {
  require('dotenv').config();
} catch (err) {
  console.warn('dotenv no está instalado; se continuará usando variables de entorno existentes.');
}

async function testConnection() {
  console.log('🔍 Probando conexión con la base de datos Neon...\n');

  // Verificar que DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: La variable DATABASE_URL no está configurada.');
    console.error('   Asegúrate de tener un archivo .env con DATABASE_URL\n');
    process.exit(1);
  }

  console.log('📌 Configuración detectada:');
  const url = new URL(process.env.DATABASE_URL);
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Puerto: ${url.port}`);
  console.log(`   Base de datos: ${url.pathname}\n`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔗 Intentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');

    // Obtener información del servidor
    const result = await client.query('SELECT version();');
    console.log('📊 Información del servidor PostgreSQL:');
    console.log(`   ${result.rows[0].version}\n`);

    // Listar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  La base de datos está vacía (sin tablas públicas).');
    } else {
      console.log(`📋 Tablas encontradas (${tablesResult.rows.length}):`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    client.release();
    console.log('\n✨ Prueba completada exitosamente!');
  } catch (error) {
    console.error('❌ ERROR de conexión:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Consejo: Verifica que DATABASE_URL sea correcto y que el servidor esté disponible.');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Consejo: Las credenciales son incorrectas.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
