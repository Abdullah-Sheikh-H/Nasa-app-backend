// const express = require("express")

// const app = express()

// app.listen()
require("dotenv").config()
const http = require("http")
const app = require("./app.js")
const { loadPlanetsData } = require("../src/model/planets.model")
const { loadLaunchData } = require("../src/model/launches.model")
const { startMongo } = require("./services/mongo")

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

async function startServer() {
	await startMongo()
	await loadLaunchData()
	await loadPlanetsData()
	server.listen(PORT, () => {
		console.log("Listening to", PORT)
	})
}
startServer()
