
CREATE DATABASE cscc01; 

USE cscc01;

Drop Table IF EXISTS `Message`;

Drop Table IF EXISTS `Resources`;

Drop Table IF EXISTS `Friends`;

Drop Table IF EXISTS `Posts`;

Drop Table IF EXISTS `Participant`;

Drop Table IF EXISTS `Class`;


Drop Table IF EXISTS `Users`;

Drop Table IF EXISTS `School`;
Drop Table IF EXISTS `Roles`;


Create Table IF NOT EXISTS School(
	s_id int Primary Key AUTO_INCREMENT,
	Name varchar(80),
    email varchar(120),
    contactName varchar(100),
    phone varchar(20),
    PostalCode char(8)
) ENGINE = INNODB;


Create Table IF NOT EXISTS Roles(
	r_id int Primary Key AUTO_INCREMENT,
	Name varchar(60) Not Null,
	Description varchar(120)
) ENGINE = INNODB;

Create Table IF NOT EXISTS Users(
	u_id int Primary Key AUTO_INCREMENT,
	LastName    varchar(15)   NOT NULL,
	FirstName   varchar(15)   NOT NULL,
	Email       varchar(255)  NOT NULL,
    DisplayName varchar(30)   NOT NULL,
    Description	varchar(255),
	UTorId      varchar(10),
	Password    varchar(10)   NOT NULL,
	SecurityQ1  varchar(20), /*NOT NULL,*/
	A1          varchar(15), /*NOT NULL,*/
	SecurityQ2  varchar(20), /*Not NULL,*/
	A2          varchar(15), /*NOT NULL,*/
	SecurityQ3  varchar(20), /*NOT NULL,*/
	A3          varchar(15), /*NOT NULL,*/
    fileLocation varchar(255) /*Profile pic*/
	/* CONSTRAINT PK_Users PRIMARY KEY (Email) */
) ENGINE = INNODB;

Create Table IF NOT EXISTS Class(
	c_id int Primary Key AUTO_INCREMENT,
	title varchar(80),
    description varchar(160),
    CourseCode varchar(30),
    SchoolID int,
    foreign key(SchoolID) references School(s_id)
) ENGINE = INNODB;

Create Table IF NOT EXISTS Participant(
	p_id int Primary Key AUTO_INCREMENT,
    UserID int,
    ClassID int,
    RoleID int,
    foreign key(UserID) references Users(u_id),
    foreign key(RoleID) references Roles(r_id),
    foreign key(ClassID) references Class(c_id)
) ENGINE = INNODB;

Create Table IF NOT EXISTS Friends(
	f_id int Primary Key AUTO_INCREMENT,
    User1 int,
    User2 int,
    hasAccepted bool,
    foreign key(User1) references Users(u_id),
    foreign key(User2) references Users(u_id)
) ENGINE = INNODB;

Create Table IF NOT EXISTS Posts(
	po_id int Primary Key AUTO_INCREMENT,
    Title varchar(60),
	postTime DATETIME,
    description varchar(160),
    solution int,
    solved varchar(15),
    ParticipantID int,
    foreign key(ParticipantID) references Participant(p_id)
) ENGINE = INNODB;


Create Table IF NOT EXISTS Message(
	m_id int Primary Key AUTO_INCREMENT,
	messageTime DATETIME,
    message varchar(255),
    ParticipantID int,
    PostID int, /* Create Custom Trigger.*/
    foreign key(ParticipantID) references Participant(p_id)
) ENGINE = INNODB;

Create Table IF NOT EXISTS Resources(
	r_id int Primary Key AUTO_INCREMENT,
	resourceTime DATETIME,
    fileLocation varchar(255),
    /*Title varchar(40),*/
    ParticipantID int,
    /*isProfile bool,*/
    foreign key(ParticipantID) references Participant(p_id)
) ENGINE = INNODB;

CREATE UNIQUE INDEX EmailIndex ON Users(Email);
