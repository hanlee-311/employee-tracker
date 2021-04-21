const inquirer = require('inquirer');
const chalk = require('chalk');
const mysql = require('mysql');

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

start(); 