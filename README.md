# CDK Parcel / Docker Build Issue

This repository exists to show an issue with the new Docker-ized build process
in CDK's NodejsFunction construct.

In 1.38.0, the build was moved into a docker container by this PR: https://github.com/aws/aws-cdk/pull/7169

This is causing builds to fail on our CircleCI platform used for continuous delivery of CDK changes.

## The issue

You can see the error in the CircleCI interface here: https://app.circleci.com/pipelines/github/blimmer/cdk-parcel-docker-circleci-issue/4/workflows/a4808b45-a04c-48af-851f-960f888518fd/jobs/7

We can easily start up docker-in-docker by using Circle's `setup_remote_docker` command.

However, when the parcel image tries to run `lscpu`, the failure causes the build to break.

```console
#!/bin/bash -eo pipefail
npx cdk synth

Failed to build file at /home/circleci/project/lib/index.ts: Error: [Status 1] stdout: 🚨  No entries found.

    at Bundler.bundle (/usr/local/share/.config/yarn/global/node_modules/parcel-bundler/src/Bundler.js:275:17)

stderr: /bin/sh: lscpu: not found

Subprocess exited with error 1
Exited with code exit status 1
CircleCI received exit code 1
```

There are a number of issues on the parcel issue tracker about this issue on CI platforms: https://github.com/parcel-bundler/parcel/issues?q=is%3Aissue+sort%3Aupdated-desc+lscpu+is%3Aclosed

## The fix

I can confirm that passing the `PARCEL_WORKERS` environment variable to the `docker run parcel-bundler` image
resolves the problem. I got the idea to try that from this comment on the parcel side: https://github.com/parcel-bundler/parcel/issues/133#issuecomment-619991475

I used CircleCI's [SSH feature](https://circleci.com/docs/2.0/ssh-access-jobs/) to interactively test this.

```
circleci@0d67793e2a50:~/project$ docker run parcel-bundler
Server running at http://localhost:1234
/bin/sh: lscpu: not found
🚨  No entries found.
    at Bundler.bundle (/usr/local/share/.config/yarn/global/node_modules/parcel-bundler/src/Bundler.js:275:17)
    at async Bundler.serve (/usr/local/share/.config/yarn/global/node_modules/parcel-bundler/src/Bundler.js:842:7)
    at async Command.bundle (/usr/local/share/.config/yarn/global/node_modules/parcel-bundler/src/cli.js:241:20)
```

no errors when passing the `PARCEL_WORKERS` param.

```
circleci@0d67793e2a50:~/project$ docker run parcel-bundler -e PARCEL_WORKERS=2
```

### Suggestion

Most all CI platforms set the `CI` environment variable to `true`. Maybe if `CI` is set, CDK automatically passes
the `PARCEL_WORKERS` parameter in the `docker run` args?

https://github.com/aws/aws-cdk/pull/7169/files#diff-30cb98bb231179d8900591911d5cc8a4R75-R80

Alternatively, you could try to fix this problem in the docker image itself if `lscpu` is not present.
