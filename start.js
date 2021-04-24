const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;
const mysql = require('mysql');
const password = require('./password');
const { printTable } = require('console-table-printer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: password,
    database: 'employee_db',
});

connection.connect((err) => {
    if (err) throw err;
    logo();
});

function logo() {
    log(chalk.blue(` 
    -----------------------------------------------------------------------------
     ${chalk.green(`
         _______  __   __  _______  ___      _______  __   __  _______  _______ 
        |       ||  |_|  ||       ||   |    |       ||  | |  ||       ||       |
        |    ___||       ||    _  ||   |    |   _   ||  |_|  ||    ___||    ___|
        |   |___ |       ||   |_| ||   |    |  | |  ||       ||   |___ |   |___ 
        |    ___||       ||    ___||   |___ |  |_|  ||_     _||    ___||    ___|
        |   |___ | ||_|| ||   |    |       ||       |  |   |  |   |___ |   |___ 
        |_______||_|   |_||___|    |_______||_______|  |___|  |_______||_______|`)}
        ${chalk.red(`
         __   __  _______  __    _  _______  _______  _______  ______   
        |  |_|  ||   _   ||  |  | ||   _   ||       ||       ||    _ |  
        |       ||  |_|  ||   |_| ||  |_|  ||    ___||    ___||   | ||  
        |       ||       ||       ||       ||   | __ |   |___ |   |_||_ 
        |       ||       ||  _    ||       ||   ||  ||    ___||    __  |
        | ||_|| ||   _   || | |   ||   _   ||   |_| ||   |___ |   |  | |
        |_|   |_||__| |__||_|  |__||__| |__||_______||_______||___|  |_|
        `)}
    -----------------------------------------------------------------------------
    `))
    start();
}

function start() {
    inquirer
        .prompt([{
            type: 'list',
            message: `What would you like to do?`,
            name: 'action',
            choices: [
                'View all Employees',
                'View All Employees by Department',
                'View all Employees by Manager',
                'Add Employee',
                "Update Employee Information",
                'Remove Employee',
                'View Roles',
                'View Departments',
                'Add Roles',
                'Exit',
            ],
        }
        ])
        .then((response) => {
            switch (response.action) {
                case 'View all Employees':
                    viewEmployees();
                    break;

                case 'View All Employees by Department':
                    selectDepartment();
                    break;

                case 'View all Employees by Manager':

                    break;

                case 'Update Employee Information':
                    updateEmployee();
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Remove Employee':
                    removeEmployee();
                    break;

                case 'View Roles':
                    viewRoles();
                    break;

                case 'View Departments':
                    viewDepartments();
                    break;

                case 'Add Roles':
                    addRoles();
                    break;

                case 'Exit':
                    log(chalk.yellow(`Goodbye! ${chalk.magenta(`ヾ(°∇°*)`)}`));
                    connection.end();
                    break;

                default:
                    console.log(`Invalid action: ${answer.action}`);
                    start();
                    break;
            }
        })
}

//General functions used multiple times
function createTable(values) {
    if (values.length !== 0) {
        printTable(values);
    } else {
        log(chalk.red('Your database is empty. Please add information.'))
    };

    start();
}

//function to view all employees
function viewEmployees() {
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, roletable.title, department.name AS department, roletable.salary, CONCAT (employee.first_name, " ", employee.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        createEmployeeTable(res);
    });
}

//functions to view employees by department
function selectDepartment() {
    const query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which department would you like to view?`,
                name: 'departmentName',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                viewEmployeeByDepartment(response);
            })
    });
}

function viewEmployeeByDepartment(response) {
    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name, roletable.title, department.name AS department, roletable.salary FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let newTable = res.filter((name) => {
            return response.departmentName == name.department;
        })

        createTable(newTable);
    });
}

//functions to add a new employee
function addEmployee() {
    const query = 'SELECT * FROM roletable';

    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'input',
                message: `What is the employee's first name?`,
                name: 'employeeFirstName',
            },
            {
                type: 'input',
                message: `What is the employee's last name?`,
                name: 'employeeLastName',
            },
            {
                type: 'list',
                message: `What is the employee's role?`,
                name: 'employeeRole',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ title }) => {
                        choiceArray.push(title);
                    });
                    return choiceArray;
                },
            },
                // {
                //     type: 'input',
                //     message: `Who is the employee's manager?`,
                //     name: 'managerName',
                // },
            ])
            .then((response) => {
                connection.query(`SELECT roletable.id, roletable.title FROM roletable`, (err, res) => {
                    if (err) throw err;

                    let roleInfo = res.filter((id) => {
                        return response.employeeRole == id.title
                    });
                    let roleId = JSON.parse(JSON.stringify(roleInfo))[0].id
                    addRoleAndInfo(roleId, response);
                })
            })
    })
}

function addRoleAndInfo(id, response) {
    connection.query(`INSERT INTO employee SET?`,
        {
            first_name: response.employeeFirstName,
            last_name: response.employeeLastName,
            role_id: id,
        },
        (err) => {
            if (err) throw err;
            log(chalk.green(`${response.employeeFirstName} ${response.employeeLastName} has been added to your database!`))
            start();
        }
    )
}

//functions to remove an employee
function removeEmployee() {
    const query = 'SELECT CONCAT(employee.first_name, " ", employee.last_name) as name FROM employee';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which employee would you like to remove?`,
                name: 'employeeName',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name FROM employee`;
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    let oldEmployee = res.filter((employee) => {
                        return response.employeeName == employee.name;
                    })
                    let id = JSON.parse(JSON.stringify(oldEmployee))[0].id
                    removeEmployeeById(id, response.employeeName);
                });
            })
    });
}

function removeEmployeeById(id, employee) {
    const query = `DELETE FROM employee WHERE id=${id}`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        log(chalk.red(`You have removed ${employee} successfully!`));
        start();
    });
}

//functions to update an employee's information
function updateEmployee() {
    const query = 'SELECT CONCAT(employee.first_name, " ", employee.last_name) as name FROM employee';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which employee would you like to update?`,
                name: 'employeeName',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name FROM employee`;
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    let oldEmployee = res.filter((employee) => {
                        return response.employeeName == employee.name;
                    })
                    let id = JSON.parse(JSON.stringify(oldEmployee))[0].id
                    updateEmployeeInformation(id, response.employeeName);
                });
            })
    });
}

function updateEmployeeInformation(id, name) {
    console.log(id, name);
    start();
}

//functions to view roles and departments
function viewRoles() {
    const query = 'SELECT roletable.id, roletable.title, roletable.salary, department.name AS department FROM roletable LEFT JOIN department on roletable.department_id = department.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        createTable(res);
    });
}

function viewDepartments() {
    const query = 'SELECT department.id, department.name AS department FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;
        createTable(res);
    });
}

//function to add a new role
function addRoles() {
    const query = 'SELECT * FROM department';

    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'input',
                message: `What is the title of the new role?`,
                name: 'newRole',
            },
            {
                type: 'input',
                message: `What is the new role's salary?`,
                name: 'salary',
            },
            {
                type: 'list',
                message: `Which department is this role under?`,
                name: 'department',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                connection.query(`SELECT department.id, department.name FROM department`, (err, res) => {
                    if (err) throw err;

                    let departmentInfo = res.filter((id) => {
                        return response.department == id.name
                    });
                    let departmentID = JSON.parse(JSON.stringify(departmentInfo))[0].id;
                    addDepartmentAndInfo(departmentID, response);
                })
            })
    })
}

function addDepartmentAndInfo(id, response) {
    connection.query(`INSERT INTO roletable SET?`,
        {
            title: response.newRole,
            salary: response.salary,
            department_id: id,
        },
        (err) => {
            if (err) throw err;
            log(chalk.green(`New role ${response.newRole} has been added to your database!`))
            start();
        }
    )
}