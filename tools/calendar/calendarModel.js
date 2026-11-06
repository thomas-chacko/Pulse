// Calendar Model - Google Calendar API integration (read-only)

import { google } from 'googleapis';

/**
 * Get authenticated Google Calendar client
 */
function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Get today's events
 */
export async function getTodayEvents() {
  const calendar = getCalendarClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items.map(event => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || []
  }));
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(maxResults = 10) {
  const calendar = getCalendarClient();

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items.map(event => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || []
  }));
}

/**
 * Get events for a specific date range
 */
export async function getEventsByDateRange(startDate, endDate, maxResults = 50) {
  const calendar = getCalendarClient();

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(startDate).toISOString(),
    timeMax: new Date(endDate).toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items.map(event => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || []
  }));
}

/**
 * Search events by keyword
 */
export async function searchEvents(query) {
  const calendar = getCalendarClient();

  const response = await calendar.events.list({
    calendarId: 'primary',
    q: query,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  });

  return response.data.items.map(event => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    description: event.description,
    attendees: event.attendees?.map(a => a.email) || []
  }));
}

/**
 * Check if a time slot is free
 */
export async function checkAvailability(startTime, endTime) {
  const calendar = getCalendarClient();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(startTime).toISOString(),
      timeMax: new Date(endTime).toISOString(),
      items: [{ id: 'primary' }],
    },
  });

  const busy = response.data.calendars.primary.busy || [];
  
  return {
    available: busy.length === 0,
    busySlots: busy.map(slot => ({
      start: slot.start,
      end: slot.end
    }))
  };
}
