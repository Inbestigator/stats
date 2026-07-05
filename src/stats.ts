type RepoNode = {
  name: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
};

type UserResponse = {
  data: {
    user: {
      name: string | null;
      login: string;
      bio: string | null;
      followers: { totalCount: number };
      following: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: { totalContributions: number };
      };
      repositories: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: RepoNode[];
      };
    };
  };
};

const endpoint = "https://api.github.com/graphql";

async function gql(query: string, variables: Record<string, unknown>, token: string) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as object;

  if ("errors" in json) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }

  return json;
}

async function fetchUserData(login: string, token: string) {
  const repos: RepoNode[] = [];
  let cursor: string | null | undefined;

  let name: string | undefined;
  let userLogin: string;
  let bio: string | undefined;

  let followers = 0;
  let following = 0;
  let contributions = 0;
  let repositoryCount = 0;

  while (true) {
    const query = `
      query ($login: String!, $cursor: String) {
        user(login: $login) {
          name
          login
          bio

          followers {
            totalCount
          }

          following {
            totalCount
          }

          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }

          repositories(
            first: 100
            after: $cursor
            ownerAffiliations: OWNER
          ) {
            totalCount

            pageInfo {
              hasNextPage
              endCursor
            }

            nodes {
              name
              stargazerCount

              primaryLanguage {
                name
              }
            }
          }
        }
      }
    `;

    const json = (await gql(query, { login, cursor }, token)) as UserResponse;

    const user = json.data.user;
    const repoData = user.repositories;

    name = user.name || undefined;
    userLogin = user.login;
    bio = user.bio || undefined;

    followers = user.followers.totalCount;
    following = user.following.totalCount;
    contributions = user.contributionsCollection.contributionCalendar.totalContributions;
    repositoryCount = repoData.totalCount;

    repos.push(...repoData.nodes);

    if (!repoData.pageInfo.hasNextPage) {
      break;
    }

    cursor = repoData.pageInfo.endCursor;
  }

  return {
    name,
    login: userLogin,
    bio,
    followers,
    following,
    contributions,
    repositoryCount,
    repos,
  };
}

function totalStars(repos: RepoNode[]) {
  return repos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
}

function topLanguage(repos: RepoNode[]) {
  const counts = new Map<string, number>();

  for (const repo of repos) {
    const lang = repo.primaryLanguage?.name;

    if (!lang) continue;

    counts.set(lang, (counts.get(lang) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function highestStarRepo(repos: RepoNode[]) {
  return repos.reduce<RepoNode | undefined>((best, repo) => {
    if (!best || repo.stargazerCount > best.stargazerCount) {
      return repo;
    }
    return best;
  }, undefined)?.name;
}

export async function getGitHubStats(login: string, token: string) {
  const {
    name,
    login: actualLogin,
    bio,
    followers,
    following,
    contributions,
    repositoryCount,
    repos,
  } = await fetchUserData(login, token);

  return {
    name,
    login: `@${actualLogin}`,
    bio,
    followers,
    following,
    contributions,
    repositories: repositoryCount,
    stars: totalStars(repos),
    topLanguage: topLanguage(repos),
    highestStarRepo: highestStarRepo(repos),
  };
}
