const express = require("express"); // web server to handle request
const cors = require("cors"); // allows frontend to access backend
const axios = require("axios"); // to fetch timezone data from external API
const dayjs = require("dayjs"); //for timezone-based time formatting

// import Day.js plugins
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Route to get timezone based on country name
app.get("/get-time", async (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res.status(400).json({ error: "Please enter a country name." });
  }

  try {
    // Fetch country details from API
    const response =
      await axios.get(`https://restcountries.com/v3.1/name/${country}
`);
    const countryData = response.data[0];

    if (!countryData || !countryData.timezones) {
      return res
        .status(404)
        .json({ error: "Timezone not found for this country." });
    }

    // Extract the first timezone from the response
    const countryTimezone = countryData.timezones[0];

    // Get the current time in the retrieved timezone
    const countryTime = dayjs().tz(countryTimezone).format("HH:mm:ss");
    const currentDay = dayjs().tz(countryTimezone).format("dddd, MMM D, YYYY");
    res.json({
      country: countryData.name.common,
      timezone: countryTimezone,
      time: countryTime,
      date: currentDay,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching timezone. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
