import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

async function getDb() {
  if (db) return db;
  
  db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      tags TEXT,
      link TEXT
    )
  `);

  // Insert some initial data
  await db.exec(`
    INSERT OR IGNORE INTO products (id, title, tags, links) VALUES
    (1, "TSO Products", "Aftermarket Festool accessories, Precision woodworking tools", "https://tsoproducts.com/?aff=5"),
    (2, "Bits and Bits Company", "Router bits, Drill bits, Saw blades", "http://bit.ly/bitsbitsbw"),
    (3, "Taylor Toolworks", "Woodworking hand tools, Japanese saws, Chisels", "https://lddy.no/1e5hv")
  `);

  return db;
}

export async function getProducts() {
  const db = await getDb();
  return db.all('SELECT * FROM products');
}

export async function addProduct(title, tags, link) {
  const db = await getDb();
  await db.run('INSERT INTO products (title, tags, link) VALUES (?, ?, ?)', [title, tags, link]);
}

export async function updateProduct(id, title, tags, link) {
  const db = await getDb();
  await db.run('UPDATE products SET title = ?, tags = ?, link = ? WHERE id = ?', [title, tags, link, id]);
}

export async function deleteProduct(id) {
  const db = await getDb();
  await db.run('DELETE FROM products WHERE id = ?', [id]);
}