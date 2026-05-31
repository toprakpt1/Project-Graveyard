<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GPLv3 License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Project Graveyard</h3>

  <p align="center">
    A personal project tracker for developers who have accumulated unfinished side projects.
    <br />
    <br />
    <a href="project-graveyard-mu.vercel.app"><strong>View Demo »</strong></a>
    &middot;
    <a href="https://github.com/toprakpt1/project-graveyard/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/toprakpt1/project-graveyard/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Developers start many side projects but finish few. Over time, context is lost — why a project was paused, what the next step would be, or which tech stack was used. The lack of a lightweight tracking system means abandoned projects stay forgotten, even when restarting them would be valuable.

**Project Graveyard** provides a centralized space to log, categorize, and revisit paused, abandoned, or completed projects — with the goal of making future restarts deliberate and informed. Keep unfinished projects visible, searchable, and easy to restart. Save what stopped, what still matters, and the next move that would bring it back.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Tailwind][Tailwind-badge]][Tailwind-url]
* [![Supabase][Supabase-badge]][Supabase-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

You can test the deployed version on Vercel using the link above, or you can host it locally by following the steps below.

### Prerequisites

You need `npm` (or another package manager like `yarn`, `pnpm`) and Node.js installed.
* npm
  ```sh
  npm install npm@latest -g
  ```
You will also need a Supabase project set up for the database backend.

### Installation

1. Create a free Supabase project at [https://supabase.com/](https://supabase.com/)
2. Clone the repo
   ```sh
   git clone https://github.com/toprakpt1/project-graveyard.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Copy the environment template and configure your keys
   ```sh
   cp .env.example .env.local
   ```
5. Enter your API credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GITHUB_TOKEN_ENCRYPTION_KEY=replace-with-a-long-random-server-only-secret
   ```
6. Run the database migrations
   ```sh
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
   > Alternatively, open the Supabase Dashboard → **SQL Editor**, and run each file from [`supabase/migrations/`](supabase/migrations/) in order (e.g. `00001_init.sql`, `00002_github_integration.sql`, etc.).
7. Run the development server
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

- **Add Projects:** Log your active, paused, abandoned, or completed projects.
- **Track Progress:** Add milestones, tags, technologies, and notes.
- **Analyze Activity:** View your project activity through a GitHub-style heatmap.
- **GitHub Sync:** Connect your GitHub to sync repositories and detect project statuses based on commit activity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Project Management (Create, Edit, Status changes)
- [x] Dashboard with Statistics & Heatmap
- [x] Journal & Milestones tracking
- [x] GitHub Integration for automatic status syncing
- [x] AI Analysis for project resumption

See the [open issues](https://github.com/toprakpt1/project-graveyard/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the GNU General Public License v3.0. See LICENSE for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Toprak - [@toprakpt1](https://x.com/toprakpt1)

Project Link: [https://github.com/toprakpt1/project-graveyard](https://github.com/toprakpt1/project-graveyard)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/toprakpt1/project-graveyard.svg?style=for-the-badge
[contributors-url]: https://github.com/toprakpt1/project-graveyard/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/toprakpt1/project-graveyard.svg?style=for-the-badge
[forks-url]: https://github.com/toprakpt1/project-graveyard/network/members
[stars-shield]: https://img.shields.io/github/stars/toprakpt1/project-graveyard.svg?style=for-the-badge
[stars-url]: https://github.com/toprakpt1/project-graveyard/stargazers
[issues-shield]: https://img.shields.io/github/issues/toprakpt1/project-graveyard.svg?style=for-the-badge
[issues-url]: https://github.com/toprakpt1/project-graveyard/issues
[license-shield]: https://img.shields.io/github/license/toprakpt1/project-graveyard.svg?style=for-the-badge
[license-url]: https://github.com/toprakpt1/project-graveyard/blob/main/LICENSE
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Supabase-badge]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
