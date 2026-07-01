// config.js — tunable app-wide settings.
// Kept in one place so the project scales cleanly as content grows.

/**
 * Maximum number of questions asked in a single test run. When a subject's
 * question pool is larger than this, a random subset is drawn each attempt —
 * so hundreds of questions can be added per subject without changing code.
 */
export const QUIZ_SIZE = 20;

/** Passing score (percentage) — the exam threshold. */
export const PASS_SCORE = 70;

/** Score at/above which a result is considered "close" rather than failing. */
export const NEAR_SCORE = 50;
