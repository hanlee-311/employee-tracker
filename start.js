const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;
const mysql = require('mysql');
const cTable = require('console.table');
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
                'Remove Employee',
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

                case 'Add Employee':

                    break;

                case 'Remove Employee':

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

function viewEmployees() {
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, roletable.title, department.name AS department, roletable.salary, CONCAT (employee.first_name, " ", employee.last_name) AS manager FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        createEmployeeTable(res);
    });
}

function createEmployeeTable(values) {
    if (values.length !== 0) {
        printTable(values);
    } else {
        log(chalk.red('No employees are in your database.'))
    };

    start();
}

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
                viewDepartment(response);
            })
    });
}

function viewDepartment(response) {
    const query = `SELECT employee.id, CONCAT (employee.first_name, " ", employee.last_name) AS name, roletable.title, department.name AS department, roletable.salary FROM employee LEFT JOIN roletable on employee.role_id = roletable.id LEFT JOIN department on roletable.department_id = department.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let newTable = res.filter((name) => {
            return response.departmentName == name.department;
        })
        console.log(newTable)

        createEmployeeTable(newTable);
    });
}