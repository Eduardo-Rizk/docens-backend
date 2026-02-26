/**
 * Shared constants for public browse endpoints.
 *
 * CLASS_EVENT_PUBLIC_SELECT: Prisma `select` object that includes all ClassEvent
 * fields EXCEPT `meetingUrl`. Used by every browse service that queries ClassEvent
 * data to prevent accidental meetingUrl leaks in public responses.
 *
 * Decision: meetingUrl must not appear in any browse endpoint response — it is
 * excluded at the query level (Prisma `select`) so the field never enters
 * application memory. See CONTEXT.md locked decisions.
 *
 * BROWSE_PUBLICATION_FILTER: Prisma `where` filter that restricts browse queries
 * to PUBLISHED and FINISHED events only. DRAFT events are never visible in
 * public browse. FINISHED events appear so visitors can see past classes.
 */

import { Prisma } from '@prisma/client';

/**
 * Prisma `select` for ClassEvent in all browse/public endpoints.
 * Intentionally excludes `meetingUrl` — never expose in browse responses.
 */
export const CLASS_EVENT_PUBLIC_SELECT = {
  id: true,
  title: true,
  description: true,
  teacherProfileId: true,
  subjectId: true,
  institutionId: true,
  startsAt: true,
  durationMin: true,
  priceCents: true,
  capacity: true,
  soldSeats: true,
  publicationStatus: true,
  meetingStatus: true,
  createdAt: true,
  // meetingUrl: intentionally EXCLUDED — never expose in browse endpoints
} satisfies Prisma.ClassEventSelect;

/**
 * Prisma `where` filter for browse queries: only PUBLISHED and FINISHED events.
 * DRAFT events are never visible in public browse.
 */
export const BROWSE_PUBLICATION_FILTER = {
  in: ['PUBLISHED', 'FINISHED'] as const,
};

// ---------------------------------------------------------------------------
// State machine constants for class event lifecycle
// ---------------------------------------------------------------------------

/**
 * Core fields locked after PUBLISHED — students purchase based on these.
 * Editing these on a PUBLISHED event would invalidate existing enrollments.
 */
export const CORE_FIELDS = [
  'title',
  'subjectId',
  'institutionId',
  'startsAt',
  'durationMin',
  'priceCents',
  'capacity',
] as const;

/**
 * State machine for publicationStatus.
 * DRAFT -> PUBLISHED, PUBLISHED -> FINISHED or DRAFT (unpublish, only if no enrollments), FINISHED -> terminal.
 */
export const PUBLICATION_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['FINISHED', 'DRAFT'], // DRAFT = unpublish (only if no enrollments)
  FINISHED: [], // terminal state
};

/**
 * State machine for meetingStatus.
 * Toggle between LOCKED and RELEASED.
 */
export const MEETING_TRANSITIONS: Record<string, string[]> = {
  LOCKED: ['RELEASED'],
  RELEASED: ['LOCKED'], // toggle allowed
};

/**
 * Action -> target state mapping.
 * Maps ClassEventAction enum values to the field and target status they affect.
 */
export const ACTION_MAP: Record<
  string,
  { field: 'publicationStatus' | 'meetingStatus'; targetStatus: string }
> = {
  publish: { field: 'publicationStatus', targetStatus: 'PUBLISHED' },
  unpublish: { field: 'publicationStatus', targetStatus: 'DRAFT' },
  finish: { field: 'publicationStatus', targetStatus: 'FINISHED' },
  'release-meeting': { field: 'meetingStatus', targetStatus: 'RELEASED' },
  'lock-meeting': { field: 'meetingStatus', targetStatus: 'LOCKED' },
};
