# Tchatter

## Presentation

This project is two things:

- a modern web application built with state-of-the-art tools and practices
- a cloud-like infrastructure allowing updates without service interruption

### Web application

A simple chat application built with [Nodejs](http://nodejs.org/)/Express, [Angular](https://angularjs.org/), SockJS, Mocha, Chai, WebDriverJS, [Redis](http://redis.io/)...
Bootstrapped From Yearofmoo's AngularJS Seed: A starter AngularJS repository for getting started with AngularJS.

Everything has been coded with several tests first, at least one test by "layer" concerned (server, client) and one end-to-end test.
This process was a bit dumb (some things were tested several times) on purpose, to force us in using all tools we wanted to discover (namely: Grunt, Karma and Protractor).


### Cloud-like infrastructure

The goal is to allow deploying web application updates without service interruption.

The main components are:

- [HAProxy](http://www.haproxy.org): Front proxy allowing loadbalancing
- Our webapp application tchatter running on Nodejs
- [Redis](http://redis.io/): a key-value store, with publish/subscribe capabilities, allowing several app instances to share messages

Each component is embedded in a [Docker](www.docker.com) container.
To run Docker containers, easily, and independently of the user computer, a Virtualbox VM is run with Vagrant, based on Ubuntu 14.04

As shown in the following architecture diagram, the HAProxy container is connected to N webapp containers, which are connected to a single redis container.

![Tchatter infrastructure](/doc/free-session-demo.png)

Being part of one of our bi-annual free sessions at [Stormshield](http://www.stormshield.eu), we built it with a specific demonstration scenario in mind.
Indeed, we populated our chat with "Reservoir Dogs" characters who automatically talked to each other (implemented with an ugly addition in the client part of the app, as time was running out).

We were in an extreme prototyping mood with direct feedback, therefore tests have clearly been left behind :)

## Running the Web application

### Pre-requisite

Install NodeJS/Npm
Install Redis or use the Redis container provided by the infrastructure part

### Installation

1. `npm install -g grunt-cli`
2. `npm install`
3. `grunt install`

### Development

1. `grunt dev`
2. Go to: `http://localhost:8080`

### Testing

#### Run all tests with
`grunt test` 

#### Unit Testing

##### Single run client (karma) tests
`grunt test:client`

##### Auto watching client (karma) tests
`grunt autotest:client`

##### Single run server tests
`grunt test:server`

##### Auto watching server tests
`grunt autotest:server`

#### End to End Testing (WebDriverJS)

##### Single run tests
`grunt test:e2e` 

##### Auto watching tests
`grunt autotest:e2e`

### Package tchatter-app
```
npm run package
```

## Deploying the infrastructure

### Pre-requisite

Install:

- Vagrant
- Ansible

### Vagrant installation
`vagrant up`

### Launching redis-server only (needs Vagrant running)
```
cd infra
ansible-playbook -i inventories/dev redis-server.yml
```

### Deploying tchatter-app only (needs Vagrant running)
```
cd infra
ansible-playbook -i inventories/dev tchatter-app.yml
```

### Deploying whole infrastructure (needs Vagrant running)
```
npm run deploy
```

## Run the experiment scenario

1. Launch the production environment with
```
npm run deploy
```

2. Open 6 different browser windows.
A browser window must be attributed a unique user among: Mr Pink, Mr Blue, Mr White, Mr Brown, Mr Orange and Mr Blonde.
You may have to clear cookies and refresh the page.

3. Start the discussion by entering "begin" message in Mr Blue's window. The discussion should now go on between the 6 windows.

4. Modify the version of the application: lib/message.js line 3

5. Deploy the new tchatter web application version with rolling update
```
npm run deploy
```

6. You can monitor node health on http://localhost:8888/stats

7. You should see application version in browser window change from 1 to 2 (if you choose 2 as new version). The discussion still goes on, as service was not interrupted


Note: TODO explain non-interruption not working perfectly

## Feedback

TODO...
