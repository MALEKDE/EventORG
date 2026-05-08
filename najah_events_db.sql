-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2026 at 12:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `najah_events_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `clubs`
--

CREATE TABLE `clubs` (
  `club_id` int(11) NOT NULL,
  `club_name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `icon` varchar(20) DEFAULT NULL,
  `color` varchar(80) DEFAULT NULL,
  `members_count` int(11) NOT NULL DEFAULT 0,
  `events_count` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `leader_user_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clubs`
--

INSERT INTO `clubs` (`club_id`, `club_name`, `category`, `icon`, `color`, `members_count`, `events_count`, `image_url`, `description`, `leader_user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Computer Science Club', 'Technology', '💻', 'rgba(139,92,246,0.2)', 143, 8, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80', 'Fostering innovation and technical skills through workshops, hackathons, and coding challenges.', 3, 'active', '2026-05-07 15:22:37', '2026-05-08 16:55:21'),
(2, 'Engineering Innovation Club', 'Engineering', '⚙️', 'rgba(201,168,76,0.2)', 98, 5, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', 'Bridging theoretical knowledge with real-world applications through hands-on engineering projects.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(3, 'Cultural Heritage Society', 'Culture', '🏺', 'rgba(244,114,182,0.2)', 215, 12, 'https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?w=600&q=80', 'Celebrating and preserving Palestinian and Arab cultural heritage through arts, exhibitions, and events.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(4, 'Business & Entrepreneurship Club', 'Business', '📈', 'rgba(52,211,153,0.2)', 176, 9, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80', 'Empowering student entrepreneurs with mentorship, pitch competitions, and startup resources.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(5, 'Environmental Action Group', 'Environment', '🌿', 'rgba(52,211,153,0.15)', 87, 6, 'https://images.unsplash.com/photo-1569163139500-9b7e13aebbdb?w=600&q=80', 'Driving sustainability initiatives and environmental awareness on campus and beyond.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(6, 'Photography & Media Club', 'Arts', '📷', 'rgba(251,191,36,0.15)', 63, 4, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', 'Exploring visual storytelling through photography, videography, and digital media creation.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(7, 'Medical Students Society', 'Health', '⚕️', 'rgba(248,113,113,0.15)', 194, 7, 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80', 'Supporting medical students with study groups, clinical skill workshops, and community health drives.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(8, 'Chess & Strategy Club', 'Sports', '♟️', 'rgba(139,92,246,0.15)', 45, 3, 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=600&q=80', 'Sharpening minds through chess tournaments, strategy games, and analytical thinking sessions.', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37');

-- --------------------------------------------------------

--
-- Table structure for table `club_join_requests`
--

CREATE TABLE `club_join_requests` (
  `request_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `club_join_requests`
--

INSERT INTO `club_join_requests` (`request_id`, `club_id`, `user_id`, `full_name`, `student_id`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 'Malek Sous', '12323344', 'Debug test request created from backend/clubs/debug_create_request.php', 'approved', 3, '2026-05-08 19:55:21', 'Approved by club.', '2026-05-08 16:52:55', '2026-05-08 16:55:21'),
(2, 1, 5, 'Malek Sous', '12323344', 'Debug test request created from backend/clubs/debug_create_request.php', 'rejected', 3, '2026-05-08 19:55:24', 'Rejected by club.', '2026-05-08 16:52:55', '2026-05-08 16:55:24');

-- --------------------------------------------------------

--
-- Table structure for table `club_members`
--

CREATE TABLE `club_members` (
  `member_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `member_role` enum('member','leader') NOT NULL DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `club_members`
--

INSERT INTO `club_members` (`member_id`, `club_id`, `user_id`, `member_role`, `joined_at`) VALUES
(1, 1, 5, 'member', '2026-05-08 16:55:21');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `message_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(180) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `developers`
--

CREATE TABLE `developers` (
  `developer_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `role_title` varchar(120) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `developers`
--

INSERT INTO `developers` (`developer_id`, `full_name`, `role_title`, `image_url`, `display_order`) VALUES
(1, 'Yamen AbuShehade', 'Lead Developer', 'assets/images/team/yamen.jpg', 1),
(2, 'Malek Sous', 'Lead Developer', 'assets/images/team/malek.jpg', 2);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `title` varchar(180) NOT NULL,
  `category` enum('expo','conference','workshop','festival','sports') NOT NULL,
  `event_date` date NOT NULL,
  `venue_id` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  `registered_count` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `organizer_club_id` int(11) DEFAULT NULL,
  `status` enum('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `title`, `category`, `event_date`, `venue_id`, `capacity`, `registered_count`, `image_url`, `description`, `organizer_club_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Career & Internship Expo 2026', 'expo', '2026-04-12', 1, 500, 381, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', 'Connect with top companies, explore internships, and build your professional network.', 4, 'upcoming', '2026-05-07 15:22:37', '2026-05-08 16:42:26'),
(2, 'TechTalk Summit', 'conference', '2026-04-05', 2, 350, 341, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80', 'Leading minds in technology share insights on AI, cybersecurity, and the future of software.', 1, 'upcoming', '2026-05-07 15:22:37', '2026-05-08 14:00:43'),
(3, 'Projects Innovation Fair', 'workshop', '2026-05-01', 3, 300, 120, 'https://images.unsplash.com/photo-1558008258-3256797b43f3?w=600&q=80', 'Showcase your academic projects and innovations to faculty, industry, and peers.', 2, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(4, 'Spring Cultural Festival', 'festival', '2026-05-15', 4, 1200, 650, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80', 'Celebrate campus diversity with music, art, food, and cultural performances.', 3, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(5, 'Python & Data Science Workshop', 'workshop', '2026-04-18', 6, 40, 37, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80', 'Hands-on workshop covering Python, pandas, and data visualization techniques.', 1, 'upcoming', '2026-05-07 15:22:37', '2026-05-08 17:22:07'),
(6, 'Startup Pitch Competition', 'conference', '2026-04-25', 1, 200, 88, 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&q=80', 'Present your startup idea to a panel of investors and industry experts.', 4, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(7, 'Volleyball Championship', 'sports', '2026-05-08', 8, 400, 210, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80', 'Inter-faculty volleyball tournament. Root for your faculty team!', 8, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(8, 'Architecture Design Expo', 'expo', '2026-05-20', 2, 250, 95, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', 'Graduating architecture students present their semester projects and thesis work.', 2, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(9, 'Photography & Media Workshop', 'workshop', '2026-04-22', 5, 30, 28, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', 'Learn professional photography composition, lighting, and post-processing techniques.', 6, 'upcoming', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(12, 'test', 'expo', '2027-06-07', 4, 20, 1, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', 'dfdf\n\nOrganizer: dfss', NULL, 'cancelled', '2026-05-08 22:03:23', '2026-05-08 22:05:01');

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `registration_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `student_id_or_email` varchar(120) NOT NULL,
  `role_text` varchar(80) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`registration_id`, `event_id`, `user_id`, `full_name`, `student_id_or_email`, `role_text`, `notes`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 5, 'Malek Sous', '12323344', 'Student', NULL, 'confirmed', '2026-05-08 14:00:43', '2026-05-08 14:00:43'),
(2, 1, 5, 'Malek Sous', '12323344', 'Student', 'dd', 'confirmed', '2026-05-08 16:42:26', '2026-05-08 16:42:26'),
(3, 5, 5, 'Malek Sous', '12323344', 'Student', 'asas', 'confirmed', '2026-05-08 17:22:07', '2026-05-08 17:22:07'),
(4, 12, 5, 'Malek Sous', '12323344', 'Student', 'test join', 'confirmed', '2026-05-08 22:04:05', '2026-05-08 22:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 2, 'Booking Approved', 'Your booking NE-AABB1 has been approved.', 'success', 0, '2026-05-07 15:22:37'),
(2, 2, 'Event Reminder', 'Career Expo 2026 is coming soon.', 'info', 0, '2026-05-07 15:22:37'),
(3, 3, 'Booking Pending', 'Your booking NE-BBCC2 is waiting for admin review.', 'warning', 0, '2026-05-07 15:22:37'),
(4, 3, 'Booking Rejected', 'Your booking request NE-BBCC2 has been rejected.', 'warning', 0, '2026-05-08 14:35:50'),
(5, 4, 'Booking Rejected', 'Your booking request NE-DDEE4 has been rejected.', 'warning', 0, '2026-05-08 14:35:53'),
(6, 3, 'Booking Rejected', 'Your booking request NE-EEFF5 has been rejected.', 'warning', 0, '2026-05-08 14:35:55'),
(7, 5, 'Booking Request Submitted', 'Your booking request NE-B2C4409F is pending admin review.', 'warning', 0, '2026-05-08 14:46:28'),
(8, 5, 'Booking Approved', 'Your booking request NE-B2C4409F has been approved.', 'success', 0, '2026-05-08 14:47:04'),
(9, 5, 'Booking Request Submitted', 'Your booking request NE-3C245955 is pending admin review.', 'warning', 0, '2026-05-08 15:30:18'),
(10, 5, 'Booking Approved', 'Your booking request NE-3C245955 has been approved and published as an event.', 'success', 0, '2026-05-08 15:30:42'),
(11, 5, 'Club Request Approved', 'Your request to join Computer Science Club has been approved by the club.', 'success', 0, '2026-05-08 16:55:21'),
(12, 5, 'Club Request Rejected', 'Your request to join Computer Science Club was rejected. Reason: Rejected by club.', 'warning', 0, '2026-05-08 16:55:24'),
(13, 5, 'Booking Request Submitted', 'Your booking request NE-7977EF00 is pending admin review.', 'warning', 0, '2026-05-08 17:24:36'),
(14, 5, 'Booking Approved', 'Your booking request NE-7977EF00 has been approved and published as an event.', 'success', 0, '2026-05-08 17:25:15'),
(15, 5, 'Booking Request Submitted', 'Your booking request NE-9FE54014 is pending admin review.', 'warning', 0, '2026-05-08 22:03:02'),
(16, 5, 'Booking Approved', 'Your booking request NE-9FE54014 has been approved and published as an event.', 'success', 0, '2026-05-08 22:03:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','company','club','admin') NOT NULL DEFAULT 'student',
  `phone` varchar(30) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `organization_name` varchar(150) DEFAULT NULL,
  `status` enum('active','blocked') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `role`, `phone`, `student_id`, `organization_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Events Admin', 'admin@najah.edu', '$2y$12$/cozmcg1W6mjsh03wjxBY.nXOecGzHCW6PjV4lwp.RoPo1bWu0Bky', 'admin', '+970599000001', 'STAFF001', 'Najah Events Platform', 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(2, 'Ahmad Khalil', 'student@najah.edu', '$2y$12$vS18/Im1mmwCiwTEAJ.WD.K5RlndL9a/dHWCDYl85ZoNE09viAdhy', 'student', '+970599000002', '202011234', NULL, 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(3, 'Sana Haddad', 'club@najah.edu', '$2y$12$vS18/Im1mmwCiwTEAJ.WD.K5RlndL9a/dHWCDYl85ZoNE09viAdhy', 'club', '+970599000003', 'CLUB002', 'Computer Science Club', 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(4, 'TechCorp HR', 'hr@techcorp.com', '$2y$12$vS18/Im1mmwCiwTEAJ.WD.K5RlndL9a/dHWCDYl85ZoNE09viAdhy', 'company', '+970599000004', NULL, 'TechCorp', 'active', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(5, 'Malek Sous', 's12323344@stu.najah.edu', '$2y$10$IhWAKUeeMV09.1V.31CkAuNijvap4jxuZTGjF97dCV81i8Srdtusi', 'student', '+970568321871', '12323344', NULL, 'active', '2026-05-07 15:25:21', '2026-05-07 15:25:21');

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `venue_id` int(11) NOT NULL,
  `venue_name` varchar(150) NOT NULL,
  `building` varchar(150) DEFAULT NULL,
  `venue_type` enum('auditorium','hall','classroom','outdoor','lab') NOT NULL,
  `capacity` int(11) NOT NULL,
  `area` varchar(80) DEFAULT NULL,
  `status` enum('available','busy','maintenance') NOT NULL DEFAULT 'available',
  `image_url` varchar(500) DEFAULT NULL,
  `features` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`venue_id`, `venue_name`, `building`, `venue_type`, `capacity`, `area`, `status`, `image_url`, `features`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Main Auditorium', 'Main Campus', 'auditorium', 800, '1,200 m²', 'available', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', 'Stage,Sound System,Projector,Backstage,AC,Accessible', 'Ideal for large conferences, keynote talks, and official ceremonies.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(2, 'Engineering Hall', 'Engineering Faculty', 'hall', 350, '650 m²', 'busy', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', 'Projector,Wi-Fi,Sound System,Seating,Whiteboard', 'Great for tech talks, exhibitions, and mid-size community events.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(3, 'Expo Hall', 'Student Activities Center', 'hall', 600, '980 m²', 'available', 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80', 'Booths,Power Outlets,Wi-Fi,Open Space,AC', 'Best for expos with booths, companies, project fairs, and showcases.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(4, 'Outdoor Stage', 'Central Yard', 'outdoor', 1200, 'Open Area', 'available', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', 'Stage,Lighting,Outdoor Seating,Security,Generators', 'Perfect for festivals, graduation vibes, and large student gatherings.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(5, 'Workshop Room A', 'Library Building', 'classroom', 60, '110 m²', 'maintenance', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80', 'Whiteboard,Projector,Wi-Fi', 'Small workshops and training. Currently under maintenance.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(6, 'Computer Lab 2', 'IT Center', 'lab', 40, '95 m²', 'available', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', 'Computers,High-Speed Internet,Projector,AC,UPS', 'Hands-on sessions: coding workshops, demos, and hack activities.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(7, 'Faculty Seminar Room', 'Admin Building', 'classroom', 80, '150 m²', 'available', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', 'Smart Board,Video Conference,AC,Projector', 'Ideal for seminars, panels, and small conferences.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(8, 'Sports Complex Hall', 'Sports & Recreation', 'outdoor', 500, '2,000 m²', 'busy', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'Changing Rooms,Scoreboard,Bleachers,Security', 'Multi-sport complex for tournaments and athletic events.', '2026-05-07 15:22:37', '2026-05-07 15:22:37');

-- --------------------------------------------------------

--
-- Table structure for table `venue_booking_requests`
--

CREATE TABLE `venue_booking_requests` (
  `booking_id` int(11) NOT NULL,
  `ref_code` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `venue_id` int(11) NOT NULL,
  `event_name` varchar(180) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `expected_attendees` int(11) DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `event_description` text DEFAULT NULL,
  `organizer_name` varchar(120) NOT NULL,
  `organizer_email` varchar(150) NOT NULL,
  `organizer_phone` varchar(30) DEFAULT NULL,
  `organization_or_faculty` varchar(150) DEFAULT NULL,
  `organizer_role` enum('student','club_leader','faculty_member','company_representative','admin_staff') NOT NULL DEFAULT 'student',
  `req_av_equipment` tinyint(1) NOT NULL DEFAULT 0,
  `req_tables_chairs` tinyint(1) NOT NULL DEFAULT 0,
  `req_security` tinyint(1) NOT NULL DEFAULT 0,
  `req_catering_setup` tinyint(1) NOT NULL DEFAULT 0,
  `req_photography` tinyint(1) NOT NULL DEFAULT 0,
  `req_live_streaming` tinyint(1) NOT NULL DEFAULT 0,
  `additional_notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venue_booking_requests`
--

INSERT INTO `venue_booking_requests` (`booking_id`, `ref_code`, `user_id`, `venue_id`, `event_name`, `event_type`, `expected_attendees`, `event_date`, `start_time`, `end_time`, `event_description`, `organizer_name`, `organizer_email`, `organizer_phone`, `organization_or_faculty`, `organizer_role`, `req_av_equipment`, `req_tables_chairs`, `req_security`, `req_catering_setup`, `req_photography`, `req_live_streaming`, `additional_notes`, `status`, `reviewed_by`, `reviewed_at`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 'NE-AABB1', 2, 1, 'Career Expo 2026', 'Expo / Exhibition', 300, '2026-04-12', '09:00:00', '15:00:00', 'Career event reservation request.', 'Ahmad Khalil', 'ahmad@najah.edu', '+970599111111', 'Computer Science', 'student', 1, 1, 1, 0, 0, 0, 'Need entrance organization.', 'approved', 1, '2026-05-07 18:22:37', 'Approved.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(2, 'NE-BBCC2', 3, 6, 'Hackathon Night', 'Workshop', 40, '2026-04-20', '16:00:00', '22:00:00', 'Club hackathon in computer lab.', 'Sana Haddad', 'sana@najah.edu', '+970599222222', 'Computer Science Club', 'club_leader', 1, 0, 0, 0, 0, 0, 'Need stable internet.', 'rejected', 1, '2026-05-08 17:35:50', 'Rejected by admin.', '2026-05-07 15:22:37', '2026-05-08 14:35:50'),
(3, 'NE-CCDD3', 2, 5, 'Club Meeting', 'Other', 50, '2026-03-30', '12:00:00', '14:00:00', 'Small meeting.', 'Omar Salem', 'omar@najah.edu', '+970599333333', 'Students Group', 'student', 0, 1, 0, 0, 0, 0, NULL, 'rejected', 1, '2026-05-07 18:22:37', 'Venue under maintenance.', '2026-05-07 15:22:37', '2026-05-07 15:22:37'),
(4, 'NE-DDEE4', 4, 2, 'Tech Workshop', 'Workshop', 200, '2026-04-28', '10:00:00', '13:00:00', 'Company training session for students.', 'Rima Khalid', 'rima@techcorp.com', '+970599444444', 'TechCorp', 'company_representative', 1, 1, 0, 0, 0, 0, 'Company booth table required.', 'rejected', 1, '2026-05-08 17:35:53', 'Rejected by admin.', '2026-05-07 15:22:37', '2026-05-08 14:35:53'),
(5, 'NE-EEFF5', 3, 4, 'Spring Festival', 'Festival / Cultural', 600, '2026-05-15', '10:00:00', '18:00:00', 'Outdoor festival request.', 'Club Board', 'clubs@najah.edu', '+970599555555', 'Student Clubs', 'club_leader', 1, 1, 1, 0, 0, 0, 'Need outdoor stage setup.', 'rejected', 1, '2026-05-08 17:35:55', 'Rejected by admin.', '2026-05-07 15:22:37', '2026-05-08 14:35:55'),
(6, 'NE-B2C4409F', 5, 7, 'Yazeed Shaking it', 'Festival / Cultural', 80, '2026-05-08', '09:00:00', '17:00:00', 'yazeed butt is going to explode the event', 'Malek Sous', 's12323344@stu.najah.edu', '+970568321871', 'SATCO', 'student', 1, 1, 1, 1, 1, 1, 'PEACE OF SHIT', 'approved', 1, '2026-05-08 17:47:04', 'Approved by admin.', '2026-05-08 14:46:28', '2026-05-08 14:47:04'),
(7, 'NE-3C245955', 5, 3, 'sd', 'Expo / Exhibition', 2, '2026-04-16', '09:00:00', '17:00:00', 'sdd', 'Malek Sous', 's12323344@stu.najah.edu', '+970568321871', '', 'student', 1, 0, 0, 0, 0, 0, 'da', 'approved', 1, '2026-05-08 18:30:42', 'Approved by admin.', '2026-05-08 15:30:18', '2026-05-08 15:30:42'),
(8, 'NE-7977EF00', 5, 7, 'testing', 'Workshop', 80, '2026-05-17', '09:00:00', '17:00:00', 'join us', 'Malek Sous', 's12323344@stu.najah.edu', '+970568321871', 'DXFSXF', 'student', 1, 1, 1, 1, 1, 1, 'DFDFDF', 'approved', 1, '2026-05-08 20:25:15', 'Approved by admin.', '2026-05-08 17:24:36', '2026-05-08 17:25:15'),
(9, 'NE-9FE54014', 5, 4, 'test', 'Expo / Exhibition', 20, '2027-06-07', '09:00:00', '17:00:00', 'dfdf', 'Malek Sous', 's12323344@stu.najah.edu', '+970568321871', 'dfss', 'student', 1, 0, 0, 0, 0, 0, 'dfdf', 'approved', 1, '2026-05-09 01:03:23', 'Approved by admin.', '2026-05-08 22:03:02', '2026-05-08 22:03:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clubs`
--
ALTER TABLE `clubs`
  ADD PRIMARY KEY (`club_id`),
  ADD KEY `fk_club_leader` (`leader_user_id`);

--
-- Indexes for table `club_join_requests`
--
ALTER TABLE `club_join_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `fk_join_club` (`club_id`),
  ADD KEY `fk_join_user` (`user_id`),
  ADD KEY `fk_join_reviewer` (`reviewed_by`),
  ADD KEY `idx_club_requests_status` (`status`);

--
-- Indexes for table `club_members`
--
ALTER TABLE `club_members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `uq_club_user` (`club_id`,`user_id`),
  ADD KEY `fk_club_member_user` (`user_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `developers`
--
ALTER TABLE `developers`
  ADD PRIMARY KEY (`developer_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `fk_event_venue` (`venue_id`),
  ADD KEY `fk_event_club` (`organizer_club_id`),
  ADD KEY `idx_events_category` (`category`),
  ADD KEY `idx_events_date` (`event_date`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`registration_id`),
  ADD UNIQUE KEY `uq_user_event` (`event_id`,`user_id`),
  ADD KEY `fk_registration_user` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notification_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`venue_id`);

--
-- Indexes for table `venue_booking_requests`
--
ALTER TABLE `venue_booking_requests`
  ADD PRIMARY KEY (`booking_id`),
  ADD UNIQUE KEY `ref_code` (`ref_code`),
  ADD KEY `fk_booking_venue` (`venue_id`),
  ADD KEY `fk_booking_reviewer` (`reviewed_by`),
  ADD KEY `idx_bookings_status` (`status`),
  ADD KEY `idx_bookings_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clubs`
--
ALTER TABLE `clubs`
  MODIFY `club_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `club_join_requests`
--
ALTER TABLE `club_join_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `club_members`
--
ALTER TABLE `club_members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `developers`
--
ALTER TABLE `developers`
  MODIFY `developer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `registration_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `venues`
--
ALTER TABLE `venues`
  MODIFY `venue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `venue_booking_requests`
--
ALTER TABLE `venue_booking_requests`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clubs`
--
ALTER TABLE `clubs`
  ADD CONSTRAINT `fk_club_leader` FOREIGN KEY (`leader_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `club_join_requests`
--
ALTER TABLE `club_join_requests`
  ADD CONSTRAINT `fk_join_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`club_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_join_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_join_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `club_members`
--
ALTER TABLE `club_members`
  ADD CONSTRAINT `fk_club_member_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`club_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_club_member_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_event_club` FOREIGN KEY (`organizer_club_id`) REFERENCES `clubs` (`club_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_event_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`venue_id`) ON UPDATE CASCADE;

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `fk_registration_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_registration_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `venue_booking_requests`
--
ALTER TABLE `venue_booking_requests`
  ADD CONSTRAINT `fk_booking_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_booking_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`venue_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
