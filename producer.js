const express = require('express')
const kafka = require('./kafka')
const { Order, Product, sequelize } = require('./schema')

const app = express()
const port = 4000
const producer = kafka.producer()

app.use(express.json())

app.post('/api/create-product', async (req, res) => {
	const productData = req.body
	try {
		const product = await Product.create(productData)
		res.json(product)
	} catch (error) {
		res.json({
			message: 'something wrong',
			error
		})
	}
})

app.post('/api/placeorder', async (req, res) => {
	try {
		const { productId, userId } = req.body
		const product = await Product.findOne({
			where: {
				id: productId
			}
		})

		if (product.amount <= 0) {
			res.json({ message: 'product out of stock' })
			return false
		}

		product.amount -= 1
		await product.save()

		// * create order with status pending
		const order = await Order.create({
			userLineUid: userId,
			productId: product.id,
			status: 'pending'
		})

		const orderData = {
			userId,
			productName: product.name,
			orderId: order.id
		}

		await producer.connect()
		await producer.send({
			topic: 'message-order',
			messages: [{
				value: JSON.stringify(orderData)
			}],
		})
		await producer.disconnect()

		res.json({
			message: `buy product ${product.name} successful. waiting message for confirm.`
		})
	} catch (error) {
		res.json({
			message: 'something wront',
			error
		})
	}
})

app.listen(port, async () => {
	await sequelize.sync()
	await producer.connect()
	console.log(`Express app listening at on port ${port}`)
})