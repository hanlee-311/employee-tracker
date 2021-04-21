DROP DATABASE IF EXISTS role_db;
CREATE database role_db;

USE role_db;

CREATE TABLE roleTable (
  id INT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL
);

SELECT * FROM RoleTable;