# Tchatter

## Presentation

This project is two things:

- a modern web application built with state-of-the-art tools and practices
- a cloud-like infrastructure allowing updates without service interruption

### Web application

A simple chat application built with [Nodejs](http://nodejs.org/)/Express, [Angular](https://angularjs.org/), SockJS, Mocha, Chai, WebDriverJS, [Redis](http://redis.io/)...
Bootstrapped from [Yearofmoo's AngularJS Seed](https://github.com/yearofmoo/angularjs-seed-repo): A starter AngularJS repository for getting started with AngularJS.

Everything has been coded with several tests first, at least one test by "layer" concerned (server, client) and one end-to-end test.
This process was a bit dumb (some things were tested several times) on purpose, to force us in using all tools we wanted to discover (namely: Grunt, Karma and Protractor).


### Cloud-like infrastructure

The goal is to allow deploying web application updates without service interruption (not yet fully achieved, see [Note](#note) below).

The main components are:

- [HAProxy](http://www.haproxy.org): Front proxy allowing loadbalancing
- Our web application tchatter running on Nodejs
- [Redis](http://redis.io/): a key-value store, with publish/subscribe capabilities, allowing several app instances to share messages

Each component is embedded in a [Docker](www.docker.com) container.
To run Docker containers, easily, and independently to the user computer, a Virtualbox VM is run with Vagrant, based on Ubuntu 14.04

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

#### Auto watching all tests
`grunt autotest` Run tests automatically when files change

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

<a name="note"></a>
Note:
As previously mentioned, there is still a service interruption.
On service restart, there is a disconnection/reconnection for each browser client (the websocket is recreated):
- the client displays that inadequate information because the disconnection event comes from the server, not the client
- all messages sent by other clients meanwhile are lost for the disconnected client. Upon reconnection, the client should ask for the missing messages.

## Feedback

**Angular**: Our web app is not complex enough to have a clear opinion. The double databinding is quite spectacular, but comes at a price: we lost control of the view part,
which can be regained at an expensive cost (directives).

**Protractor**: Can launch many browsers, but only works for angular applications. Besides, it instruments the application, thus changing our tests to white box mode
(for instance, it refuses to launch tests while there is a "setInterval" activity). Instead, we directly used WebDriverJS.

**SockJS**: cool stuff :)

**Grunt**: nice tool!

**Docker**: Remember, a container is a process, not a VM! For instance, it is of no use to "ssh" into a container.

**Ansible**: rolling updates mechanism is not applicable to docker containers. Ansible allows to loop on hosts,
but containers are not regular hosts (because of the previous point). Our solution [here](infra/tchatter-app-nodes.yml).

**Redis**: messages seem lost if there is no consumer