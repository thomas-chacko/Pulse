// GitHub Routes - API endpoint definitions

import express from 'express';
import * as GitHubController from './githubController.js';

const router = express.Router();

// ── Profile & Summary ──────────────────────────────────────
// GET /api/tools/github/profile?account=personal
router.get('/profile', GitHubController.getUserProfile);

// GET /api/tools/github/summary?account=personal
router.get('/summary', GitHubController.getAccountSummary);

// ── Repositories ───────────────────────────────────────────
// GET /api/tools/github/repos?account=personal&type=all&sort=updated&limit=20
router.get('/repos', GitHubController.getRepos);

// GET /api/tools/github/search?account=personal&q=my-repo
router.get('/search', GitHubController.searchRepos);

// GET /api/tools/github/repos/:owner/:repo?account=personal
router.get('/repos/:owner/:repo', GitHubController.getRepo);

// ── Issues ─────────────────────────────────────────────────
// GET /api/tools/github/repos/:owner/:repo/issues?account=personal&state=open
router.get('/repos/:owner/:repo/issues', GitHubController.getIssues);

// POST /api/tools/github/repos/:owner/:repo/issues
router.post('/repos/:owner/:repo/issues', GitHubController.createIssue);

// ── Pull Requests ──────────────────────────────────────────
// GET /api/tools/github/repos/:owner/:repo/pulls?account=personal&state=open
router.get('/repos/:owner/:repo/pulls', GitHubController.getPullRequests);

// ── Commits ────────────────────────────────────────────────
// GET /api/tools/github/repos/:owner/:repo/commits?account=personal&limit=15
router.get('/repos/:owner/:repo/commits', GitHubController.getCommits);

export default router;
