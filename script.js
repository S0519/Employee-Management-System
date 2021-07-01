
/* We need all the modules in order to get the data base (mysql), inquirer allows interactions for the database questions, 
informations, conosle table allows interactions on the screen to see how see on the screen */

const mysql = require("mysql"); //node MySQL module
const inquirer = require("inquirer"); //node inquirer module 
const util = require('util');
const consoleTable = require("console.table"); //node console.table module for console logging prettily


/* Sets up connection to MySQL table define the connection for the database with password, username and database name using mysql module using the connections
the arguments meaning the host which is 3600, the user is root eventhough we can change the user and of course we need the password*/ 

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "employee_DB"
});

connection.query = util.promisify(connection.query);


/* This set up the connection  with connect, and also the err which says if the connection 
has an error into this variable called err we want to throw that error appearing like there is an error*/
//Initiates Connection
connection.connect(function (err) {
    if (err) throw err;
	start();
})

// Give the user a message.
console.table(
    "\nEMPLOYEE TRACKER\n"
)



/* Here we are activating for inquirer and in the first time we define the propmpt. The first prompt has a list of options from which we can select
the initial prompt is: what we want to use with the question marks*/

/* Once this selection is going to be made then run the function, the function has the response object so the inquirer 
   returns the response object */
const start = async () => {
    try {
        let answer = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Departments',
                'View All Roles',
                'Add an Employee',
                'Add a Department',
                'Add a Role',
                'Quit'
            ]
        });

		/* The way the switch works is basicalle is a variable. Base of the value what is in something we execute differents code; 
   		if something contains this we are going to run different code */
	
    	//Run sections of code based on selection of "choice"
        switch (answer.action) {



			/* We use the connection to run a query using the query what I want to run and the function I want to run
        	if err  so I want to trow an err and stop the execution of the program otherwise console table ending the connection. 
        	At the end of the switch there is a default case*/
            case 'View All Employees':
                showEmployees();
                break;

            case 'View All Departments':
                showDepartments();
                break;

            case 'View All Roles':
                showRoles();
                break;

            case 'Add an Employee':
                addNewEmployee();
                break

            case 'Add a Department':
                addNewDepartment();
                break

            case 'Add a Role':
                addNewRole();
                break

            case 'Quit':
                connection.end();
                break;
        };
    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to view all of the employees.
const showEmployees = async () => {
    console.log('Employee View');
    try {
        let query = 'SELECT * FROM employee';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let employeeArray = [];
            res.forEach(employee => employeeArray.push(employee));
            console.table(employeeArray);
            start();
        });
    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to view all of the departments.
const showDepartments = async () => {
    console.log('Department View');
    try {
        let query = 'SELECT * FROM department';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let departmentArray = [];
            res.forEach(department => departmentArray.push(department));
            console.table(departmentArray);
            start();
        });
    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to view all of the roles.
const showRoles = async () => {
    console.log('Role View');
    try {
        let query = 'SELECT * FROM role';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let roleArray = [];
            res.forEach(role => roleArray.push(role));
            console.table(roleArray);
            start();
        });
    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to add a new employee.
const addNewEmployee = async () => {
    try {
        console.log('Add an Employee');
        let roles = await connection.query("SELECT * FROM role");
        let managers = await connection.query("SELECT * FROM employee");
        let answer = await inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'First Name of Employee?'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'Last Name of Employee?'
            },
            {
                name: 'employeeRoleId',
                type: 'list',
                choices: roles.map((role) => {
                    return {
                        name: role.title,
                        value: role.id
                    }
                }),
                message: "Employee's role id?"
            },
            {
                name: 'employeeManagerId',
                type: 'list',
                choices: managers.map((manager) => {
                    return {
                        name: manager.first_name + " " + manager.last_name,
                        value: manager.id
                    }
                }),
                message: "Employee's Manager's Id?"
            }
        ])

        let result = await connection.query("INSERT INTO employee SET ?", {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: (answer.employeeRoleId),
            manager_id: (answer.employeeManagerId)
        });

        console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
        start();

    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to add a new department.
const addNewDepartment = async () => {
    try {
        console.log('Add a Department');
        let answer = await inquirer.prompt([
            {
                name: 'deptName',
                type: 'input',
                message: 'Name of your new department?'
            }
        ]);

        let result = await connection.query("INSERT INTO department SET ?", {
            department_name: answer.deptName
        });

        console.log(`${answer.deptName} added successfully to departments.\n`)
        start();

    } catch (err) {
        console.log(err);
        start();
    };
}

// Selection to add a new role.
const addNewRole = async () => {
    try {
        console.log('Add New Role');

        let departments = await connection.query("SELECT * FROM department")

        let answer = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Name of your new role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Salary this role provides?'
            },
            {
                name: 'departmentId',
                type: 'list',
                choices: departments.map((departmentId) => {
                    return {
                        name: departmentId.department_name,
                        value: departmentId.id
                    }
                }),
                message: 'Department ID of role?',
            }
        ]);
        
        let chosenDepartment;
        for (i = 0; i < departments.length; i++) {
            if(departments[i].department_id === answer.choice) {
                chosenDepartment = departments[i];
            };
        }
        let result = await connection.query("INSERT INTO role SET ?", {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentId
        })

        console.log(`${answer.title} role added successfully.\n`)
        start();

    } catch (err) {
        console.log(err);
        stat();
    };
}
