const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/get-time", async (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res.status(400).json({ error: "Please enter a country name." });
  }

  try {
    // Make sure this line has NO hidden line breaks:
    const response = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
    const countryData = response.data[0];

    if (!countryData || !countryData.timezones) {
      return res.status(404).json({ error: "Timezone not found for this country." });
    }

    const countryTimezone = countryData.timezones[0];
    const countryTime = dayjs().tz(countryTimezone).format("HH:mm:ss");
    const currentDay = dayjs().tz(countryTimezone).format("dddd, MMM D, YYYY");

    res.json({
      country: countryData.name.common,
      timezone: countryTimezone,
      time: countryTime,
      date: currentDay,
    });
  } catch (error) {
    // Print the real error for debugging
    console.error("Backend error:", error.message);
    res.status(500).json({ error: "Error fetching timezone. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
