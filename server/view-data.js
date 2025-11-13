const { pool } = require('./config/database');

const viewAllData = async () => {
  try {
    console.log(' Checking your database data...\n');

    // Check users
    const users = await pool.query('SELECT id, name, email, role, store_id, created_at FROM users ORDER BY id');
    console.log(' USERS TABLE:');
    console.log('================');
    if (users.rows.length === 0) {
      console.log('No users found');
    } else {
      users.rows.forEach(user => {
        console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | Store ID: ${user.store_id || 'None'}`);
      });
    }
    console.log(`Total Users: ${users.rows.length}\n`);

    // Check stores
    const stores = await pool.query('SELECT * FROM stores ORDER BY id');
    console.log(' STORES TABLE:');
    console.log('================');
    if (stores.rows.length === 0) {
      console.log('No stores found');
    } else {
      stores.rows.forEach(store => {
        console.log(`ID: ${store.id} | Name: ${store.name} | Email: ${store.email}`);
        console.log(`Address: ${store.address}`);
        console.log(`Rating: ${store.average_rating}/5 (${store.total_ratings} ratings)`);
        console.log(`Created: ${store.created_at}`);
        console.log('---');
      });
    }
    console.log(`Total Stores: ${stores.rows.length}\n`);

    // Check ratings
    const ratings = await pool.query(`
      SELECT r.id, r.rating, r.created_at, u.name as user_name, s.name as store_name 
      FROM ratings r 
      JOIN users u ON r.user_id = u.id 
      JOIN stores s ON r.store_id = s.id 
      ORDER BY r.created_at DESC
    `);
    console.log(' RATINGS TABLE:');
    console.log('================');
    if (ratings.rows.length === 0) {
      console.log('No ratings found');
    } else {
      ratings.rows.forEach(rating => {
        console.log(`${rating.user_name} rated "${rating.store_name}" → ${rating.rating}/5 stars (${rating.created_at})`);
      });
    }
    console.log(`Total Ratings: ${ratings.rows.length}\n`);

    // Summary
    console.log(' DATABASE SUMMARY:');
    console.log('====================');
    console.log(`Users: ${users.rows.length}`);
    console.log(`Stores: ${stores.rows.length}`);
    console.log(`Ratings: ${ratings.rows.length}`);

    process.exit(0);
  } catch (error) {
    console.error(' Error viewing data:', error);
    process.exit(1);
  }
};

viewAllData();