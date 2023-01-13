const mongoose = require("mongoose")

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once("open", () => {
	console.log("server is ready")
})

mongoose.connection.on("error", (err) => {
	console.error(err)
})

async function startMongo() {
	await mongoose.connect(MONGO_URL, {
		useNewUrlParser: true,
		// useFindAndModify: false,
		// useCreateIndex: true,
		useUnifiedTopology: true,
	})
}

module.exports = { startMongo }
