DROP DATABASE IF EXISTS employee_db;
CREATE database employee_db;

USE employee_db;

CREATE TABLE department (
  id INT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE roleTable (
  id INT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id  INT NULL,
  FOREIGN KEY (role_id) REFERENCES roleTable(id),
  FOREIGN KEY (manager_id) REFERENCES roleTable(id)
);


SELECT * FROM DepartmentTable;
SELECT * FROM RoleTable;
SELECT * FROM EmployeeTable;