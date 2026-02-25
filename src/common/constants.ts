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
