const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const apiv1 = require("./routes/apiv1")

const app = express()

app.use(
	cors({
		origin: "http://localhost:3000",
	})
)
app.use(morgan("combined"))
app.use(express.json())
app.use("/v1", apiv1)

module.exports = app
