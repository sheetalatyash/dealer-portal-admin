# Dealer Platform User Administration UI

This respository contains feature implementation for Dealer Platform User Administration UI.

## Prerequisite

### Git For Windows

Download and install Git For Windows https://gitforwindows.org/

Make sure to use git bash while working on this application or use bash shell in VS Code console.

### NVM For Windows

Download and install latest version of Node Version Manager For Windows (nvm-setup.exe) from the link below

https://github.com/coreybutler/nvm-windows/releases

After installation is complete then run following command to install specific version of the NodeJS for this project if not already installed

```bash
nvm install 20.16.0
```

then run to ensure you are using node 20.16.0

```bash
nvm use 20.16.0
```

> :warning: **Restart computer to ensure you do not run in to any further issues in any following setup step**

### Github Personal Access Token

Coming Soon! Skip for now.

### Angular DevTools For Chrome

Use Chrome or Firefox for Angular development testing locally and install Angular DevTools.

#### DevTools Overview

https://v17.angular.io/guide/devtools

#### Add To Chrome

https://chromewebstore.google.com/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh

#### Add To Firefox

https://addons.mozilla.org/en-US/firefox/addon/angular-devtools/

## Setup

### Clone Repo

```bash
git clone https://github.com/Polaris-Applications/channels-dpp-core-web.git
```

### Change directory to the repo

```bash
cd .\dealer-portal\
```

### Run following command to install all application dependencies

```bash
npm i
```

### Run following command to build all applications
```bash
npx nx run-many -t build
```

### Run following command to start and serve the app

```bash
npx nx serve account-search
npx nx serve communications
npx nx serve communications-administration
npx nx serve user-administration
```

### If you get error you might need to log in via the portal
```bash
https://dev.polarisportal.com/en-us/
```

## Angular

This application uses [Angular](https://angular.io) as a framework for single page application development. Angular and all relevant dependencies should be kept up to date with the latest supported LTS version.

[More details on Angular end of life can be found here](https://endoflife.date/angular)

Please find our application documentation here:

https://polaris.atlassian.net/wiki/spaces/DP1/pages/5908987993/Angular+Front+End+Apps

## Angular Practices

### RxJs

In order to avoid memory leaks in the application we need to unsubscribe from any
subscriptions created manually. There are many ways to accomplish this goal but we
opted to implement subject behaviors to cancel subscriptions during OnDestroy life cycle
event and take(1) for when a subscription need to complete only once for example (saving, updating, deleting, running only once when the application started etc). In short, if a subscription can be cancelled on component destory without impacting functionality then use subject behavior with takeUntil on destroy otherwise take 1 and close stream.

There should be no subscriptions created inside a service. A service can be injected as either singleton for the module or on the root and as a result it does not destory itself.

**Some best practices to read up on to get familiar with this topic:**

- <a href="https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription" target="_blank" rel="noopener">Angular/RxJs When should I unsubscribe from Subscriptionn</a>
- <a href="https://ncjamieson.com/avoiding-takeuntil-leaks/" target="_blank" rel="noopener">RxJS: Avoiding takeUntil Leaks</a>
- <a href="https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0" target="_blank" rel="noopener">Observables In The Angular Applications!</a>
- <a href="https://bytethisstore.com/articles/pg/rxjs-unsubscribe" target="_blank" rel="noopener">6 Effective Ways to Unsubscribe in RxJS</a>

### Resources

https://angular.io/resources

https://patrickjs.github.io/awesome-angular

### CLI

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Github Dependabot

Github dependabot is turned on in the repository settings and is configured via dependabot.yml file inside .github folder.

[Learn more about dependabot here](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-supply-chain-security#what-is-dependabot)

## Linting

[ESLint](https://eslint.org/) is used for linting and is configured via .eslintrc.json

## Supported Browsers

Supported browsers are configured via .browserlistrc file. Angular by default supports all tooling within the CLI that are needed.

[Click here for more details](https://angular.io/guide/build#configuring-browser-compatibility)

## NVM (Node Version Manager)

NVM for Windows is used for managing node versions so developers can work on different projects requiring different versions of NodeJs. NVM configuration .nvmrc is partially supported by NVM for Windows and due to the issue of getting it working without additional quirks it was not used in this application.

[More details here](https://github.com/coreybutler/nvm-windows/issues/16)

This NPM script `set-engine` in package.json is used for setting correct node version automatically.

## Code Formatting

Prettier is used for code formatting.

[More details here](https://prettier.io/docs/en/)

[Prettier configuration options](https://prettier.io/docs/en/configuration.html)

## Storybook

[Storybook](https://storybook.js.org/) was chosen as a tool to help aid with [component driven development](https://www.componentdriven.org/).

[Click here for Storybook Angular tutorial](https://storybook.js.org/tutorials/intro-to-storybook/angular/en/get-started/)

## Testing

Unit and Integartion testing is not setup in this application. We will use Selenium automation suite owned by the QA team to regress the features end to end. This is done to no double up the effort of testing between different groups.

# View, like and subscribe below if you love this repo.

https://www.jibjab.com/view/make/im_a_hotdog/9d1cc078-7900-4ca9-a4f0-5889c4a08b76
