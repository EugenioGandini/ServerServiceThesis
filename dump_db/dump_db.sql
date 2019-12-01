-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Dic 01, 2019 alle 18:17
-- Versione del server: 10.4.8-MariaDB
-- Versione PHP: 7.3.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sito_tribunale_db`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `group`
--

CREATE TABLE `group` (
  `oid` int(11) NOT NULL,
  `groupname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `group`
--

INSERT INTO `group` (`oid`, `groupname`) VALUES
(1, 'UtenteRegistrato'),
(2, 'Amministratore'),
(3, 'PersonaleCancelleria');

-- --------------------------------------------------------

--
-- Struttura della tabella `module`
--

CREATE TABLE `module` (
  `oid` int(11) NOT NULL,
  `moduleid` varchar(255) DEFAULT NULL,
  `modulename` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `module`
--

INSERT INTO `module` (`oid`, `moduleid`, `modulename`) VALUES
(1, 'sv1', 'UtenteRegistrato'),
(2, 'sv2', 'Privata'),
(3, 'sv3', 'Gestore');

-- --------------------------------------------------------

--
-- Struttura della tabella `rel_group_module`
--

CREATE TABLE `rel_group_module` (
  `oid_group` int(11) NOT NULL,
  `oid_module` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struttura della tabella `rel_user_group`
--

CREATE TABLE `rel_user_group` (
  `oid_user` int(11) NOT NULL,
  `oid_group` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `rel_user_group`
--

INSERT INTO `rel_user_group` (`oid_user`, `oid_group`) VALUES
(1, 1),
(6, 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `user`
--

CREATE TABLE `user` (
  `oid` int(11) NOT NULL,
  `codicefiscale` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cognome` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `ragione_sociale` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `user`
--

INSERT INTO `user` (`oid`, `codicefiscale`, `password`, `email`, `nome`, `cognome`, `telefono`, `indirizzo`, `ragione_sociale`) VALUES
(1, 'RSSMRA80A01H501U', '$2a$10$sM2OolZ5AwP5NIBI8cKtEeLrTmn2FT5AgaoKHWIjtK.CbsTOmpYCC', 'mario.rossi@gmail.com', 'Mario', 'Rossi', '3375694338', 'Via la Repubblica, 4 (RM)', NULL),
(6, 'STRLCU65L01H501P', '$2a$10$GwxmmUk0MiLEq8nvrfyt4.UIt3a2khUeA3mVcTAnxwm/eZxFZESly', 'luca.storti@yahoo.com', 'Luca', 'Storti', '444444', NULL, NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`oid`);

--
-- Indici per le tabelle `module`
--
ALTER TABLE `module`
  ADD PRIMARY KEY (`oid`);

--
-- Indici per le tabelle `rel_group_module`
--
ALTER TABLE `rel_group_module`
  ADD PRIMARY KEY (`oid_group`,`oid_module`),
  ADD KEY `fk_module` (`oid_module`);

--
-- Indici per le tabelle `rel_user_group`
--
ALTER TABLE `rel_user_group`
  ADD PRIMARY KEY (`oid_user`,`oid_group`),
  ADD KEY `fk_group` (`oid_group`);

--
-- Indici per le tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`oid`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `group`
--
ALTER TABLE `group`
  MODIFY `oid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `module`
--
ALTER TABLE `module`
  MODIFY `oid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `user`
--
ALTER TABLE `user`
  MODIFY `oid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `rel_group_module`
--
ALTER TABLE `rel_group_module`
  ADD CONSTRAINT `fk_group2` FOREIGN KEY (`oid_group`) REFERENCES `group` (`oid`),
  ADD CONSTRAINT `fk_module` FOREIGN KEY (`oid_module`) REFERENCES `module` (`oid`);

--
-- Limiti per la tabella `rel_user_group`
--
ALTER TABLE `rel_user_group`
  ADD CONSTRAINT `fk_group` FOREIGN KEY (`oid_group`) REFERENCES `group` (`oid`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`oid_user`) REFERENCES `user` (`oid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
