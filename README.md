# MVP: Character Maker

This project is intended to be a minimal viable product (MVP) for a Dungeons & Dragons Character Maker web application, with offline-first functionality.

- [Remix Docs](https://remix.run/docs) <- The Framework used by this project.

## Running this Project

Install the necessary dependencies:

```sh
yarn
```

Then build the project:

```sh
yarn build
```

Finally, start the project locally:

```sh
yarn start
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

Or deploy to Cloudflare Pages (see section below from Remix).

## Deployment

Cloudflare Pages are currently only deployable through their Git provider integrations.

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages) and after verifying your email address with Cloudflare, go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything).

Configure the "Build command" should be set to `yarn build`, and the "Build output directory" should be set to `public`.
