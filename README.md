Isomorphic React Starter Kit
========

This app is an example of how to build a React app which will pre-render on the
server using the same views which are used to render on the client. It also
includes pre-fetching of remote data used to compile the view, to prevent
re-fetching this data on the client.
It uses webpack to create two builds for server and client.

Pull requests, issues and questions are more than welcome.

A similar codebase powers future projects we're building at CareerLounge.
Enthusastic about React, JS, and building awesome shit? We're hiring engineers,
get in touch!

## Quick Start

Start server om development mode: `NODE_ENV=development grunt server:dev`

The value of NODE_ENV will load the appropriate config from the `src/config/`
directory

## Configuration

Default and environment-specifc configuration is found in `src/config/`.
`config.server.hostname` is `example.com` by default, and overridden
configuration for your local machine can be set by copying `local-template.js`
to `local.js`, or creating a new `local.js`.

## Javascript

We write ES6 almost everywhere, thanks to Webpack and Babel. `Gruntfile.js`
and any file it directly includes should be ES5, including all config files.
We use bluebird for promises everywhere.

Components set in routes.jsx will be checked for a `fetchData` function during
server render. If set, it will be passed the
[react-router parameters](https://github.com/rackt/react-router/blob/master/docs/api/RouterContext.md#getcurrentparams)
in an object and will be expected to return a Promise to be settled once the
data is fetched.

Within route components which use `fetchData`, you should call it statically
within the component itself if required, to

## Sass/CSS

We hook sass-loader into the preLoaders so you can use an alternate loader to
deal with the output within the code. You probably won't have to do this, we
only use it to capture `app.scss` to a static file on the client build, and
ignore it on the server.
