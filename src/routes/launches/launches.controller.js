const {
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
} = require("../../model/launches.model")
const { getPagination } = require("../../services/query")

async function httpGetAllLaunches(req, res) {
	const { skip, limit } = getPagination(req.query)

	return res.status(200).json(await getAllLaunches(skip, limit))
}

function httpAddNewLaunch(req, res) {
	const launch = req.body

	console.log(launch)

	if (
		!launch.mission ||
		!launch.rocket ||
		!launch.launchDate ||
		!launch.target
	) {
		res.status(400).json({
			error: "Missing required launch property.",
		})
	}

	launch.launchDate = new Date(launch.launchDate)

	if (isNaN(launch.launchDate)) {
		res.status(400).json({
			error: "Invalid Date.",
		})
	}

	scheduleNewLaunch(launch)
	res.status(201).json(launch)
}

async function httpAbortLaunch(req, res) {
	const launchId = Number(req.params.id)
	// console.log(existsLaunchWithId(launchId))

	if (!(await existsLaunchWithId(launchId))) {
		return res.status(404).json({
			error: "Launch not Found!",
		})
	}

	const aborted = await abortLaunchById(launchId)

	if (!aborted) {
		return res.status(400).json({ error: "Launch not aborted." })
	}

	return res.status(200).json(aborted)
}

module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
}
