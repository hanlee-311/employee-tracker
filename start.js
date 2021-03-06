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
                'Update Employee Information',
                'Remove Employee',
                'View Roles',
                'View Departments',
                'Add Roles',
                'Remove Roles',
                'Add Departments',
                'Remove Departments',
                'Total Utilized Budget By Department',
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
                    selectManager();
                    break;

                case 'Update Employee Information':
                    updateEmployee();
                    break;

                case 'Add Employee':
                    getEmployees();
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

                case 'Remove Roles':
                    removeRoles();
                    break;

                case 'Add Departments':
                    addDepartment();
                    break;

                case 'Remove Departments':
                    removeDepartment();
                    break;

                case 'Total Utilized Budget By Department':
                    calculateBudget();
                    break;

                case 'Exit':
                    log(chalk.yellow(`Goodbye! ${chalk.magenta(`???(???????*)`)}`));
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
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, roletable.title, department.name AS department, roletable.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        createTable(res);
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
                    const choiceArray = ['Cancel'];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                if (response.departmentName == 'Cancel') {
                    start();
                } else {
                    viewEmployeeByDepartment(response);
                }
            })
    });
}

function viewEmployeeByDepartment(response) {
    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name, roletable.title, department.name AS department, roletable.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let newTable = res.filter((name) => {
            return response.departmentName == name.department;
        })

        createTable(newTable);
    });
}

//functions to view employees by manager
function selectManager() {
    const query = 'SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee, roletable.title, department.name AS department, roletable.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id';

    connection.query(query, (err, res) => {
        if (err) throw err;

        let managerId = res.filter((id) => {
            return id.manager == null
        })

        inquirer
            .prompt([{
                type: 'list',
                message: `Under which manager would you like to view?`,
                name: 'managerName',
                choices() {
                    const choiceArray = ['Cancel'];
                    managerId.forEach(({ employee }) => {
                        choiceArray.push(employee);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                if (response.managerName == 'Cancel') {
                    start();
                } else {
                    viewEmployeesByManager(response);
                }
            })
    });
}

function viewEmployeesByManager(response) {
    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name, roletable.title, department.name AS department, roletable.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let newTable = res.filter((name) => {
            return response.managerName == name.manager;
        })

        createTable(newTable);
    });
}

//functions to add a new employee
function getEmployees() {
    const query = 'SELECT CONCAT (employee.first_name, " ", employee.last_name) as name FROM employee'

    connection.query(query, (err, res) => {
        if (err) throw err;

        addEmployee(res)
    })
}

function addEmployee(manager) {
    const query = `SELECT * FROM roletable`;

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
            {
                type: 'list',
                message: `Who is the employee's manager`,
                name: 'manager',
                choices() {
                    const choiceArray = ['None'];
                    manager.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                connection.query(`SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name FROM employee`, (err, res) => {
                    if (err) throw err;

                    let managerId;

                    if (response.manager !== 'None') {
                        let managerInfo = res.filter((id) => {
                            return response.manager == id.name
                        })

                        managerId = JSON.parse(JSON.stringify(managerInfo))[0].id
                    } else {
                        managerId = null;
                    }

                    connection.query(`SELECT roletable.id, roletable.title FROM roletable`, (err, res) => {
                        if (err) throw err;

                        let roleInfo = res.filter((id) => {
                            return response.employeeRole == id.title
                        });
                        let roleId = JSON.parse(JSON.stringify(roleInfo))[0].id
                        addRoleAndInfo(roleId, response, managerId);
                    })

                })
            })
    })
}

function addRoleAndInfo(id, response, managerId) {
    connection.query(`INSERT INTO employee SET?`,
        {
            first_name: response.employeeFirstName,
            last_name: response.employeeLastName,
            role_id: id,
            manager_id: managerId
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
                    const choiceArray = ['Cancel'];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray
                },
            },
            ])
            .then((response) => {
                if (response.employeeName == 'Cancel') {
                    start();
                } else {
                    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name FROM employee`;
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        let oldEmployee = res.filter((employee) => {
                            return response.employeeName == employee.name;
                        })
                        let id = JSON.parse(JSON.stringify(oldEmployee))[0].id
                        removeEmployeeById(id, response.employeeName);
                    });
                }
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
    inquirer
        .prompt([{
            type: 'list',
            message: `Which of ${name}'s information would you like to update?`,
            name: 'update',
            choices: [{
                name: 'First Name',
                value: 'first_name'
            },
            {
                name: 'Last Name',
                value: 'last_name'
            },
            {
                name: 'Job Role',
                value: 'title'
            },
            {
                name: `${name}'s Manager`,
                value: 'manager'
            },
            {
                name: 'Do not update',
                value: 'none'
            }],
        },])
        .then((response) => {
            if (response.update == 'none') {
                start();
            } else {
                if (response.update == 'first_name' || response.update == 'last_name') {
                    updateName(id, response);
                }
                if (response.update == 'title') {
                    updateRole(id, response);
                }
                if (response.update == 'manager') {
                    updateManager(id, response);
                }
            }
        })
}

function updateName(id, res) {
    inquirer
        .prompt([{
            type: 'input',
            message: `Please enter the new ${res.update}.`,
            name: 'name',
        },])
        .then((response) => {
            const query = `UPDATE employee SET ${res.update} = '${response.name}' WHERE id = ${id}`
            connection.query(query, (err, res) => {
                if (err) throw err;
                log(chalk.green('Success! Employee name updated!'))
                start();
            });
        })
}

function updateRole(id, res) {
    const query = `SELECT * FROM roletable`

    connection.query(query, (err, response) => {
        if (err) throw err;
        inquirer
            .prompt([{
                type: 'list',
                message: `Please enter the new ${res.update}.`,
                name: 'title',
                choices() {
                    const choiceArray = [];
                    response.forEach(({ title , id }) => {
                        var choiceObject = {
                            name: title,
                            value: id,
                        }
                        choiceArray.push(choiceObject);
                    });
                    return choiceArray;
                },
            },])
            .then((userResponse) => {
                const query = `UPDATE employee SET role_id = ${userResponse.title} WHERE id = ${id}`
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    log(chalk.green('Success! Employee role updated!'))
                    start();
                });
            })
    })
}

function updateManager(id, res) {
    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS managerName FROM employee`

    connection.query(query, (err, response) => {
        if (err) throw err;
        inquirer
            .prompt([{
                type: 'list',
                message: `Please enter the new ${res.update}.`,
                name: 'managerName',
                choices() {
                    const choiceArray = ['None'];
                    response.forEach(({ managerName, id }) => {
                        var choiceObject = {
                            name: managerName,
                            value: id,
                        }
                        choiceArray.push(choiceObject);
                    });
                    return choiceArray;
                },
            },])
            .then((response) => {
                if (response.managerName == 'None') {
                    const query = `UPDATE employee SET manager_id = NULL WHERE id = ${id}`
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        log(chalk.green('Success! Employee manager updated!'))
                        start();
                    });
                } else {
                    const query = `UPDATE employee SET manager_id = ${response.managerName} WHERE id = ${id}`
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        log(chalk.green('Success! Employee manager updated!'))
                        start();
                    });
                }
            })
    })
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

//functions to add a new role
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

//functions to remove a role
function removeRoles() {
    const query = 'SELECT * FROM roletable';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which role would you like to remove?`,
                name: 'roleTitle',
                choices() {
                    const choiceArray = ['Cancel'];
                    res.forEach(({ title }) => {
                        choiceArray.push(title);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                const query = `SELECT roletable.id, roletable.title FROM roletable`;
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    if (response.roleTitle == 'Cancel') {
                        start();
                    } else {
                        let roleId = res.filter((role) => {
                            return response.roleTitle == role.title;
                        })
                        let id = JSON.parse(JSON.stringify(roleId))[0].id
                        removeRoleById(id, response);
                    }
                });
            })
    });
}

function removeRoleById(roleId, response) {
    const query = 'SELECT employee.id, employee.role_id FROM employee';
    connection.query(query, (err, res) => {
        let id;

        if (err) throw err;

        let employeeRoleId = res.filter((id) => {
            return roleId == id.role_id;
        })

        if (employeeRoleId[0] == null) {
            id = 0;
        } else {
            id = JSON.parse(JSON.stringify(employeeRoleId))[0].role_id;
        }

        if (id == roleId) {
            log(chalk.red('Cannot delete role! An employee is currently assigned to that position. Please update employee role first before attempting to delete selected role.'))
            removeRoles();
        } else {
            const query = `DELETE FROM roletable WHERE id=${roleId}`;

            connection.query(query, (err, res) => {
                if (err) throw err;
                log(chalk.red(`You have removed ${response.roleTitle} successfully!`));
                start();
            });
        }
    })
}

//function to add a department
function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                message: `What is the name of this department?`,
                name: 'department',
            },
        ])
        .then((response) => {
            connection.query(`INSERT INTO department SET?`,
                {
                    name: response.department
                },
                (err) => {
                    if (err) throw err;
                    log(chalk.green(`New department '${response.department}' has been added to your database!`))
                    start();
                }
            )
        })
}

//functions to remove a department
function removeDepartment() {
    const query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which department would you like to remove?`,
                name: 'department',
                choices() {
                    const choiceArray = ['Cancel'];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                const query = `SELECT department.id, department.name FROM department`;
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    if (response.department == 'Cancel') {
                        start();
                    } else {
                        let departmentId = res.filter((role) => {
                            return response.department == role.name;
                        })
                        let id = JSON.parse(JSON.stringify(departmentId))[0].id
                        removeDepartmentById(id, response);
                    }
                });
            })
    });
}

function removeDepartmentById(departmentId, response) {
    const query = 'SELECT employee.id, employee.role_id, roletable.department_id FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id';
    connection.query(query, (err, res) => {

        let id;

        if (err) throw err;

        let employeeRoleId = res.filter((id) => {
            return departmentId == id.department_id;
        })

        if (employeeRoleId[0] == null) {
            id = 0;
        } else {
            id = JSON.parse(JSON.stringify(employeeRoleId))[0].department_id;
        }

        if (id == departmentId) {
            log(chalk.red('Cannot delete department! An employee is currently assigned to that department. Please update employee role first before attempting to delete selection.'))
            removeRoles();
        } else {
            const query = `DELETE FROM department WHERE id=${departmentId}`;

            connection.query(query, (err, res) => {
                if (err) throw err;
                log(chalk.red(`You have removed ${response.department} successfully!`));
                start();
            });
        }
    })
}

//functions to calculate budget by department
function calculateBudget() {
    const query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([{
                type: 'list',
                message: `Which department would you like to view?`,
                name: 'departmentName',
                choices() {
                    const choiceArray = ['Cancel'];
                    res.forEach(({ name }) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                },
            },
            ])
            .then((response) => {
                if (response.departmentName == 'Cancel') {
                    start();
                } else {
                    calculateDepartment(response);
                }
            })
    });
}

function calculateDepartment(response) {
    const query = `SELECT roletable.title, department.name AS department, roletable.salary FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let newTable = res.filter((name) => {
            return response.departmentName == name.department;
        })

        let salaries = newTable.map(a => a.salary);

        if (salaries.length !== 0) {
            log(chalk.green(`Total cost of the ${response.departmentName} Department is ${chalk.yellow('$' + salaries.reduce((a, b) => a + b))}.`))
        } else (
            log(chalk.red(`There is currently no employees in this department to calculate a budget.`))
        )

        start();
    });
}