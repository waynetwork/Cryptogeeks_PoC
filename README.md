# Waitlist

This is the Waitlist web app.

## Setup

Clone this repository and install dependencies

    npm install

## Run

There are two ways of starting the frontend.
Which one to choose depends on the backend you want to use.
In both cases a Webpack dev-server with the frontend will start and listen on port 3000.

### with local backend

Run

    npm run local

if you have the backend running locally on port 3001.
(`npm run server` will fall back to this.)

### with remote backend

Run

    npm run remote

if you want to use the backend which is deployed on AWS.

## Build

To build the project run

    ./node_modules/.bin/gulp build --hostname localhost --port 3001

where `--localhost` and `--port` allows you to specify the backend.
This will run webpack and set up all the configuration for the backend connection.
If you want to enable the notification feature, run the build with this optional flag:

    --enableNotifications true

You can provide a Google Analytics ID with

    --googleAnalyticsId some-id-123

(If you do not provide an ID, GA is turned off)
