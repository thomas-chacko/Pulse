// GitHub Controller - Business logic and request handling

import * as GitHubModel from './githubModel.js';

// Helper: extract account param (defaults to 'personal')
function getAccount(req) {
  const account = req.query.account || req.body?.account || 'personal';
  if (!['personal', 'company'].includes(account)) {
    throw new Error('account must be "personal" or "company"');
  }
  return account;
}

// ─────────────────────────────────────────────
// REPOSITORIES
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/repos
 */
export async function getRepos(req, res) {
  try {
    const account = getAccount(req);
    const { type = 'all', sort = 'updated', limit } = req.query;

    const repos = await GitHubModel.getRepos(account, {
      type,
      sort,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({ success: true, account, repos, count: repos.length });
  } catch (error) {
    console.error('Error getting repos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/tools/github/repos/:owner/:repo
 */
export async function getRepo(req, res) {
  try {
    const account = getAccount(req);
    const { owner, repo } = req.params;

    const data = await GitHubModel.getRepo(account, owner, repo);
    res.json({ success: true, account, repo: data });
  } catch (error) {
    console.error('Error getting repo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/tools/github/search?q=query
 */
export async function searchRepos(req, res) {
  try {
    const account = getAccount(req);
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Search query (q) is required' });
    }

    const repos = await GitHubModel.searchRepos(account, q.trim(), limit ? parseInt(limit) : 10);
    res.json({ success: true, account, repos, count: repos.length, query: q });
  } catch (error) {
    console.error('Error searching repos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ─────────────────────────────────────────────
// ISSUES
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/repos/:owner/:repo/issues
 */
export async function getIssues(req, res) {
  try {
    const account = getAccount(req);
    const { owner, repo } = req.params;
    const { state = 'open', limit } = req.query;

    if (!['open', 'closed', 'all'].includes(state)) {
      return res.status(400).json({ success: false, error: 'state must be open, closed, or all' });
    }

    const issues = await GitHubModel.getIssues(account, owner, repo, {
      state,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({ success: true, account, issues, count: issues.length });
  } catch (error) {
    console.error('Error getting issues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/tools/github/repos/:owner/:repo/issues
 */
export async function createIssue(req, res) {
  try {
    const account = getAccount(req);
    const { owner, repo } = req.params;
    const { title, body, labels, assignees } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Issue title is required' });
    }

    const issue = await GitHubModel.createIssue(account, owner, repo, {
      title: title.trim(),
      body,
      labels,
      assignees,
    });

    res.status(201).json({ success: true, account, issue });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ─────────────────────────────────────────────
// PULL REQUESTS
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/repos/:owner/:repo/pulls
 */
export async function getPullRequests(req, res) {
  try {
    const account = getAccount(req);
    const { owner, repo } = req.params;
    const { state = 'open', limit } = req.query;

    const prs = await GitHubModel.getPullRequests(account, owner, repo, {
      state,
      limit: limit ? parseInt(limit) : 20,
    });

    res.json({ success: true, account, pullRequests: prs, count: prs.length });
  } catch (error) {
    console.error('Error getting pull requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ─────────────────────────────────────────────
// COMMITS
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/repos/:owner/:repo/commits
 */
export async function getCommits(req, res) {
  try {
    const account = getAccount(req);
    const { owner, repo } = req.params;
    const { limit } = req.query;

    const commits = await GitHubModel.getCommits(account, owner, repo, limit ? parseInt(limit) : 15);
    res.json({ success: true, account, commits, count: commits.length });
  } catch (error) {
    console.error('Error getting commits:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/profile
 */
export async function getUserProfile(req, res) {
  try {
    const account = getAccount(req);
    const profile = await GitHubModel.getUserProfile(account);
    res.json({ success: true, account, profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

/**
 * GET /api/tools/github/summary
 */
export async function getAccountSummary(req, res) {
  try {
    const account = getAccount(req);
    const summary = await GitHubModel.getAccountSummary(account);
    res.json({ success: true, account, summary });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
