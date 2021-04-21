const inquirer = require('inquirer');
const chalk = require('chalk');
const mysql = require('mysql');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db',
});

connection.connect((err) => {
if (err) throw err;
start();
});

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
                return;
            break;
            case 'Exit':
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