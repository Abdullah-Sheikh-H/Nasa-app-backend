const express = require("express")
const planetsRouter = require("./planets/planets.router")
const launchesRouter = require("./launches/launches.router")

const apiv1 = express.Router()

apiv1.use("/planets", planetsRouter)
apiv1.use("/launches", launchesRouter)

module.exports = apiv1
