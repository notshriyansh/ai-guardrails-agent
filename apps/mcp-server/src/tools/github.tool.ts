import axios from "axios";

const github = axios.create({
  baseURL: "https://api.github.com",

  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? `Bearer ${process.env.GITHUB_TOKEN}`
      : undefined,
  },
});

export async function getRepoInfoTool({
  owner,
  repo,
}: {
  owner: string;

  repo: string;
}) {
  const response = await github.get(
    `/repos/${owner}/${repo}`,
  );

  return {
    name: response.data.full_name,

    description:
      response.data.description,

    stars:
      response.data.stargazers_count,

    forks:
      response.data.forks_count,

    openIssues:
      response.data.open_issues_count,

    url: response.data.html_url,
  };
}

export async function getLatestCommitsTool({
  owner,
  repo,
}: {
  owner: string;

  repo: string;
}) {
  const response = await github.get(
    `/repos/${owner}/${repo}/commits`,
  );

  return response.data
    .slice(0, 5)
    .map((commit: any) => ({
      sha: commit.sha,

      message:
        commit.commit.message,

      author:
        commit.commit.author.name,
    }));
}