CREATE TABLE IF NOT EXISTS Complaints (
	comp_id int Primary Key auto_increment,
	User int,
    Summary varchar(30) NOT NULL,
    PostNum int,
    Description varchar(255) NOT NULL,
    foreign key(PostNum) references Posts(po_id),
    foreign key(User) references Users(u_id)
) ENGINE=InnoDB;