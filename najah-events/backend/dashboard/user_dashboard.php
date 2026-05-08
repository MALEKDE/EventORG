<?php
require_once '../config/db.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'GET request required', [], 405);
}

$user = require_login();

if ($user['role'] === 'admin') {
    json_response(false, 'Admins should use the admin panel', [
        'redirect' => 'admin.html'
    ], 403);
}

$userId = (int)$user['user_id'];

try {
    // My venue/company booking requests
    $bookingStmt = $pdo->prepare('
        SELECT
            b.booking_id,
            b.ref_code,
            b.event_name,
            b.event_type,
            b.expected_attendees,
            b.event_date,
            b.start_time,
            b.end_time,
            b.event_description,
            b.organizer_name,
            b.organizer_email,
            b.organizer_phone,
            b.organization_or_faculty,
            b.organizer_role,
            b.additional_notes,
            b.status,
            b.admin_note,
            b.reviewed_at,
            b.created_at,
            v.venue_id,
            v.venue_name,
            v.building,
            v.capacity,
            v.image_url
        FROM venue_booking_requests b
        INNER JOIN venues v ON b.venue_id = v.venue_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ');
    $bookingStmt->execute([$userId]);
    $bookings = $bookingStmt->fetchAll();

    foreach ($bookings as &$booking) {
        $booking['booking_id'] = (int)$booking['booking_id'];
        $booking['venue_id'] = (int)$booking['venue_id'];
        $booking['expected_attendees'] = $booking['expected_attendees'] !== null ? (int)$booking['expected_attendees'] : null;
        $booking['capacity'] = (int)$booking['capacity'];
    }

    // My confirmed event registrations
    $registrationStmt = $pdo->prepare('
        SELECT
            er.registration_id,
            er.event_id,
            er.status,
            er.created_at,
            e.title AS event_title,
            e.category,
            e.event_date,
            e.image_url,
            v.venue_name,
            v.building
        FROM event_registrations er
        INNER JOIN events e ON er.event_id = e.event_id
        INNER JOIN venues v ON e.venue_id = v.venue_id
        WHERE er.user_id = ?
        ORDER BY e.event_date ASC, er.created_at DESC
    ');
    $registrationStmt->execute([$userId]);
    $registrations = $registrationStmt->fetchAll();

    foreach ($registrations as &$registration) {
        $registration['registration_id'] = (int)$registration['registration_id'];
        $registration['event_id'] = (int)$registration['event_id'];
    }

    // Notifications for this user
    $notifStmt = $pdo->prepare('
        SELECT
            notification_id,
            title,
            message,
            type,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ');
    $notifStmt->execute([$userId]);
    $notifications = $notifStmt->fetchAll();

    foreach ($notifications as &$notification) {
        $notification['notification_id'] = (int)$notification['notification_id'];
        $notification['is_read'] = (bool)$notification['is_read'];
    }

    // Upcoming events user has not registered for yet
    $suggestedStmt = $pdo->prepare('
        SELECT
            e.event_id,
            e.title,
            e.category,
            e.event_date,
            e.capacity,
            e.registered_count,
            e.image_url,
            v.venue_name
        FROM events e
        INNER JOIN venues v ON e.venue_id = v.venue_id
        LEFT JOIN event_registrations er
            ON er.event_id = e.event_id
            AND er.user_id = ?
            AND er.status = "confirmed"
        WHERE e.status = "upcoming"
          AND er.registration_id IS NULL
        ORDER BY e.event_date ASC
        LIMIT 3
    ');
    $suggestedStmt->execute([$userId]);
    $suggestedEvents = $suggestedStmt->fetchAll();

    foreach ($suggestedEvents as &$event) {
        $event['event_id'] = (int)$event['event_id'];
        $event['capacity'] = (int)$event['capacity'];
        $event['registered_count'] = (int)$event['registered_count'];
        $event['available_spots'] = max(0, $event['capacity'] - $event['registered_count']);
    }

    // My club memberships
    $clubMemberStmt = $pdo->prepare('
        SELECT
            cm.member_id,
            cm.club_id,
            cm.member_role,
            cm.joined_at,
            c.club_name,
            c.category,
            c.icon,
            c.image_url
        FROM club_members cm
        INNER JOIN clubs c ON cm.club_id = c.club_id
        WHERE cm.user_id = ?
        ORDER BY cm.joined_at DESC
    ');
    $clubMemberStmt->execute([$userId]);
    $clubMemberships = $clubMemberStmt->fetchAll();

    foreach ($clubMemberships as &$clubMembership) {
        $clubMembership['member_id'] = (int)$clubMembership['member_id'];
        $clubMembership['club_id'] = (int)$clubMembership['club_id'];
    }

    // My latest club join requests
    $clubRequestStmt = $pdo->prepare('
        SELECT
            r.request_id,
            r.club_id,
            r.full_name,
            r.student_id,
            r.reason,
            r.status,
            r.reviewed_at,
            r.admin_note,
            r.created_at,
            c.club_name,
            c.category,
            c.icon,
            c.image_url
        FROM club_join_requests r
        INNER JOIN clubs c ON r.club_id = c.club_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    ');
    $clubRequestStmt->execute([$userId]);
    $clubRequests = $clubRequestStmt->fetchAll();

    foreach ($clubRequests as &$clubRequest) {
        $clubRequest['request_id'] = (int)$clubRequest['request_id'];
        $clubRequest['club_id'] = (int)$clubRequest['club_id'];
    }

    // If this is a club account, load the club that this account manages.
    // Club join requests are reviewed by the club leader, not by the admin panel.
    $managedClub = null;
    $managedClubRequests = [];
    $managedClubMembers = [];

    if ($user['role'] === 'club') {
        $managedClubStmt = $pdo->prepare('
            SELECT
                club_id,
                club_name,
                category,
                icon,
                color,
                members_count,
                events_count,
                image_url,
                description,
                status
            FROM clubs
            WHERE leader_user_id = ?
            LIMIT 1
        ');
        $managedClubStmt->execute([$userId]);
        $managedClub = $managedClubStmt->fetch();

        if ($managedClub) {
            $managedClub['club_id'] = (int)$managedClub['club_id'];
            $managedClub['members_count'] = (int)$managedClub['members_count'];
            $managedClub['events_count'] = (int)$managedClub['events_count'];

            $managedRequestsStmt = $pdo->prepare('
                SELECT
                    r.request_id,
                    r.club_id,
                    r.user_id,
                    r.full_name,
                    r.student_id,
                    r.reason,
                    r.status,
                    r.reviewed_at,
                    r.admin_note,
                    r.created_at,
                    u.email AS user_email,
                    u.phone AS user_phone
                FROM club_join_requests r
                INNER JOIN users u ON r.user_id = u.user_id
                WHERE r.club_id = ?
                ORDER BY
                    CASE r.status
                        WHEN "pending" THEN 1
                        WHEN "approved" THEN 2
                        WHEN "rejected" THEN 3
                        ELSE 4
                    END,
                    r.created_at DESC
            ');
            $managedRequestsStmt->execute([$managedClub['club_id']]);
            $managedClubRequests = $managedRequestsStmt->fetchAll();

            foreach ($managedClubRequests as &$managedClubRequest) {
                $managedClubRequest['request_id'] = (int)$managedClubRequest['request_id'];
                $managedClubRequest['club_id'] = (int)$managedClubRequest['club_id'];
                $managedClubRequest['user_id'] = (int)$managedClubRequest['user_id'];
            }

            $managedMembersStmt = $pdo->prepare('
                SELECT
                    cm.member_id,
                    cm.user_id,
                    cm.member_role,
                    cm.joined_at,
                    u.full_name,
                    u.email,
                    u.student_id,
                    u.phone
                FROM club_members cm
                INNER JOIN users u ON cm.user_id = u.user_id
                WHERE cm.club_id = ?
                ORDER BY cm.joined_at DESC
            ');
            $managedMembersStmt->execute([$managedClub['club_id']]);
            $managedClubMembers = $managedMembersStmt->fetchAll();

            foreach ($managedClubMembers as &$managedClubMember) {
                $managedClubMember['member_id'] = (int)$managedClubMember['member_id'];
                $managedClubMember['user_id'] = (int)$managedClubMember['user_id'];
            }
        }
    }

    $approved = 0;
    $pending = 0;
    $rejected = 0;

    foreach ($bookings as $booking) {
        if ($booking['status'] === 'approved') $approved++;
        if ($booking['status'] === 'pending') $pending++;
        if ($booking['status'] === 'rejected') $rejected++;
    }

    $pendingClubRequests = 0;
    foreach ($clubRequests as $clubRequest) {
        if ($clubRequest['status'] === 'pending') $pendingClubRequests++;
    }

    $managedPendingClubRequests = 0;
    foreach ($managedClubRequests as $managedClubRequest) {
        if ($managedClubRequest['status'] === 'pending') $managedPendingClubRequests++;
    }

    $unread = 0;
    foreach ($notifications as $notification) {
        if (!$notification['is_read']) $unread++;
    }

    json_response(true, 'Dashboard loaded successfully', [
        'user' => $user,
        'stats' => [
            'total_bookings' => count($bookings),
            'approved_bookings' => $approved,
            'pending_bookings' => $pending,
            'rejected_bookings' => $rejected,
            'events_joined' => count($registrations),
            'clubs_joined' => count($clubMemberships),
            'pending_club_requests' => $pendingClubRequests,
            'managed_club_pending_requests' => $managedPendingClubRequests,
            'managed_club_members' => count($managedClubMembers),
            'unread_notifications' => $unread
        ],
        'bookings' => $bookings,
        'registrations' => $registrations,
        'club_memberships' => $clubMemberships,
        'club_requests' => $clubRequests,
        'managed_club' => $managedClub,
        'managed_club_requests' => $managedClubRequests,
        'managed_club_members' => $managedClubMembers,
        'notifications' => $notifications,
        'suggested_events' => $suggestedEvents
    ]);

} catch (PDOException $e) {
    json_response(false, 'Failed to load dashboard data', [], 500);
}
?>
