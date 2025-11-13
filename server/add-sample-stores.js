const { pool } = require('./config/database');

const addSampleStores = async () => {
  try {
    console.log(' Adding sample stores...\n');

    const sampleStores = [
      {
        name: 'Tech Electronics Store',
        email: 'contact@techelectronics.com',
        address: '456 Technology Avenue, Tech City, TC 67890'
      },
      {
        name: 'Fashion Boutique Central',
        email: 'info@fashionboutique.com',
        address: '789 Fashion Street, Style City, SC 11111'
      },
      {
        name: 'Green Grocery Market',
        email: 'hello@greengrocery.com',
        address: '321 Fresh Food Lane, Garden City, GC 22222'
      },
      {
        name: 'Book Haven Library Store',
        email: 'books@bookhaven.com',
        address: '654 Reading Road, Knowledge City, KC 33333'
      },
      {
        name: 'Sports Equipment Pro',
        email: 'info@sportsequipmentpro.com',
        address: '987 Athletic Avenue, Sports City, SP 44444'
      }
    ];

    for (const store of sampleStores) {
      // Check if store already exists
      const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [store.email]);
      
      if (existing.rows.length === 0) {
        const result = await pool.query(
          'INSERT INTO stores (name, email, address) VALUES ($1, $2, $3) RETURNING *',
          [store.name, store.email, store.address]
        );
        console.log(` Added: ${result.rows[0].name}`);
      } else {
        console.log(`Already exists: ${store.name}`);
      }
    }

    console.log('\n Sample stores added successfully!');
    console.log('Run "node server/view-data.js" to see all data');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error adding sample stores:', error);
    process.exit(1);
  }
};

addSampleStores();