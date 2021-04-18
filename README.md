## Problem

The booking system has the following functionalities:

● Users can see meeting rooms availability

● Users can book meeting rooms by the hour (first come first served)

● Users can cancel their own reservations

## Solution Architecture

![GitHub Logo](/images/archi.PNG)


## Prerequisites

Ganache CLI v6.12.2

Node v12.20.1

MongoDB shell version v4.4.4



## Project setup

#### RabbitMQ setup
````
docker pull rabbitmq:3-management
````


````
docker run --rm -it --hostname my-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management

````

#### Terminal 1
run ganache cli beforehand
````
ganache-cli
````

Compile and deploy smart contracts
````
cd app; truffle migrate --reset --compile-all
````

````
npm install
````

````
npm run start
````

#### Terminal 2
````
cd booking-worker
````

````
npm install
````

````
npm run start
````

#### Terminal 3
````
cd cancel-worker
````

````
npm install
````

````
npm run start
````

