# ServerServiceThesis
This is a prototype of some digital services offered by the Court of Brescia for the citizen.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

These are the tool you have to install to get the project working:

- Node.js v10.x
- SQL database server (MariaDB my choice)

Ok so if you have these tools already installed than you can go forward to "Installing" section.
If you don't have these above tools you can go here:

* [Node.js v10.x](https://nodejs.org/en/) - Download and install version v10.x
* [MariaDB](https://mariadb.org/) - This is MariaDB

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
Start the db with command:
mysqld 
(if under Windows you have to launch mysqld.exe).
```
```
Now we must at first create the db so from the shell:
mysql -u root -p
CREATE DATABASE 'sito_tribunale_db';
```
```
Now check if the db was created with:
SHOW DATABASES;
```
```
We need to import the db information and structure so:
exit
mysql -u root -p sito_tribunale_db < dump_db.sql
```
```
Add a new user with privileges to the new created db:
mysqld -u root -p
CREATE USER 'funzionario_tribunale' IDENTIFIED BY 'funzionario_tribunale';
GRANT USAGE ON *.* TO 'funzionario_tribunale'@localhost IDENTIFIED BY 'funzionario_tribunale';
GRANT ALL privileges ON `sito_tribunale_db`.* TO 'funzionario_tribunale'@localhost;
FLUSH PRIVILEGES;
```
```
Now we can verify if all is good by:
SHOW GRANTS FOR 'funzionario_tribunale'@localhost;
```
```
Ok if all goes well we are ready to start the server.
Go back to the console and type:
node index.js
```
```
The server will now start and you can access the site [here](localhost:14300/login).
```

## Running the server

If you have already installed the server you don't have to do all the step before but you can simply start 
the project by launching the DB and the index.js.

So the only step will be:

```
Start MariaDB by typing:
mysqld
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