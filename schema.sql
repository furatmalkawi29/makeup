DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price VARCHAR(255),
  image VARCHAR(255),
  description VARCHAR(65535)
);