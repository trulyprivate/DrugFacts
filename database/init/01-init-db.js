// MongoDB initialization script
// This script runs when the container is first initialized

// Switch to admin database to authenticate
db = db.getSiblingDB('admin');

// Create the drug_facts database
db = db.getSiblingDB('drug_facts');

// Create a user for the drug_facts database
db.createUser({
  user: 'drugfacts_user',
  pwd: 'drugfacts_password',
  roles: [
    {
      role: 'readWrite',
      db: 'drug_facts'
    }
  ]
});

// Create initial collections
db.createCollection('drugs');
db.createCollection('therapeutic_classes');
db.createCollection('manufacturers');
db.createCollection('search_index');

// Create indexes for better performance
db.drugs.createIndex({ slug: 1 }, { unique: true });
db.drugs.createIndex({ drugName: 'text', genericName: 'text', activeIngredient: 'text' });
db.drugs.createIndex({ therapeuticClass: 1 });
db.drugs.createIndex({ manufacturer: 1 });
db.drugs.createIndex({ updatedAt: -1 });

db.therapeutic_classes.createIndex({ name: 1 }, { unique: true });
db.manufacturers.createIndex({ name: 1 }, { unique: true });

print('Database initialization completed successfully');