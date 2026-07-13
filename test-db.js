const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres.zlszqcxqunihwzlhlasj:nOOB5Si3TH6oWIHh@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('SUCCESS: Connected to database!');
    
    // Check tables
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('\nPublic tables:', tables.rows.map(r => r.tablename).join(', '));
    
    // Check users
    const users = await client.query("SELECT id, name, email, role FROM \"User\" LIMIT 10");
    console.log('\nUsers:', JSON.stringify(users.rows, null, 2));
    
    // Check orders
    const orders = await client.query("SELECT COUNT(*) as count FROM \"Order\"");
    console.log('\nTotal orders:', orders.rows[0].count);
    
    // Check menu items
    const menuItems = await client.query("SELECT COUNT(*) as count FROM \"MenuItem\"");
    console.log('Total menu items:', menuItems.rows[0].count);
    
    // Check reservations
    const reservations = await client.query("SELECT COUNT(*) as count FROM \"Reservation\"");
    console.log('Total reservations:', reservations.rows[0].count);
    
    // Check tables
    const tablesData = await client.query('SELECT COUNT(*) as count FROM "Table"');
    console.log('Total tables:', tablesData.rows[0].count);
    
    await client.end();
  } catch (e) {
    console.error('FAIL:', e.message);
  }
}

test();
