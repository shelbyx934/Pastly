import crypto from 'crypto';

/**
 * In-memory upload job queue.
 *
 * Each entry is a "jobState" object mutated in-place by the background upload
 * worker so that the status-poll controller always sees fresh data.
 *
 * Shape:
 *   {
 *     phase:        'uploading' | 'done' | 'error'
 *     progressHash: string   (UUID sent to pCloud for /uploadprogress)
 *     code:         string   (transfer code, generated before upload starts)
 *     url:          string | null
 *     expiresAt:    Date   | null
 *     error:        string | null
 *     startedAt:    Date
 *   }
 */
const jobs = new Map();

const JOB_TTL_MS = 30 * 60 * 1000; // auto-remove jobs after 30 min

/**
 * Register a new upload job.
 * @param {string} code         Transfer code (pre-generated, unique)
 * @param {string} progressHash UUID matching the one passed to pCloud
 * @returns {{ jobId: string, jobState: object }}
 */
export function createJob(code, progressHash) {
    const jobId = crypto.randomUUID();

    const jobState = {
        phase: 'uploading',
        progressHash,
        code,
        url: null,
        expiresAt: null,
        error: null,
        startedAt: new Date(),
    };

    jobs.set(jobId, jobState);

    // Prevent the Map from growing forever
    setTimeout(() => jobs.delete(jobId), JOB_TTL_MS);

    return { jobId, jobState };
}

/**
 * Look up a job by ID.
 * @returns {object|null}  jobState, or null if not found / already cleaned up
 */
export function getJob(jobId) {
    return jobs.get(jobId) ?? null;
}
