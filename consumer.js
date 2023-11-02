require('dotenv').config()

// const axios = require('axios')
// const { Kafka } = require('kafkajs')
// const { Order } = require('./schema')
const kafka = require('./kafka')

// const LINE_API_PUSH_MESSAGE_URL = 'https://api.line.me/v2/bot/message/push'
// const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN

const consumer = kafka.consumer({ groupId: 'message-group' })

const run = async () => {
	await consumer.connect()
	await consumer.subscribe({ topic: 'message-order', fromBeginning: true })
	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			console.log('===> consumer message : ', {
				"Topic": topic,
				"Partition": partition,
				"Offset": message.offset,
				"Value": JSON.parse(message.value.toString())
			})

			// * Make business something..
			/* const messageData = JSON.parse(message.value.toString())
			const headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
			}

			const body = {
				'to': messageData.userId,
				'messages': [
					{
						'type': 'text',
						'text': `Buy product: ${messageData.productName} successful!`
					}
				]
			}

			try {
				const response = await axios.post(LINE_API_PUSH_MESSAGE_URL, body, { headers })
				console.log('===> LINE log', response.data)

				// * send message complete = update order
				await Order.update({ status: 'success' }, { where: { id: messageData.orderId } })
			} catch (error) {
				console.log('error', error.response.data)
			} */
		}
	})
}

run().catch(console.error)