// Calendar Routes - Read-only Google Calendar endpoints

import express from 'express';
import * as CalendarController from './calendarController.js';

const router = express.Router();

/**
 * GET /api/tools/calendar/today
 * Get today's events
 */
router.get('/today', CalendarController.getTodayEvents);

/**
 * GET /api/tools/calendar/upcoming?limit=10
 * Get upcoming events
 */
router.get('/upcoming', CalendarController.getUpcomingEvents);

/**
 * GET /api/tools/calendar/events?startDate=2024-11-01&endDate=2024-11-30
 * Get events by date range
 */
router.get('/events', CalendarController.getEventsByDateRange);

/**
 * GET /api/tools/calendar/search?q=meeting
 * Search events by keyword
 */
router.get('/search', CalendarController.searchEvents);

/**
 * GET /api/tools/calendar/availability?startTime=2024-11-06T10:00:00Z&endTime=2024-11-06T11:00:00Z
 * Check if a time slot is available
 */
router.get('/availability', CalendarController.checkAvailability);

export default router;
