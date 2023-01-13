const axios = require("axios")
const launches = require("./launches.mongo")
const planets = require("./planets.mongo")

// const launches = new Map()

let latestFlightNumber = 100

const launch = {
	flightNumber: 100,
	mission: "Kepler Exploration X",
	rocket: "Explorer IS1",
	launchDate: new Date("December 27, 2030"),
	target: "Kepler-442 b",
	customers: ["ZTM", "NASA"],
	upcoming: true,
	success: true,
}

saveLaunch(launch)

// launches.set(launch.flightNumber, launch)

async function findLaunch(filter) {
	return await launches.findOne(filter)
}

async function existsLaunchWithId(launchId) {
	return await launches.findOne({ flightNumber: launchId })
	// return launches.has(launchId)
}

async function getAllLaunches(skip, limit) {
	return await launches
		.find(
			{},
			{
				_id: 0,
				__v: 0,
			}
		)
		.sort({ flightNumber: 1 }) /*1 for accending, -1 for decending */
		.skip(skip)
		.limit(limit)
}

async function scheduleNewLaunch(launch) {
	const planet = await planets.findOne({ keplerName: launch.target })

	if (!planet) {
		throw new Error("No match planet found.")
	}

	let newFlightNumber = await getLatestFlightNumber()

	newFlightNumber++

	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["Zero to Mastery", "NASA"],
		flightNumber: newFlightNumber,
	})

	await saveLaunch(newLaunch)
}

// function addNewLaunch(launch) {
// 	latestFlightNumber++
// 	launches.set(
// 		latestFlightNumber,
// 		Object.assign(launch, {
// 			success: true,
// 			upcoming: true,
// 			customers: ["Zero to Mastery", "NASA"],
// 			flightNumber: latestFlightNumber,
// 		})
// 	)
// }

async function abortLaunchById(launchId) {
	const abortedLaunch = await launches.updateOne(
		{
			flightNumber: launchId,
		},
		{
			success: false,
			upcoming: false,
		}
	)

	return abortedLaunch.ok === 1 && abortedLaunch.nModified === 1
	// const aborted = launches.get(launchId)
	// aborted.success = false
	// aborted.upcoming = false
}

async function getLatestFlightNumber() {
	const latestFlight = await launches.findOne({}).sort("-flightNumber") // - will give the result in highest to lowest

	if (!latestFlight) {
		return latestFlightNumber
	}

	return latestFlight.flightNumber
}

async function saveLaunch(launch) {
	await launches.findOneAndUpdate(
		{ flightNumber: launch.flightNumber },
		launch,
		{
			upsert: true,
		}
	)
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches() {
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: "rocket",
					select: {
						name: 1,
					},
				},
				{
					path: "payloads",
					select: {
						customers: 1,
					},
				},
			],
		},
	})

	if (response.status !== 200) {
		console.log("Error in SpaceX")
		throw new Error("Launch data download failed")
	}

	// console.log(response.data)
	const launchDocs = response.data.docs

	for (const launchDoc of launchDocs) {
		const payloads = launchDoc["payloads"]
		const customers = payloads.flatMap((payload) => {
			return payload["customers"]
		})

		const launch = {
			flightNumber: launchDoc["flight_number"],
			mission: launchDoc["name"],
			rocket: launchDoc["rocket"]["name"],
			launchDate: launchDoc["date_local"],
			upcoming: launchDoc["upcoming"],
			success: launchDoc["success"],
			customers: customers,
		}
		console.log(launch.flightNumber)
		await saveLaunch(launch)
	}
}

async function loadLaunchData() {
	const foundLaunch = await findLaunch({
		flightNumber: 1,
		rocket: "Falcon 1",
		mission: "FalconSat",
	})

	if (foundLaunch) {
		console.log("Data already set.")
	} else {
		await populateLaunches()
	}
}

module.exports = {
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
	loadLaunchData,
}
