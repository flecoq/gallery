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
-- Database: `assembler`
--

-- --------------------------------------------------------

CREATE TABLE `showroom` (
  `id` varchar(20) NOT NULL,
  `title` varchar(50),
  `description` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `showroom`
  ADD PRIMARY KEY (`id`);


CREATE TABLE `room` (
  `id` varchar(20) NOT NULL,
  `parent` varchar(20) NOT NULL,
  `title` varchar(50),
  `description` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `room`
  ADD PRIMARY KEY (`id`);


CREATE TABLE `process` (
  `id` varchar(20) NOT NULL,
  `parent` varchar(20) NOT NULL,
  `content` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `process`
  ADD PRIMARY KEY (`id`);


CREATE TABLE `creationgroup` (
  `id` varchar(20) NOT NULL,
  `parent` varchar(20) NOT NULL,
  `content` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `creationgroup`
  ADD PRIMARY KEY (`id`);


CREATE TABLE `library` (
  `id` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `content` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `library`
  ADD PRIMARY KEY (`id`);


