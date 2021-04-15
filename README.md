## Project setup
````
docker pull rabbitmq:3-management
````


````
docker run --rm -it --hostname my-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management

````

#### Terminal 1
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