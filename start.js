const inquirer = require('inquirer');
const chalk = require('chalk');
const log = console.log;
const mysql = require('mysql');
const cTable = require('console.table');
const password = require('./password');

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

function logo () {
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
    .then ((response) => {
        switch (response.action) {
            case 'View all Employees':
                viewEmployees();
                break;

            case 'View All Employees by Department':
            
                break; 
                
            case 'View all Employees by Manager':
                
                break;

            case 'Add Employee':
                
                break;

            case 'Remove Employee':
                
                break;

            case 'Exit':
                connection.end();
                break;
        
            default:
                console.log(`Invalid action: ${answer.action}`);
                break;
        }
    })
}

function viewEmployees() {
    let employeeArray = [];

    const query = 'SELECT id, first_name, last_name FROM employee';
    connection.query(query, (err, res) => {
        if (err) throw err;
        res.forEach(({id, first_name, last_name}) => {
            let values = [id, first_name, last_name];
            employeeArray.push(values);
        })
        return createEmployeeTable(employeeArray);
    });
}

function createEmployeeTable (values) {
    console.table(['id', 'first_name', 'last_name'], values);
    start();
}

function viewDepartment() {
    inquirer
        .prompt([{
            type: 'input',
            message: `What is the team manager's name?`,
            name: 'managerName'
        },
        {
            type:'input',
            message: `What is the team manager's employee ID?`,
            name: 'managerId',
        },
        {
            type: 'input',
            message: `What is the team manager's email address?`,
            name: 'managerEmail',
        },
        {
            type: 'input',
            message: `What is the team manager's office number?`,
            name: 'office',
        },
    ])
    .then ((response) => {
        console.log(response);
    })
}
