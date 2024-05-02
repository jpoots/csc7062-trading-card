-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 02, 2024 at 10:18 PM
-- Server version: 5.7.39
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `40259713`
--

-- --------------------------------------------------------

--
-- Table structure for table `ability`
--

CREATE TABLE `ability` (
  `ability_id` int(11) NOT NULL,
  `ability_variant_id` int(11) NOT NULL,
  `ability_name` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `card_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ability`
--

INSERT INTO `ability` (`ability_id`, `ability_variant_id`, `ability_name`, `description`, `card_id`) VALUES
(1, 1, 'Return', 'Once during your turn, when you put Unown from your hand onto your Bench, you may return all Energy attached to 1 of your Pokémon to your hand.', 51),
(2, 2, 'Slow Start', 'Regigigas can\'t attack until your opponent has 3 or less Prize cards left.', 40),
(3, 2, 'Dark Aura', 'All Energy attached to Tyranitar is Dark instead of its usual type.', 62),
(4, 1, 'Harvest Bounty', 'Once during your turn (before you attack), If you attach an Energy card from your hand to your Active Pokémon as part of your turn, you may attach an additional Energy card to that Pokémon at the same time. This power can\'t be used if Venusaur is affected by a Special Condition.', 63),
(5, 3, 'Steam Up', 'Once during your turn (before your attack), you may discard a Fire Energy card from your hand. If you do, during this turn, your Basic Fire Pokémon\'s attacks do 30 more damage to your opponent\'s Active Pokémon (before applying Weakness and Resistance).', 66);

-- --------------------------------------------------------

--
-- Table structure for table `ability_variant`
--

CREATE TABLE `ability_variant` (
  `ability_variant_id` int(11) NOT NULL,
  `ability_variant` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ability_variant`
--

INSERT INTO `ability_variant` (`ability_variant_id`, `ability_variant`) VALUES
(1, 'Pokémon Power'),
(2, 'Pokémon Body'),
(3, 'Ability');

-- --------------------------------------------------------

--
-- Table structure for table `api_user`
--

CREATE TABLE `api_user` (
  `api_user_id` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `api_user`
--

INSERT INTO `api_user` (`api_user_id`, `api_key`, `admin`) VALUES
(5, '$2b$05$kqoCwqNi61HGb.XBt2izaeXz4usov7TBYNV4MY39YKq8DBb.XYgA.', 1),
(6, '$2b$05$7kAHoQ4/g1RLm3IYPDSNpeP/OZyQ8cjcNp6lgbqVz4hDLY7SFd/aK', 1),
(7, '$2b$05$UnwY1cYNPAf9bZc/ZddI7OkkTI0.jkpX0nzUt.8Uf0ws9Z7hZfQxS', 1),
(8, '$2b$05$sshKldXKr5..mSs.Zu47UuznyhnYSmNijUVPSFh6pQQcf.GDA6Pma', 1);

-- --------------------------------------------------------

--
-- Table structure for table `attack`
--

CREATE TABLE `attack` (
  `attack_id` int(11) NOT NULL,
  `attack_name` varchar(20) NOT NULL,
  `effect` text NOT NULL,
  `damage` varchar(3) NOT NULL,
  `card_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attack`
--

INSERT INTO `attack` (`attack_id`, `attack_name`, `effect`, `damage`, `card_id`) VALUES
(2, 'Confuse Ray', 'Flip a coin. If heads, the Definding Pokémon is now Confused.', '30', 16),
(3, 'Agility', 'Flip a coin. If heads, during your opponent\'s next turn, prevent all effects of attacks, including damage, done to Raichu.', '20', 17),
(4, 'Thunder', 'Flip a coin. If tails, Raichu does 30 damage to itself.', '60', 17),
(5, 'Scratch', '', '10', 18),
(6, 'Ember', 'Discard 1 Energy card attached to Charmander in order to use this attack.', '30', 18),
(7, 'Gnaw', '', '10', 19),
(8, 'Thunder Jolt', 'Flip a coin. If tails, Pikachu does 10 damage to itself.', '30', 19),
(9, 'Flail', 'Does 10 damage times number of damage counters on Magikarp.', '10x', 20),
(10, 'Tackle', '', '10', 35),
(11, 'Special Rend', 'Search your deck for a Stadium card, show it to your opponent, and put it into your hand. Shuffle your deck afterward. If there is any Stadium card in play, discard it.', '10', 21),
(12, 'Transback', 'You may flip a coin. If heads, discard all Energy attached to Palkia and put the Defending Pokémon and all cards attached to it on top of your opponent\'s deck. Your opponent shuffles his or her deck afterward.', '40', 21),
(13, 'Time Bellow', 'Draw a card.', '10', 22),
(14, 'Flash Cannon', 'You may return all Energy cards attached to Dialga to your hand. If you do, remove the highest Stage Evolution card from the Defending Pokémon and shuffle that card into your opponent\'s deck.', '40', 22),
(15, 'Razor Leaf', '', '20', 23),
(16, 'Over Slash', 'This attack does 10 damage to each of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.', '20', 24),
(17, 'Dark Wing Flaps', 'Choose 1 card from your opponent\'s hand without looking. Look at the card you chose, then have your opponent shuffle that card into his or her deck.', '20', 24),
(18, 'Wrack Down', '', '60', 24),
(19, 'Flame Burst', 'Does 20 damage to 2 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.', '20', 25),
(20, 'Fury Swipes', 'Flip 3 coins. This attack does 40 damage times the number of heads.', '40', 25),
(21, 'Pike', 'Does 30 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.', '30', 26),
(22, 'Surf', '', '80', 26),
(23, 'Cross-Cut', 'If the Defending Pokémon is an Evolved Pokémon, this attack does 30 damage plus 20 more damage.', '30+', 27),
(24, 'Brush Off', 'Put the Defending Pokémon and all cards attached to it on top of your opponent\'s deck. Your opponent shuffles his or her deck afterward. (If your opponent doesn\'t have any Benched Pokémon, this attack does nothing.', '', 27),
(25, 'Vise Bite', 'This attack does 30 more damage for each Colorless in your opponent\'s Active Pokémon\'s Retreat Cost.', '60+', 28),
(26, 'Jaw Lock', 'During your opponent\'s next turn, the Defending Pokémon can\'t retreat.', '130', 28),
(27, 'Seafaring', 'Flip 3 coins. For each heads, attach a Water Energy card from your discard pile to your Benched Pokémon in any way you like.', '', 29),
(28, 'Hydro Pump', 'This attack does 20 more damage for each Water Energy attached to this Pokémon.', '10+', 29),
(31, 'Lead', 'Search your deck for up to 2 Supporter cards, reveal them, and put them into your hand. Shuffle your deck afterward.', '', 30),
(32, 'Charge Dash', 'You may do 20 more damage. If you do, this Pokémon does 20 damage to itself.', '70+', 30),
(33, 'Energy Retrieval', 'Search your discard pile for up to 2 basic Energy cards and attach them to 1 of your Pokémon. Put 1 damage counter on that Pokémon for each Energy card attached in this way.', '', 31),
(34, 'Super Singe', 'Flip a coin. If heads, the Defending Pokémon is now Burned.', '20', 32),
(35, 'Flamethrower', 'Discard a Fire Energy card attached to Flareon.', '70', 32),
(36, 'Double Kick', 'Flip 2 coins. This attack does 20 damage times the number of heads.', '20x', 33),
(37, 'Lightning Strike', 'You may discard all Lightning Energy cards attached to Jolteon. If you do, this attack\'s base damage is 70 instead of 40.', '40', 33),
(38, 'Elemental Blast', 'Discard a Energy card, a Energy card, and a Energy card attached to Lugia in order to use this attack.', '90', 34),
(39, 'Tail Crush', 'Flip a coin. If heads, this attack does 30 damage plus 20 more damage; if tails, this attack does 30 damage.', '', 35),
(40, 'Tackle', '', '20', 23),
(41, 'Tail Slap', '', '20', 36),
(42, 'Magma Punch', '', '40', 36),
(43, 'Slash', '', '20', 37),
(44, 'Poison Sting', 'Flip a coin. If heads, the Defending Pokémon is now Poisoned.', '10', 37),
(45, 'Ice Fang', 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed and discard an Energy card attached to the Defending Pokémon.', '40', 38),
(46, 'Charge Through', 'You may do 60 damage plus 40 more damage and 40 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.) If you do, Mamoswine does 40 damage to itself.', '60+', 38),
(47, 'Hypnoblast', 'The Defending Pokémon is now Asleep.', '10', 39),
(48, 'Psychic', 'Does 40 damage plus 10 more damage for each Energy attached to the Defending Pokémon.', '40+', 39),
(49, 'Crush Grip', 'If the Defending Pokémon already has any damage counters on it, this attack\'s base damage is 40 instead of 120.', '120', 40),
(50, 'Burning Poison ', 'Choose either Burned or Poisoned. The Defending Pokémon is now affected by that Special Condition. You may return Gliscor and all cards attached to it to your hand.', '', 41),
(51, 'Pester', 'If the Defending Pokémon is affected by a Special Condition, this attack does 40 damage plus 40 more damage.', '40+', 41),
(52, 'Sharp Fang', '', '50', 47),
(53, 'Fire Mane', '', '90', 47),
(54, 'Hydro Splash', '', '50', 48),
(55, 'Hyper Beam', 'Discard an Energy card attached to the Defending Pokémon.', '80', 48),
(56, 'Sharpen Claws', 'Flip 3 coins. For each heads, discard a card from your opponent’s hand without looking.', '', 49),
(57, 'Sneaky Attack', 'If Persian has any Darkness Energy attached to it, this attack does 30 damage plus 30 more damage.', '30+', 49),
(58, 'Super Poison Breath ', 'The Defending Pokémon is now Poisoned.', '', 50),
(59, 'Super Explosion', 'Weezing does 90 damage to itself, and don’t apply Weakness to this damage.', '90', 50),
(60, 'Hidden Power', '', '10', 51),
(61, 'Dragon Wave', 'Discard a Grass Energy and a Lightning Energy from this Pokémon.', '130', 57),
(62, 'Giant Tail', 'Flip a coin. If tails, this attack does nothing.', '200', 57),
(63, 'Fly Around', 'If any damage is done to this Pokémon by attacks during your opponent’s next turn, flip a coin. If heads, prevent that damage.', '10', 58),
(64, 'False Accusation', 'This attack does 20 more damage for each card in your opponent’s hand.', '20+', 59),
(65, 'Obsidian Fang', 'Before doing damage, discard all Pokémon Tool cards from your opponent’s Active Pokémon.', '120', 59),
(66, 'Dragon\'s Wish', 'During your next turn, you may attach any number of Energy cards from your hand to your Pokémon.', '', 60),
(67, 'Tail Smack', '', '60', 60),
(68, 'Dark Clamp', 'The Defending Pokémon can’t retreat during your opponent’s next turn.', '30', 61),
(69, 'Fight Back', 'If this Pokémon has any damage counters on it, this attack does 80 more damage.', '50+', 61),
(70, 'Tackle', '', '10', 20),
(71, 'Body Slam', 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.', '40', 63),
(72, 'Stamp', 'Flip a coin. If heads, this attack does 50 damage plus 10 more damage and does 10 damage to each of your opponent\'s Benched Pokémon, if any. (Don\'t apply Weakness and Resistance for Benched Pokémon.)', '30+', 62),
(73, 'Wicked Wind', 'Until the end of your opponent\'s next turn, each Stadium or Pokémon Tool card in play has no effect. (This includes cards that come into play on that turn.)', '40', 64),
(74, 'Extrasensory', 'If you have the same number of cards in your hand as your opponent, this attack does 60 more damage.', '60+', 64),
(75, 'Shimmering Scales', 'Flip a coin. If heads, your opponent\'s Active Pokémon is now Confused. If tails, your opponent\'s Active Pokémon is now Paralyzed.', '20', 65),
(76, 'Power Hurricane', 'Discard all Energy attached to this Pokémon.', '120', 65),
(77, 'Volcanic Heat', 'This Pokémon can\'t attack during your next turn.', '130', 66),
(78, 'Double Thread', 'This attack does 30 damage to 2 of your opponent\'s Benched Pokémon. Apply Weakness and Resistance.', '', 67),
(79, 'Electroweb', 'The Defending Pokémon can\'t retreat during your opponent\'s next turn.', '30', 67),
(80, 'Play Rough', 'Flip a coin. If heads, this attack does 30 more damage.', '30+', 68),
(81, 'Bubble Drain', 'Heal 30 damage from this Pokémon.', '80', 68);

-- --------------------------------------------------------

--
-- Table structure for table `attack_type`
--

CREATE TABLE `attack_type` (
  `attack_type_id` int(11) NOT NULL,
  `attack_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `multiplier` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attack_type`
--

INSERT INTO `attack_type` (`attack_type_id`, `attack_id`, `type_id`, `multiplier`) VALUES
(2, 2, 3, 3),
(3, 3, 4, 1),
(4, 3, 5, 2),
(5, 4, 4, 3),
(6, 4, 5, 1),
(7, 5, 5, 1),
(8, 6, 7, 1),
(9, 6, 5, 1),
(10, 7, 5, 1),
(11, 8, 4, 1),
(12, 8, 5, 1),
(13, 10, 5, 1),
(14, 9, 8, 1),
(15, 11, 8, 1),
(16, 12, 8, 2),
(17, 12, 5, 1),
(18, 13, 9, 1),
(19, 14, 9, 2),
(20, 14, 5, 1),
(21, 15, 10, 1),
(22, 16, 5, 2),
(23, 17, 3, 2),
(24, 18, 3, 1),
(25, 18, 5, 2),
(26, 20, 5, 3),
(27, 19, 7, 1),
(28, 21, 5, 2),
(29, 22, 8, 2),
(30, 22, 5, 1),
(31, 25, 5, 2),
(32, 25, 8, 1),
(33, 26, 8, 1),
(34, 26, 5, 3),
(35, 27, 8, 1),
(36, 28, 5, 2),
(37, 31, 5, 1),
(38, 32, 10, 1),
(39, 32, 5, 2),
(40, 33, 4, 1),
(41, 34, 7, 1),
(42, 34, 5, 1),
(43, 35, 7, 3),
(44, 36, 5, 2),
(45, 37, 4, 2),
(46, 37, 5, 1),
(47, 38, 7, 1),
(48, 38, 8, 1),
(49, 38, 4, 1),
(50, 40, 5, 2),
(51, 39, 9, 1),
(52, 39, 5, 2),
(53, 41, 5, 2),
(54, 42, 7, 2),
(55, 42, 5, 1),
(56, 44, 7, 1),
(57, 43, 5, 2),
(58, 45, 8, 1),
(59, 45, 5, 2),
(60, 46, 7, 1),
(61, 46, 5, 3),
(62, 47, 5, 1),
(63, 48, 3, 1),
(64, 48, 5, 2),
(65, 49, 7, 1),
(66, 49, 8, 1),
(67, 49, 9, 1),
(68, 49, 5, 1),
(69, 51, 7, 1),
(70, 51, 5, 1),
(71, 52, 7, 1),
(72, 53, 7, 1),
(73, 53, 5, 3),
(74, 54, 8, 1),
(75, 54, 5, 2),
(76, 55, 8, 2),
(77, 55, 5, 2),
(78, 56, 5, 1),
(79, 57, 5, 2),
(80, 58, 3, 1),
(81, 59, 5, 2),
(82, 60, 3, 1),
(83, 61, 10, 1),
(84, 61, 4, 1),
(85, 62, 5, 5),
(86, 63, 12, 1),
(87, 64, 5, 2),
(88, 65, 11, 2),
(89, 65, 5, 1),
(90, 66, 5, 1),
(91, 67, 10, 1),
(92, 67, 4, 1),
(93, 67, 5, 1),
(94, 68, 12, 1),
(95, 68, 12, 1),
(96, 69, 12, 1),
(97, 69, 5, 2),
(98, 70, 5, 1),
(99, 72, 11, 4),
(100, 71, 10, 2),
(101, 71, 5, 2),
(102, 73, 10, 1),
(103, 74, 5, 2),
(104, 75, 10, 1),
(105, 76, 5, 3),
(106, 77, 7, 2),
(107, 77, 5, 1),
(108, 78, 5, 1),
(109, 79, 4, 1),
(110, 80, 5, 1),
(111, 81, 5, 1),
(112, 81, 12, 2);

-- --------------------------------------------------------

--
-- Table structure for table `card`
--

CREATE TABLE `card` (
  `card_id` int(11) NOT NULL,
  `name` varchar(15) NOT NULL,
  `tcg_id` varchar(30) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `hp` int(3) NOT NULL,
  `expansion_id` int(11) NOT NULL,
  `evolve_from` varchar(255) DEFAULT NULL,
  `stage_id` int(11) NOT NULL,
  `illustrator_id` int(11) NOT NULL,
  `card_number` varchar(15) NOT NULL,
  `rarity_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card`
--

INSERT INTO `card` (`card_id`, `name`, `tcg_id`, `image_url`, `hp`, `expansion_id`, `evolve_from`, `stage_id`, `illustrator_id`, `card_number`, `rarity_id`) VALUES
(16, 'Alakazam', 'base1-1', 'https://assets.tcgdex.net/en/base/base1/1/high.webp', 80, 13, 'Kadabra', 4, 13, '1/102', 1),
(17, 'Raichu', 'base1-14', 'https://assets.tcgdex.net/en/base/base1/14/high.webp', 80, 13, 'Pikachu', 5, 13, '14/102', 1),
(18, 'Charmander', 'base1-46', 'https://assets.tcgdex.net/en/base/base1/46/high.webp', 50, 13, NULL, 6, 14, '46/102', 2),
(19, 'Pikachu', 'base1-58', 'https://assets.tcgdex.net/en/base/base1/58/high.webp', 40, 13, NULL, 6, 14, '58/102', 2),
(20, 'Magikarp', 'base1-35', 'https://assets.tcgdex.net/en/base/base1/35/high.webp', 30, 13, NULL, 6, 14, '35/102', 3),
(21, 'Palkia', 'dp1-11', 'https://assets.tcgdex.net/en/dp/dp1/11/high.webp', 90, 14, NULL, 6, 15, '11/130', 4),
(22, 'Dialga', 'dp1-1', 'https://assets.tcgdex.net/en/dp/dp1/1/high.webp', 90, 14, NULL, 6, 15, '1/130', 4),
(23, 'Turtwig', 'dp1-103', 'https://assets.tcgdex.net/en/dp/dp1/103/high.webp', 60, 14, NULL, 6, 13, '103/130', 2),
(24, 'Giratina', 'pl1-10', 'https://assets.tcgdex.net/en/pl/pl1/10/high.webp', 100, 15, NULL, 6, 16, '10/127', 4),
(25, 'Simisear', 'bw1-22', 'https://assets.tcgdex.net/en/bw/bw1/22/high.webp', 90, 16, 'Pansear', 5, 17, '22/114', 3),
(26, 'Samurott', 'bw1-31', 'https://assets.tcgdex.net/en/bw/bw1/31/high.webp', 140, 16, 'Dewott', 4, 18, '31/114', 1),
(27, 'Machamp GL', 'pl2-46', 'https://assets.tcgdex.net/en/pl/pl2/46/high.webp', 100, 15, NULL, 6, 19, '46/111', 3),
(28, 'Drednaw', 'swsh1-61', 'https://assets.tcgdex.net/en/swsh/swsh1/61/high.png', 130, 17, 'Chewtle', 5, 20, '061/202', 1),
(29, 'Lapras', 'xy1-35', 'https://assets.tcgdex.net/en/xy/xy1/35/high.webp', 110, 19, NULL, 6, 20, '35/146', 1),
(30, 'Gogoat', 'xy1-19', 'https://assets.tcgdex.net/en/xy/xy1/19/high.webp', 110, 19, 'Skiddo', 5, 21, '19/146', 1),
(31, 'Pichu', 'ex2-20', 'https://assets.tcgdex.net/en/ex/ex2/20/high.webp', 40, 18, NULL, 6, 22, '20/100', 1),
(32, 'Flareon', 'ex2-5', 'https://assets.tcgdex.net/en/ex/ex2/5/high.webp', 80, 18, 'Eevee', 5, 23, '5/100', 1),
(33, 'Jolteon', 'ex2-6', 'https://assets.tcgdex.net/en/ex/ex2/6/high.webp', 70, 18, 'Eevee', 5, 24, '6/100', 1),
(34, 'Lugia', 'neo1-9', 'https://assets.tcgdex.net/en/neo/neo1/9/high.webp', 90, 20, NULL, 6, 25, '9/111', 1),
(35, 'Steelix', 'neo1-15', 'https://assets.tcgdex.net/en/neo/neo1/15/high.webp', 110, 20, 'Onix', 5, 13, '15/111', 1),
(36, 'Magmar', 'neo1-40', 'https://assets.tcgdex.net/en/neo/neo1/40/high.webp', 70, 20, NULL, 6, 22, '40/111', 3),
(37, 'Gligar', 'neo1-59', 'https://assets.tcgdex.net/en/neo/neo1/59/high.webp', 60, 20, NULL, 6, 25, '59/111', 2),
(38, 'Mamoswine', 'dp6-9', 'https://assets.tcgdex.net/en/dp/dp6/9/high.webp', 140, 14, 'Piloswine', 4, 26, '9/146', 4),
(39, 'Mewtwo', 'dp6-11', 'https://assets.tcgdex.net/en/dp/dp6/11/high.webp', 80, 14, NULL, 6, 13, '11/146', 4),
(40, 'Regigigas', 'dp6-15', 'https://assets.tcgdex.net/en/dp/dp6/15/high.webp', 120, 14, NULL, 6, 27, '15/146', 4),
(41, 'Gliscor', 'dp6-5', 'https://assets.tcgdex.net/en/dp/dp6/5/high.webp', 80, 14, 'Gligar', 5, 28, '5/146', 4),
(47, 'Arcanine', 'hgss1-1', 'https://assets.tcgdex.net/en/hgss/hgss1/1/high.webp', 110, 21, 'Growlithe', 5, 29, '1/123', 4),
(48, 'Gyarados', 'hgss1-4', 'https://assets.tcgdex.net/en/hgss/hgss1/4/high.webp', 130, 21, 'Magikarp', 5, 14, '4/123', 4),
(49, 'Persian', 'hgss1-27', 'https://assets.tcgdex.net/en/hgss/hgss1/27/high.webp', 80, 21, 'Meowth', 5, 19, '2/123', 1),
(50, 'Weezing', 'hgss1-34', 'https://assets.tcgdex.net/en/hgss/hgss1/34/high.webp', 90, 21, 'Koffing', 5, 16, '34/123', 1),
(51, 'Unown', 'hgss1-54', 'https://assets.tcgdex.net/en/hgss/hgss1/54/high.webp', 50, 21, NULL, 6, 32, '54/123', 3),
(57, 'Dragonite', 'sm1-96', 'https://assets.tcgdex.net/en/sm/sm1/96/high.webp', 160, 22, 'Dragonair', 4, 33, '96/149', 1),
(58, 'Cutiefly', 'sm1-92', 'https://assets.tcgdex.net/en/sm/sm1/92/high.webp', 30, 22, NULL, 6, 20, '92/149', 2),
(59, 'Krookodile', 'sm1-85', 'https://assets.tcgdex.net/en/sm/sm1/85/high.webp', 150, 22, 'Krokorok', 4, 16, '85/149', 1),
(60, 'Dragonair', 'sm1-95', 'https://assets.tcgdex.net/en/sm/sm1/95/high.webp', 90, 22, 'Dratini', 5, 34, '95/149', 3),
(61, 'Granbull', 'sm1-91', 'https://assets.tcgdex.net/en/sm/sm1/91/high.webp', 110, 22, 'Snubbull', 5, 35, '91/149', 3),
(62, 'Tyranitar', 'ecard1-66', 'https://assets.tcgdex.net/en/ecard/ecard1/66/high.png', 120, 23, 'Pupitar', 4, 37, '66/165', 1),
(63, 'Venusaur', 'ecard1-68', 'https://assets.tcgdex.net/en/ecard/ecard1/68/high.png', 100, 23, 'Ivysaur', 4, 36, '68/165', 1),
(64, 'Shiftry', 'xy11-11', 'https://assets.tcgdex.net/en/xy/xy11/11/high.webp', 140, 19, 'Nuzleaf', 4, 19, '11/114', 1),
(65, 'Volcarona', 'xy11-15', 'https://assets.tcgdex.net/en/xy/xy11/15/high.webp', 110, 19, 'Larvesta', 5, 26, '15/114', 1),
(66, 'Volcanion EX', 'xy11-26', 'https://assets.tcgdex.net/en/xy/xy11/26/high.webp', 180, 19, '', 6, 21, '26/114', 5),
(67, 'Galvantula', 'xy11-42', 'https://assets.tcgdex.net/en/xy/xy11/42/high.webp', 90, 19, 'Joltik', 5, 38, '42/114', 1),
(68, 'Azumarill', 'xy11-77', 'https://assets.tcgdex.net/en/xy/xy11/77/high.webp', 100, 19, 'Marill', 5, 39, '77/114', 3);

-- --------------------------------------------------------

--
-- Table structure for table `card_like`
--

CREATE TABLE `card_like` (
  `card_like_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card_like`
--

INSERT INTO `card_like` (`card_like_id`, `card_id`, `user_id`) VALUES
(42, 16, 24),
(40, 20, 23),
(53, 21, 24),
(44, 22, 24),
(61, 23, 25),
(73, 23, 26),
(74, 24, 26),
(49, 26, 24),
(66, 26, 25),
(59, 27, 25),
(41, 31, 23),
(38, 33, 23),
(45, 33, 24),
(65, 33, 25),
(70, 33, 26),
(48, 34, 24),
(71, 35, 26),
(58, 37, 25),
(54, 39, 24),
(55, 40, 24),
(72, 40, 26),
(52, 41, 24),
(57, 41, 25),
(62, 47, 25),
(39, 48, 23),
(47, 48, 24),
(75, 49, 26),
(51, 50, 24),
(43, 57, 24),
(63, 57, 25),
(69, 57, 26),
(37, 59, 23),
(64, 60, 25),
(46, 61, 24),
(50, 62, 24),
(67, 62, 25),
(77, 62, 26),
(60, 63, 25),
(76, 64, 26),
(56, 65, 24),
(68, 67, 26);

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `collection_id` int(11) NOT NULL,
  `collection_name` varchar(25) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `collection`
--

INSERT INTO `collection` (`collection_id`, `collection_name`, `user_id`) VALUES
(38, 'Dual-Type', 22),
(39, 'Hot Hot Hot', 22),
(41, 'Data Monsters', 23),
(42, 'DataDex', 23),
(43, 'Chris\'s Critters', 24),
(44, 'ChrisCollect', 24),
(45, 'Mag\'s Marvels', 25),
(46, 'Aidan\'s Arsenal', 25),
(47, 'Leo\'s Lineup', 26),
(48, 'Leo\'s Legion', 26);

-- --------------------------------------------------------

--
-- Table structure for table `collection_card`
--

CREATE TABLE `collection_card` (
  `collection_card_id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `collection_card`
--

INSERT INTO `collection_card` (`collection_card_id`, `collection_id`, `card_id`) VALUES
(23, 38, 66),
(24, 38, 64),
(25, 38, 67),
(26, 38, 68),
(27, 39, 47),
(28, 39, 18),
(29, 39, 36),
(30, 41, 16),
(31, 41, 37),
(32, 41, 24),
(33, 41, 41),
(34, 42, 40),
(35, 42, 51),
(36, 42, 63),
(37, 42, 62),
(38, 43, 30),
(39, 43, 59),
(40, 43, 27),
(41, 43, 20),
(42, 43, 26),
(43, 44, 41),
(44, 44, 21),
(45, 44, 39),
(46, 44, 40),
(47, 44, 65),
(48, 45, 37),
(49, 45, 41),
(50, 45, 27),
(51, 46, 47),
(52, 46, 57),
(53, 46, 57),
(54, 46, 57),
(55, 46, 33),
(56, 46, 33),
(57, 46, 26),
(58, 46, 62),
(60, 47, 33),
(62, 47, 35),
(63, 47, 24),
(64, 48, 49),
(65, 48, 64),
(66, 48, 62),
(67, 48, 23),
(68, 47, 62);

-- --------------------------------------------------------

--
-- Table structure for table `collection_comment`
--

CREATE TABLE `collection_comment` (
  `collection_comment_id` int(11) NOT NULL,
  `comment_text` varchar(255) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `time_posted` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `collection_comment`
--

INSERT INTO `collection_comment` (`collection_comment_id`, `comment_text`, `collection_id`, `user_id`, `time_posted`) VALUES
(31, 'These are some of my favourite dual-type pokemon. They\'re fun because they force developers to use an extra table in their database...', 38, 22, '2024-04-29 21:45:18'),
(32, 'I mean they could\'ve just ignored them? But at least they normalised it properly...', 38, 23, '2024-04-29 21:48:56'),
(33, 'Why would you pick the weird ones with abilities?', 42, 24, '2024-04-29 22:05:12'),
(34, 'There\'s no way you have 3 legendary pokemon Chris...', 44, 25, '2024-04-30 09:10:27'),
(35, 'Spicy!', 39, 26, '2024-04-30 09:31:36'),
(36, 'Probably because the developer wants to show that they included abilities in the database Chris.', 42, 26, '2024-04-30 09:32:41');

-- --------------------------------------------------------

--
-- Table structure for table `collection_rating`
--

CREATE TABLE `collection_rating` (
  `collection_rating_id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `collection_rating`
--

INSERT INTO `collection_rating` (`collection_rating_id`, `collection_id`, `user_id`, `rating`) VALUES
(39, 38, 23, 2),
(40, 39, 23, 4),
(41, 41, 24, 3),
(42, 39, 24, 3),
(43, 38, 24, 3),
(44, 42, 24, 2),
(45, 44, 25, 4),
(46, 43, 25, 4),
(47, 38, 26, 4),
(49, 41, 26, 3),
(50, 42, 26, 4),
(51, 43, 26, 3),
(52, 44, 26, 4),
(53, 45, 26, 3),
(54, 46, 26, 4),
(55, 47, 24, 3),
(57, 38, 27, 3),
(58, 39, 26, 3);

-- --------------------------------------------------------

--
-- Table structure for table `expansion`
--

CREATE TABLE `expansion` (
  `expansion_id` int(11) NOT NULL,
  `expansion_name` varchar(50) NOT NULL,
  `tcg_id` varchar(15) NOT NULL,
  `logo_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `expansion`
--

INSERT INTO `expansion` (`expansion_id`, `expansion_name`, `tcg_id`, `logo_url`) VALUES
(13, 'Base Set', 'base', 'https://assets.tcgdex.net/en/base/base1/logo.png'),
(14, 'Diamond & Pearl', 'dp', 'https://assets.tcgdex.net/en/dp/dp1/logo.png'),
(15, 'Platinum', 'pl', 'https://assets.tcgdex.net/en/pl/pl1/logo.png'),
(16, 'Black & White', 'bw', 'https://assets.tcgdex.net/en/bw/bw1/logo.png'),
(17, 'Sword & Shield', 'swsh', 'https://assets.tcgdex.net/en/swsh/swsh1/logo.png'),
(18, 'EX', 'ex', 'https://assets.tcgdex.net/en/ex/ex1/logo.png'),
(19, 'XY', 'xy', 'https://assets.tcgdex.net/en/xy/xy1/logo.png'),
(20, 'Neo', 'neo', 'https://assets.tcgdex.net/en/neo/neo1/logo.png'),
(21, 'HeartGold SoulSilver', 'hgss', 'https://assets.tcgdex.net/en/hgss/hgss1/logo.png'),
(22, 'Sun & Moon', 'sm', 'https://assets.tcgdex.net/en/sm/sm1/logo.png'),
(23, 'E-Card', 'ecard', 'https://assets.tcgdex.net/en/ecard/ecard1/logo.png');

-- --------------------------------------------------------

--
-- Table structure for table `illustrator`
--

CREATE TABLE `illustrator` (
  `illustrator_id` int(11) NOT NULL,
  `illustrator_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `illustrator`
--

INSERT INTO `illustrator` (`illustrator_id`, `illustrator_name`) VALUES
(13, 'Ken Sugimori'),
(14, 'Mitsuhiro Arita'),
(15, 'Nakaoka'),
(16, 'Hajime Kusajima'),
(17, 'Shin Nagasawa'),
(18, 'Masakazu Fukuda'),
(19, 'Kagemaru Himeno'),
(20, 'Hitoshi Ariga'),
(21, '5ban Graphics'),
(22, 'Naoyo Kimura'),
(23, 'Midori Harada'),
(24, 'Atsuko Nishida'),
(25, 'Hironobu Yoshida'),
(26, 'Kouki Saitou'),
(27, 'Ryo Ueda'),
(28, 'Kent Kanetsuna'),
(29, 'Naoki Saito'),
(32, 'Hideaki Hakozaki'),
(33, 'Hiroyuki Yamamoto'),
(34, 'hatachu'),
(35, 'Suwama Chiaki'),
(36, 'Shin-ichi Yoshida'),
(37, 'Kimiya Masago'),
(38, 'match'),
(39, 'Sanosuke Sakuma');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `body` varchar(255) NOT NULL,
  `time_sent` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`message_id`, `sender_id`, `recipient_id`, `card_id`, `subject`, `body`, `time_sent`) VALUES
(10, 26, 24, 21, 'Trading For Palkia', 'Hi Chris. Would you take Giratina?', '2024-04-30 09:54:17'),
(11, 24, 26, 21, 'Trading For Palkia', 'Sorry Leo, not interested.', '2024-04-30 09:56:58'),
(12, 24, 22, 47, 'Trading For Arcanine', 'Palkia for Arcanine?', '2024-04-30 09:58:12'),
(13, 25, 23, 24, 'Trading For Giratina', 'Trade you Dragonite?', '2024-04-30 09:59:28'),
(14, 23, 25, 24, 'Trading For Giratina', 'Ok. Meet you on the first floor lab?', '2024-04-30 10:00:41'),
(15, 23, 22, 66, 'Trading For Volcanion EX', 'Aidan\'s trading me an Arcanine. What about that for Volcanion?', '2024-04-30 10:01:22');

-- --------------------------------------------------------

--
-- Table structure for table `rarity`
--

CREATE TABLE `rarity` (
  `rarity_id` int(11) NOT NULL,
  `rarity_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `rarity`
--

INSERT INTO `rarity` (`rarity_id`, `rarity_name`) VALUES
(1, 'Rare'),
(2, 'Common'),
(3, 'Uncommon'),
(4, 'Rare Holo'),
(5, 'Ultra Rare');

-- --------------------------------------------------------

--
-- Table structure for table `stage`
--

CREATE TABLE `stage` (
  `stage_id` int(11) NOT NULL,
  `stage_name` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `stage`
--

INSERT INTO `stage` (`stage_id`, `stage_name`) VALUES
(4, 'Stage 2'),
(5, 'Stage 1'),
(6, 'Basic');

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(15) NOT NULL,
  `type_image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`type_id`, `type_name`, `type_image`) VALUES
(3, 'Psychic', 'https://static.tcgcollector.com/content/images/15/d0/90/15d090c57838f2757ae7fdf49beb0c33500c27baa9abe3c0ce00641e1e498d34.png'),
(4, 'Lightning', 'https://static.tcgcollector.com/content/images/f6/97/e9/f697e9fac5d1e2bc1091ecf9eb575cf737cd3f2a49a1576890bf4dc242de7080.png'),
(5, 'Colorless', 'https://static.tcgcollector.com/content/images/58/cf/1e/58cf1ecf0a2fa2cb2210a49a9d0d016f531a0f57d97425bf229f7a396f9bb969.png'),
(6, 'Fighting', 'https://static.tcgcollector.com/content/images/bc/68/e7/bc68e7e5c8ebc975410dfc7a83d7e31e99040302cb3ac97258e5a09aa7147777.png'),
(7, 'Fire', 'https://static.tcgcollector.com/content/images/24/73/e4/2473e49f6bb472a37bfa0945f46bd0d5d936485115188ce1d1e59cdb115414fd.png'),
(8, 'Water', 'https://static.tcgcollector.com/content/images/7c/a9/6a/7ca96a62df84e3e055abf020dceec4f5c94ad9a988a53924c7bc3d234d4300ac.png'),
(9, 'Metal', 'https://static.tcgcollector.com/content/images/b0/30/b4/b030b429fb57782c40bacaab1eb4e724bb37df7e7de908768483b29db1de5a04.png'),
(10, 'Grass', 'https://static.tcgcollector.com/content/images/90/d7/49/90d74923dfb481342fb5cb6c78e5fc6f6a8992cbd72a127d78af726c412a1bdc.png'),
(11, 'Darkness', 'https://static.tcgcollector.com/content/images/2f/ba/6d/2fba6dc107035a268ab62384c736f7a96cdffd1080d0b2126917e074487c958b.png'),
(12, 'Fairy', 'https://static.tcgcollector.com/content/images/b4/4a/ee/b44aeec9123f7cd83e0bf93d72be2dc2cacd1671de571d87d2ccf665124aa829.png'),
(13, 'Dragon', 'https://static.tcgcollector.com/content/images/73/9f/ff/739fff897f789c085e47b79c223a66045a2bacf6340ae3ab347a7153c2406032.png');

-- --------------------------------------------------------

--
-- Table structure for table `type_card`
--

CREATE TABLE `type_card` (
  `type_card_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `type_card`
--

INSERT INTO `type_card` (`type_card_id`, `type_id`, `card_id`) VALUES
(4, 3, 16),
(5, 4, 17),
(6, 7, 18),
(7, 4, 19),
(8, 8, 20),
(9, 8, 21),
(10, 9, 22),
(11, 10, 23),
(12, 3, 24),
(13, 7, 25),
(14, 8, 26),
(15, 6, 27),
(16, 8, 28),
(17, 8, 29),
(18, 10, 30),
(19, 4, 31),
(20, 7, 32),
(21, 4, 33),
(22, 5, 26),
(23, 9, 35),
(24, 7, 36),
(25, 6, 37),
(26, 5, 34),
(27, 8, 38),
(28, 3, 39),
(29, 5, 40),
(30, 6, 41),
(31, 7, 47),
(32, 8, 48),
(33, 5, 49),
(34, 3, 50),
(35, 3, 51),
(36, 13, 57),
(37, 13, 60),
(38, 12, 61),
(39, 12, 58),
(40, 11, 59),
(41, 10, 63),
(42, 11, 62),
(43, 10, 64),
(44, 11, 64),
(45, 7, 65),
(46, 10, 65),
(47, 7, 66),
(48, 8, 66),
(49, 4, 67),
(50, 10, 67),
(51, 12, 68),
(52, 8, 68);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(15) NOT NULL,
  `avatar_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `email_address`, `password_hash`, `display_name`, `avatar_url`) VALUES
(22, 'jbusch@qub.ac.uk', '$2b$05$kRTPS8CsXw8kvQ61NnJPZuWiNZfI5BU/dwcHH/7wdkCfT/d.b40T6', 'jbusch', 'https://ui-avatars.com/api/?name=jbusch'),
(23, 'nanderson@qub.ac.uk', '$2b$05$6sJJIPHyf7ADXlVyfUbSl.kT2OVL/qezZCFSAt7QKAv6xawtkqloy', 'nanderson', 'https://ui-avatars.com/api/?name=nanderson'),
(24, 'csmith@qub.ac.uk', '$2b$05$yrAsvR0yyFFlSUwGduTPTumIGW6qfHrpjR6Day6ExVYToK166oWgq', 'csmith', 'https://ui-avatars.com/api/?name=csmith'),
(25, 'amcgowan@qub.ac.uk', '$2b$05$0TtBXmFu/sgbN9GAXIhcOelqMyoPRJGSFz460hkcq9TUphIzUpigS', 'amcgowan', 'https://ui-avatars.com/api/?name=amcgowan'),
(26, 'lgalway@qub.ac.uk', '$2b$05$uF/WGlO38tAtIu5AjKwFC.BKnI3cl.lmyyMm2vwst4F6.Ej.fP336', 'lgalway', 'https://ui-avatars.com/api/?name=lgalway'),
(27, 'admin@admin.com', '$2b$05$x7q2EWd4ip7Zqpb7WYhua..jZ3cqsCArqsrzyPb2cIykc1NOkTq.q', 'admin', 'https://ui-avatars.com/api/?name=admin');

-- --------------------------------------------------------

--
-- Table structure for table `weakness_card`
--

CREATE TABLE `weakness_card` (
  `weakness_card_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `multiplier` varchar(3) NOT NULL,
  `card_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `weakness_card`
--

INSERT INTO `weakness_card` (`weakness_card_id`, `type_id`, `multiplier`, `card_id`) VALUES
(4, 3, 'x2', 16),
(5, 6, 'x2', 17),
(6, 8, 'x2', 18),
(7, 6, 'x2', 19),
(8, 4, 'x2', 20),
(9, 4, '+20', 21),
(10, 3, '+20', 22),
(11, 7, '+10', 23),
(12, 11, 'x2', 24),
(13, 8, '2', 25),
(14, 4, 'x2', 26),
(15, 3, 'x2', 27),
(16, 9, 'x2', 29),
(17, 7, 'x2', 30),
(18, 6, 'x2', 31),
(19, 6, 'x2', 33),
(20, 8, 'x2', 32),
(21, 3, 'x2', 34),
(22, 7, 'x2', 35),
(23, 8, 'x2', 36),
(24, 10, 'x2', 37),
(25, 9, '+40', 38),
(26, 3, '+20', 39),
(27, 6, 'x2', 40),
(28, 8, '+20', 41),
(29, 8, 'x2', 47),
(30, 4, 'x2', 48),
(31, 6, 'x2', 49),
(32, 3, 'x2', 50),
(33, 3, 'x2', 51),
(34, 12, 'x2', 57),
(35, 9, 'x2', 58),
(36, 6, 'x2', 59),
(37, 12, 'x2', 60),
(38, 9, 'x2', 61),
(39, 6, '1', 62),
(40, 7, '1', 63),
(41, 7, 'x2', 64),
(42, 7, 'x2', 65),
(43, 8, 'x2', 66),
(44, 6, 'x2', 67),
(45, 9, 'x2', 68);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ability`
--
ALTER TABLE `ability`
  ADD PRIMARY KEY (`ability_id`),
  ADD KEY `FK_ABILITY_ABILITY_VARIANT_ID` (`ability_variant_id`),
  ADD KEY `FK_CARD_CARD_ID_EIGHT` (`card_id`);

--
-- Indexes for table `ability_variant`
--
ALTER TABLE `ability_variant`
  ADD PRIMARY KEY (`ability_variant_id`);

--
-- Indexes for table `api_user`
--
ALTER TABLE `api_user`
  ADD PRIMARY KEY (`api_user_id`);

--
-- Indexes for table `attack`
--
ALTER TABLE `attack`
  ADD PRIMARY KEY (`attack_id`),
  ADD KEY `FK_CARD_CARD_ID_SEVEN` (`card_id`);

--
-- Indexes for table `attack_type`
--
ALTER TABLE `attack_type`
  ADD PRIMARY KEY (`attack_type_id`),
  ADD KEY `FK_ATTACK_ATTACK_ID_ONE` (`attack_id`),
  ADD KEY `FK_TYPE_TYPE_ID_ONE` (`type_id`);

--
-- Indexes for table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `FK_STAGE_STAGE_ID` (`stage_id`),
  ADD KEY `FK_ILLUSTRATOR_ILLUSTRATOR_ID` (`illustrator_id`),
  ADD KEY `FK_CARD_CARD_ID_TWO` (`evolve_from`),
  ADD KEY `FK_EXPANSION_EXPANSION_ID_TWO` (`expansion_id`),
  ADD KEY `FK_RARITY_RARITY_ID` (`rarity_id`);

--
-- Indexes for table `card_like`
--
ALTER TABLE `card_like`
  ADD PRIMARY KEY (`card_like_id`),
  ADD UNIQUE KEY `card_id` (`card_id`,`user_id`),
  ADD KEY `FK_USER_USER_ID` (`user_id`),
  ADD KEY `FK_CARD_CARD_ID_THREE` (`card_id`);

--
-- Indexes for table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`collection_id`),
  ADD KEY `FK_USER_USER_ID_FOUR` (`user_id`);

--
-- Indexes for table `collection_card`
--
ALTER TABLE `collection_card`
  ADD PRIMARY KEY (`collection_card_id`),
  ADD KEY `FK_COLLECTION_COLLECTION_ID` (`collection_id`),
  ADD KEY `FK_CARD_CARD_ID_FOUR` (`card_id`);

--
-- Indexes for table `collection_comment`
--
ALTER TABLE `collection_comment`
  ADD PRIMARY KEY (`collection_comment_id`),
  ADD KEY `FK_COLLECTION_COLLECTION_ID_ONE` (`collection_id`),
  ADD KEY `FK_USER_USER_ID_SIX` (`user_id`);

--
-- Indexes for table `collection_rating`
--
ALTER TABLE `collection_rating`
  ADD PRIMARY KEY (`collection_rating_id`),
  ADD KEY `FK_USER_USER_ID_TWO` (`user_id`),
  ADD KEY `FK_COLLECTION_COLLECTION_ID_TWO` (`collection_id`);

--
-- Indexes for table `expansion`
--
ALTER TABLE `expansion`
  ADD PRIMARY KEY (`expansion_id`);

--
-- Indexes for table `illustrator`
--
ALTER TABLE `illustrator`
  ADD PRIMARY KEY (`illustrator_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `FK_USER_USER_ID_EIGHT` (`sender_id`),
  ADD KEY `FK_USER_USER_ID_SEVEN` (`recipient_id`),
  ADD KEY `FK_CARD_CARD_ID_ONE` (`card_id`);

--
-- Indexes for table `rarity`
--
ALTER TABLE `rarity`
  ADD PRIMARY KEY (`rarity_id`);

--
-- Indexes for table `stage`
--
ALTER TABLE `stage`
  ADD PRIMARY KEY (`stage_id`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `type_card`
--
ALTER TABLE `type_card`
  ADD PRIMARY KEY (`type_card_id`),
  ADD KEY `FK_TYPE_TYPE_ID` (`type_id`),
  ADD KEY `FK_CARD_CARD_ID_FIVE` (`card_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `weakness_card`
--
ALTER TABLE `weakness_card`
  ADD PRIMARY KEY (`weakness_card_id`),
  ADD KEY `FK_TYPE_TYPE_ID_TWO` (`type_id`),
  ADD KEY `FK_CARD_CARD_ID_SIX` (`card_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ability`
--
ALTER TABLE `ability`
  MODIFY `ability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ability_variant`
--
ALTER TABLE `ability_variant`
  MODIFY `ability_variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `api_user`
--
ALTER TABLE `api_user`
  MODIFY `api_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `attack`
--
ALTER TABLE `attack`
  MODIFY `attack_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `attack_type`
--
ALTER TABLE `attack_type`
  MODIFY `attack_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `card`
--
ALTER TABLE `card`
  MODIFY `card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `card_like`
--
ALTER TABLE `card_like`
  MODIFY `card_like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `collection`
--
ALTER TABLE `collection`
  MODIFY `collection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `collection_card`
--
ALTER TABLE `collection_card`
  MODIFY `collection_card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `collection_comment`
--
ALTER TABLE `collection_comment`
  MODIFY `collection_comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `collection_rating`
--
ALTER TABLE `collection_rating`
  MODIFY `collection_rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `expansion`
--
ALTER TABLE `expansion`
  MODIFY `expansion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `illustrator`
--
ALTER TABLE `illustrator`
  MODIFY `illustrator_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `rarity`
--
ALTER TABLE `rarity`
  MODIFY `rarity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stage`
--
ALTER TABLE `stage`
  MODIFY `stage_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `type_card`
--
ALTER TABLE `type_card`
  MODIFY `type_card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `weakness_card`
--
ALTER TABLE `weakness_card`
  MODIFY `weakness_card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ability`
--
ALTER TABLE `ability`
  ADD CONSTRAINT `FK_ABILITY_ABILITY_VARIANT_ID` FOREIGN KEY (`ability_variant_id`) REFERENCES `ability_variant` (`ability_variant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_CARD_CARD_ID_EIGHT` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE;

--
-- Constraints for table `attack`
--
ALTER TABLE `attack`
  ADD CONSTRAINT `FK_CARD_CARD_ID_SEVEN` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`);

--
-- Constraints for table `attack_type`
--
ALTER TABLE `attack_type`
  ADD CONSTRAINT `FK_ATTACK_ATTACK_ID_ONE` FOREIGN KEY (`attack_id`) REFERENCES `attack` (`attack_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_TYPE_TYPE_ID_ONE` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`) ON DELETE CASCADE;

--
-- Constraints for table `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `FK_EXPANSION_EXPANSION_ID_TWO` FOREIGN KEY (`expansion_id`) REFERENCES `expansion` (`expansion_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_ILLUSTRATOR_ILLUSTRATOR_ID` FOREIGN KEY (`illustrator_id`) REFERENCES `illustrator` (`illustrator_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_RARITY_RARITY_ID` FOREIGN KEY (`rarity_id`) REFERENCES `rarity` (`rarity_id`),
  ADD CONSTRAINT `FK_STAGE_STAGE_ID` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`) ON DELETE CASCADE;

--
-- Constraints for table `card_like`
--
ALTER TABLE `card_like`
  ADD CONSTRAINT `FK_CARD_CARD_ID_THREE` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_USER_USER_ID` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `collection`
--
ALTER TABLE `collection`
  ADD CONSTRAINT `FK_USER_USER_ID_FOUR` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `collection_card`
--
ALTER TABLE `collection_card`
  ADD CONSTRAINT `FK_CARD_CARD_ID_FOUR` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_COLLECTION_COLLECTION_ID` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`) ON DELETE CASCADE;

--
-- Constraints for table `collection_comment`
--
ALTER TABLE `collection_comment`
  ADD CONSTRAINT `FK_COLLECTION_COLLECTION_ID_ONE` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_USER_USER_ID_SIX` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `collection_rating`
--
ALTER TABLE `collection_rating`
  ADD CONSTRAINT `FK_COLLECTION_COLLECTION_ID_TWO` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_USER_USER_ID_TWO` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `FK_CARD_CARD_ID_ONE` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_USER_USER_ID_EIGHT` FOREIGN KEY (`sender_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_USER_USER_ID_SEVEN` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `type_card`
--
ALTER TABLE `type_card`
  ADD CONSTRAINT `FK_CARD_CARD_ID_FIVE` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_TYPE_TYPE_ID` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`) ON DELETE CASCADE;

--
-- Constraints for table `weakness_card`
--
ALTER TABLE `weakness_card`
  ADD CONSTRAINT `FK_CARD_CARD_ID_SIX` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_TYPE_TYPE_ID_TWO` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
