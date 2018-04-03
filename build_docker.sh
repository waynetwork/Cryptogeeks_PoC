#!/bin/sh

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "master" ]; then
    DOCKER_LOGIN="$(aws ecr get-login --no-include-email --region eu-central-1)"

    $DOCKER_LOGIN

    echo "Building static content"

    npm install

    ./node_modules/.bin/gulp build --hostname api.waitlist.cc --port 443 --enableNotifications true --enableWaitcoinChallenge true --googleAnalyticsId UA-110490924-1

    echo "Building docker image"

    docker build -t waitlist-fe .

    echo "Tagging image"

    CURRENT_HASH="$BRANCH-$(git rev-parse HEAD | cut -c1-6)"

    docker tag waitlist-fe 614992511822.dkr.ecr.eu-central-1.amazonaws.com/waitlist-fe:$CURRENT_HASH

    echo "Pushing image to repo"

    docker push 614992511822.dkr.ecr.eu-central-1.amazonaws.com/waitlist-fe:$CURRENT_HASH

    echo "Deploying to eu-dev"

    echo "Deploying to AWS";
    ./ecs-deploy-0ab06b -r eu-central-1 -c eu-dev -n wailist-fe-dev -i 614992511822.dkr.ecr.eu-central-1.amazonaws.com/waitlist-fe:$CURRENT_HASH
else
    echo "Not deploying to AWS";
fi
