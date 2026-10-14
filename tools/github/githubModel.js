// GitHub Model - All GitHub API interactions
// Handles both personal and company GitHub accounts

import { Octokit } from '@octokit/rest';

// Create Octokit instances for each account
function getClient(account = 'personal') {
  const token =
    account === 'company'
      ? process.env.GITHUB_COMPANY_TOKEN
      : process.env.GITHUB_PERSONAL_TOKEN;

  if (!token) {
    throw new Error(`GitHub token for "${account}" account is not set in .env`);
  }

  return new Octokit({ auth: token });
}

function getUsername(account = 'personal') {
  return account === 'company'
    ? process.env.GITHUB_COMPANY_USERNAME
    : process.env.GITHUB_PERSONAL_USERNAME;
}

// ─────────────────────────────────────────────
// REPOSITORIES
// ─────────────────────────────────────────────

/**
 * List repositories for an account
 */
export async function getRepos(account = 'personal', filters = {}) {
  const octokit = getClient(account);
  const { type = 'all', sort = 'updated', limit = 20 } = filters;

  const { data } = await octokit.repos.listForAuthenticatedUser({
    type,
    sort,
    per_page: limit,
  });

  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    updatedAt: repo.updated_at,
    defaultBranch: repo.default_branch,
  }));
}

/**
 * Get a single repository
 */
export async function getRepo(account = 'personal', owner, repo) {
  const octokit = getClient(account);
  const { data } = await octokit.repos.get({ owner, repo });

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    private: data.private,
    url: data.html_url,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    watchers: data.watchers_count,
    size: data.size,
    topics: data.topics,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    defaultBranch: data.default_branch,
    license: data.license?.name || null,
  };
}

/**
 * Search repositories
 */
export async function searchRepos(account = 'personal', query, limit = 10) {
  const octokit = getClient(account);
  const username = getUsername(account);

  const { data } = await octokit.search.repos({
    q: `${query} user:${username}`,
    per_page: limit,
    sort: 'updated',
  });

  return data.items.map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
  }));
}

// ─────────────────────────────────────────────
// ISSUES
// ─────────────────────────────────────────────

/**
 * List issues for a repository
 */
export async function getIssues(account = 'personal', owner, repo, filters = {}) {
  const octokit = getClient(account);
  const { state = 'open', limit = 20 } = filters;

  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: limit,
    sort: 'updated',
  });

  // Filter out pull requests (GitHub returns PRs as issues too)
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      body: issue.body,
      author: issue.user?.login,
      labels: issue.labels.map((l) => l.name),
      assignees: issue.assignees.map((a) => a.login),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
    }));
}

/**
 * Create an issue
 */
export async function createIssue(account = 'personal', owner, repo, issueData) {
  const octokit = getClient(account);

  const { data } = await octokit.issues.create({
    owner,
    repo,
    title: issueData.title,
    body: issueData.body || '',
    labels: issueData.labels || [],
    assignees: issueData.assignees || [],
  });

  return {
    number: data.number,
    title: data.title,
    state: data.state,
    url: data.html_url,
    createdAt: data.created_at,
  };
}

// ─────────────────────────────────────────────
// PULL REQUESTS
// ─────────────────────────────────────────────

/**
 * List pull requests for a repository
 */
export async function getPullRequests(account = 'personal', owner, repo, filters = {}) {
  const octokit = getClient(account);
  const { state = 'open', limit = 20 } = filters;

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state,
    per_page: limit,
    sort: 'updated',
  });

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft,
    author: pr.user?.login,
    sourceBranch: pr.head.ref,
    targetBranch: pr.base.ref,
    url: pr.html_url,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
  }));
}

// ─────────────────────────────────────────────
// COMMITS
// ─────────────────────────────────────────────

/**
 * List recent commits for a repository
 */
export async function getCommits(account = 'personal', owner, repo, limit = 15) {
  const octokit = getClient(account);

  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: limit,
  });

  return data.map((commit) => ({
    sha: commit.sha.slice(0, 7),
    message: commit.commit.message.split('\n')[0], // First line only
    author: commit.commit.author?.name,
    date: commit.commit.author?.date,
    url: commit.html_url,
  }));
}

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

/**
 * Get authenticated user profile
 */
export async function getUserProfile(account = 'personal') {
  const octokit = getClient(account);
  const { data } = await octokit.users.getAuthenticated();

  return {
    username: data.login,
    name: data.name,
    bio: data.bio,
    company: data.company,
    location: data.location,
    publicRepos: data.public_repos,
    privateRepos: data.total_private_repos,
    followers: data.followers,
    following: data.following,
    url: data.html_url,
    createdAt: data.created_at,
  };
}

// ─────────────────────────────────────────────
// SUMMARY (across both accounts)
// ─────────────────────────────────────────────

/**
 * Get a quick summary of an account's activity
 */
export async function getAccountSummary(account = 'personal') {
  const [profile, repos] = await Promise.all([
    getUserProfile(account),
    getRepos(account, { limit: 100 }),
  ]);

  const languages = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ language: lang, repos: count }));

  return {
    profile,
    stats: {
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
      totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
      topLanguages,
    },
    recentRepos: repos.slice(0, 5),
  };
}
