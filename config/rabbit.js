require('dotenv').config();

const amqp = require('amqplib');

// RabbitMQ connection string
const messageQueueConnectionString = process.env.RABBITMQ_URL;

async function setup() {
    console.log("Setting up RabbitMQ Exchanges/Queues", messageQueueConnectionString);
    // connect to RabbitMQ Instance
    let connection = await amqp.connect(messageQueueConnectionString);

    // create a channel
    let channel = await connection.createChannel();

    // create exchange
    await channel.assertExchange("processing", "direct", { durable: true });

    // create queues
    await channel.assertQueue("processing.requests", { durable: true });
    await channel.assertQueue("processing.results", { durable: true });

    // bind queues
    await channel.bindQueue("processing.requests","processing", "request");
    await channel.bindQueue("processing.results","processing", "result");

    console.log("Setup Rabbit DONE successfully ");

}


module.exports.setup = setup;
