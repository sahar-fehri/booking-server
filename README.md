## Project setup
````
docker pull rabbitmq:3-management
````


````
docker run --rm -it --hostname my-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management

````


````
npm install
````
````
cd app; truffle migrate --reset --compile-all
````

````
npm run start
````