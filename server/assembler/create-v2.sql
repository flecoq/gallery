-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2017 at 09:59 PM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 7.0.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `assembler-v2`
--

-- --------------------------------------------------------


CREATE TABLE `room` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent` int NOT NULL,
  `status` int,
  `accessing` int,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `process` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent` int NOT NULL,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `creationgroup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent` int NOT NULL,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(20) NOT NULL,
  `password` varchar(10) NOT NULL,
  `email` varchar(30),
  `profil` int,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `search_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `keyword` varchar(100) NOT NULL,
  `type` int,
  `account` int,
  `room` int,
  `product` int,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `comment_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from` int,
  `search_record` int,
  `notation` int,
  `status` int,
  `content` text,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `access_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from` int,
  `to` int,
  `room` int,
  `status` int,
   PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account` int,
  `search_record` int,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

