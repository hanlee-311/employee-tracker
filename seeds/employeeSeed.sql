DROP DATABASE IF EXISTS employee_db;
CREATE database employee_db;

USE employee_db;

CREATE TABLE employee (
  id INT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id  INT NULL
);

SELECT * FROM EmployeeTable;