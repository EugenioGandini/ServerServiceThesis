# ServerServiceThesis
This is a prototype of some digital services offered by the Court of Brescia for the citizen.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

These are the tool you have to install to get the project working:

- Node.js v10.x
- MySql database server (MariaDB)

Ok so if you have these tools already installed than you can go forward to "Installing" section.
If you don't have these above tools you can go here:

* [Node.js v10.x](https://nodejs.org/en/) - Download and install version v10.x
* [MySql database](https://www.apachefriends.org/it/index.html) - This is a set of tools containing MariaDB

Note: If you want only the DB you can go also [here](https://mariadb.org/) and download and install only the DB.

### Installing

Now it's time to set up all the modules and structure of the db to get the server working.

```
You need the project so go on github and clone/download this project.
```
```
Cut/paste the project into a working folder.
```
```
We open a console (cmd on windows or termina on linux).
```
```
We now download all modules necessary by going into the folder we paste the project:
cd *path_to_the_folder*
npm install
```
```
Now we must set up the DB before startig the server.
Start xampp.
```
```
Now we can go to [PhpMyAdmin](http://localhost/phpmyadmin/index.php) and create a new DB called: sito_tribunale_db
```
```
Now we add a new user account for accessing DB by selecting the DB created and going under "Privileges" section.
In this section we add a new user:
* username: funzionario_tribunale
* password: funzionario_tribunale
and we give full privileges to this DB created.
```
```
Now we can restore the DB pre-loaded by going under "Import" section and loading the dump_db.sql file that 
you can find on dump_db folder of this project.
```
```
Ok if all goes well we are ready to start the server.
Go back to the console and type:
node index.js
```
```
The server will now start and you can access the site [here](192.168.1.10:14300/login).
```

## Running the server

If you have already installed the server you don't have to do all the step before but you can simply start 
the project by launching the DB and the index.js.

So the only step will be:

```
Start xampp with MariaDB.
```
```
Open a console and type following commands:
cd *path_to_the_folder*
node index.js
```

## Authors

* **Eugenio Gandini**

## License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details.