const fs = require("fs");

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;

async function getContributors() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contributors`, {
    headers: {
      Authorization: `token ${TOKEN}`,
    },
  });

  return await res.json();
}

function generateMarkdown(contributors) {
  const excludedUsers = ["D240021", "Josue19-08"];

  const filtered = contributors.filter(
    (c) => !excludedUsers.includes(c.login)
  );

  const top = filtered.slice(0, 3);

  let md = `## 🏆 Top 3 Contributors\n\n`;
  md += `<div align="center">\n\n<table>\n<tr>\n`;

  top.forEach((c, index) => {
    const medals = ["🥇", "🥈", "🥉"];

    md += `
<td align="center">
  <a href="${c.html_url}">
    <img src="${c.avatar_url}" width="100px;" style="border-radius:50%;" alt="${c.login}"/><br />
    <sub><b>${medals[index]} @${c.login}</b></sub><br />
    <sub>${c.contributions} contributions</sub>
  </a>
</td>
`;
  });

  md += `\n</tr>\n</table>\n</div>\n`;

  return md;
}

async function main() {
  const contributors = await getContributors();
  const leaderboard = generateMarkdown(contributors);

  const readme = fs.readFileSync("README.md", "utf-8");

  const newReadme = readme.replace(
    /<!-- LEADERBOARD_START -->[\s\S]*<!-- LEADERBOARD_END -->/,
    `<!-- LEADERBOARD_START -->\n${leaderboard}\n<!-- LEADERBOARD_END -->`
  );

  fs.writeFileSync("README.md", newReadme);
}

main();
