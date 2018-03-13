Drop DATABASE IF exists courseconnectdb;
CREATE DATABASE IF NOT EXISTS CourseConnectDb;
USE CourseConnectDb;

CREATE TABLE IF NOT EXISTS Users (
  LastName    varchar(10)   NOT NULL,
  FirstName   varchar(10)   NOT NULL,
  Email       varchar(255)  NOT NULL,
  UTorId      varchar(10),
  Password    varchar(10)   NOT NULL,
  SecurityQ1  varchar(20), /*NOT NULL,*/
  A1          varchar(15), /*NOT NULL,*/
  SecurityQ2  varchar(20), /*Not NULL,*/
  A2          varchar(15), /*NOT NULL,*/
  SecurityQ3  varchar(20), /*NOT NULL,*/
  A3          varchar(15), /*NOT NULL,*/
  CONSTRAINT PK_Users PRIMARY KEY (Email)
);


INSERT INTO Users (LastName, FirstName, Email, Password) VALUES ("Kyle", "Smith", "kyle.smith@gmail.com", "hehe");
INSERT INTO Users (LastName, FirstName, Email, Password) VALUES ("Sam", "Smith", "sam.smith@gmail.com", "123");
INSERT INTO Users (LastName, FirstName, Email, Password) VALUES ("John", "Keys", "john.keys@gmail.com", "oops");
INSERT INTO Users (LastName, FirstName, Email, Password) VALUES ("Sam", "Benzezos", "sam.benz@gmail.com", "sbenz");



