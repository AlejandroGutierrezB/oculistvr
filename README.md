# [OculistVR](https://www.notion.so/1ffc01f1b8b54c79ac3714bca536e63e)

This project uses `github actions` as a crone job task runner, to scrape the list of most popular paid games for [OculustVR](https://www.oculus.com/experiences/quest/section/274907549851488/#/?_k=d97dn6) headset. Using **Notion** as both the `db` and the `frontend` to track game prices.
You can have a look to the list [here](https://www.notion.so/1ffc01f1b8b54c79ac3714bca536e63e)
They idea is to provoque exploration and try new things but if oyu want to improve the project or use it youself see instructions below.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

Here is what you need to be able to run it.

- Node.js
- NPM
- [Notion developer key](https://developers.notion.com/docs/getting-started).
- [Notion db to use](https://stackoverflow.com/questions/67728038/where-to-find-database-id-for-my-database-in-notion).
- [Telegram](https://core.telegram.org/bots/api) if you want notifications.

### Development Setup

1. Clone the repo.
   ```sh
   git clone https://github.com/AlejandroGutierrezB/oculistvr/new/master?readme=1
   ```
2. Install packages with yarn.
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Configure environment variables in the .env file.
5. Run (in development mode).
   ```sh
   npm run dev
   ```

<!-- STACK -->

### Built With

- [Node.js](https://nodejs.org/)
- [Notion](https://www.notion.so/)
- [Github Actions](https://github.com/features/actions)
- [Telegram](https://core.telegram.org/bots/api)

<!-- Roadmap -->

### To-do's

- [x] Add github action to run everyday.
- [x] Add sendgrid to receive notifications.
- [ ] If I keep adding features adding Typescript is a must

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.
