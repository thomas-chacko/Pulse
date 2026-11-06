// Calendar Controller - Business logic and request handling

import * as CalendarModel from './calendarModel.js';

/**
 * Get today's events
 */
export async function getTodayEvents(req, res) {
  try {
    const events = await CalendarModel.getTodayEvents();
    
    res.json({
      success: true,
      events,
      count: events.length,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error getting today\'s events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get today\'s events'
    });
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(req, res) {
  try {
    const { limit = 10 } = req.query;
    
    const events = await CalendarModel.getUpcomingEvents(parseInt(limit));
    
    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upcoming events'
    });
  }
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(req, res) {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }
    
    const events = await CalendarModel.getEventsByDateRange(
      startDate,
      endDate,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      events,
      count: events.length,
      range: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error getting events by date range:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get events'
    });
  }
}

/**
 * Search events
 */
export async function searchEvents(req, res) {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }
    
    const events = await CalendarModel.searchEvents(q.trim());
    
    res.json({
      success: true,
      events,
      count: events.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search events'
    });
  }
}

/**
 * Check availability
 */
export async function checkAvailability(req, res) {
  try {
    const { startTime, endTime } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime and endTime are required'
      });
    }
    
    const availability = await CalendarModel.checkAvailability(startTime, endTime);
    
    res.json({
      success: true,
      ...availability,
      timeSlot: { startTime, endTime }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
}
