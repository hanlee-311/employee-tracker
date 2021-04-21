DROP DATABASE IF EXISTS department_db;
CREATE database department_db;

USE department_db;

CREATE TABLE department (
  id INT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

SELECT * FROM DepartmentTable;