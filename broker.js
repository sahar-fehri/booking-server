const amqp = require('amqplib');


/**
 * @var {Promise<MessageBroker>}
 */
let instance;

/**
 * Broker for async messaging
 */
class MessageBroker {
    /**
     * Initialize connection to rabbitMQ
     */
    async init() {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
        this.channel = await this.connection.createConfirmChannel()
        this.cancelChannel = await this.connection.createConfirmChannel()
        /**************** setting up exchanges and queues ****************/
        await this.channel.assertExchange("processing", "direct", { durable: true });

        // create queues
        await this.channel.assertQueue("processing.book", { durable: true });
        await this.cancelChannel.assertQueue("processing.cancel", { durable: true });

        // bind queues
        await this.channel.bindQueue("processing.book","processing", "book");
        await this.cancelChannel.bindQueue("processing.cancel","processing", "cancel");

        console.log("Setup Rabbit DONE successfully ");
        return this
    }
}

/**
 * @return {Promise<MessageBroker>}
 */
MessageBroker.getInstance = async function() {
    if (!instance) {
        const broker = new MessageBroker()
        instance = broker.init()
    }
    return instance
};

module.exports = MessageBroker