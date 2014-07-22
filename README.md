# Tchatter

A simple chat application to gather many buzzwords and play with Node/Express, Angular, SockJS, Mocha, Chai, WebDriverJS, Docker, Redis, Ansible, Vagrant...

Bootstrapped From Yearofmoo's AngularJS Seed: A starter AngularJS repository for getting started with AngularJS. Includes helpful unit testing tools, Protractor integration and coverage testing.

## Installation

1. `npm install -g grunt-cli`
2. `npm install`
3. `grunt install`

## Development

1. `grunt dev`
2. Go to: `http://localhost:8080`

## Testing

### Run all tests with
`grunt test` 

### Unit Testing

#### Single run tests
`grunt test:unit` 

#### Auto watching tests
`grunt autotest:unit`

### End to End Testing (Protractor)

#### Single run tests
`grunt test:e2e` 

#### Auto watching tests
`grunt autotest:e2e`

### Coverage Testing

`grunt coverage`

## Vagrant installation
`vagrant up`

## Launching redis-server (needs Vagrant running)
```
cd infra
ansible-playbook -i inventories/dev redis-server.yml
```
