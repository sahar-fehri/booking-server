

## Solution Architecture :bulb:

![GitHub Logo](/images/archi.PNG)


## Prerequisites :white_check_mark:

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

in another terminal : run ganache cli beforehand
````
ganache-cli
````

#### Terminal 1
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

