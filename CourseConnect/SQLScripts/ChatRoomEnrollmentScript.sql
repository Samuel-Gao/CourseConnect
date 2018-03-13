CREATE TABLE IF NOT EXISTS `enrolledUsers` (
  `eu_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_id` int(11) NOT NULL,
  `c_id` int(11) DEFAULT NULL,
  `class` varchar(160) NOT NULL,
  PRIMARY KEY (`eu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `enrolledUsers`(eu_id, u_id, c_id, class) VALUES(1, 6, 1, "CSCC01");
INSERT INTO `enrolledUsers`(eu_id, u_id, c_id, class) VALUES(2, 5, 1, "CSCC01");
INSERT INTO `enrolledUsers`(eu_id, u_id, c_id, class) VALUES(3, 5, 2, "CSCD01");
INSERT INTO `enrolledUsers`(eu_id, u_id, c_id, class) VALUES(4, 6, 3, "CSCA08");

select * from enrolledUsers cross join Users where enrolledUsers.u_id=Users.u_id and enrolledUsers.class="CSCA08";