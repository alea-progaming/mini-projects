/************************************************
 * MAPPING: UTC Offsets to IANA Time Zones
 ***********************************************/
const offsetToIanaMap = {
  "UTC+08:00": "Asia/Manila",
  "UTC+09:00": "Asia/Tokyo",
  "UTC-05:00": "America/New_York",
  "UTC-08:00": "USA/Canada"
  // Add more mappings as needed
};

/************************************************
 * MAIN LOGIC: Fetch Timezone, Map if Needed, Toggle Views, and Update Clock
 ***********************************************/
document.getElementById("search").addEventListener("click", async () => {
  // Get the country name from the input field
  const countryName = document.getElementById("countryInput").value.trim();
  if (!countryName) {
    alert("Please enter a country name.");
    return;
  }

  try {
    // Fetch the timezone from REST Countries API
    const { fetchedTimezone, countryCommon } = await fetchTimezone(countryName);
    console.log("Fetched Timezone:", fetchedTimezone);

    // Map the fetched timezone if it's a UTC offset
    const mappedTimezone = getMappedTimezone(fetchedTimezone);

    // For display, format it as "Continent / Country" if possible
    const displayTimezone = formatCoountryDisplay(mappedTimezone, countryCommon);

    // Toggle the view: hide input, show clock
    document.getElementById("inputContainer").classList.add("hidden");
    document.getElementById("clockContainer").classList.remove("hidden");

    // Update the displayed timezone text
    document.getElementById("countryDisplay").innerText = displayTimezone;

    // Start updating the clock every second using the mapped timezone
    updateClock(mappedTimezone);
    setInterval(() => updateClock(mappedTimezone), 1000);
  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching timezone. Please try again.");
  }
});


/************************************************
 * FETCH TIMEZONE FROM REST COUNTRIES
 ***********************************************/
async function fetchTimezone(countryName) {
  const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  // Check if the API returned valid data with a timezone array
  if (!data || data.status === 404 || !data[0].timezones) {
    throw new Error("Timezone not found for this country.");
  }

  // Extract the first timezone (could be IANA or offset) and the country's common name
  const fetchedTimezone = data[0].timezones[0];
  const countryCommon = data[0].name.common; // e.g., "Philippines"
  return { fetchedTimezone, countryCommon };
}


/************************************************
 * MAP THE FETCHED TIMEZONE IF IT'S A UTC OFFSET
 ***********************************************/
function getMappedTimezone(tzString) {
  // If tzString starts with "UTC", try to map it to an IANA zone using our dictionary
  if (tzString.toUpperCase().startsWith("UTC")) {
    const mapped = offsetToIanaMap[tzString];
    return mapped ? mapped : tzString; // Return mapped value if found; otherwise, return the original offset string.
  } else {
    // Otherwise, assume it's already a valid IANA time zone identifier
    return tzString;
  }
}


/************************************************
 * FORMAT TIMEZONE DISPLAY STRING
 * Example: If mappedTimezone is "Asia/Manila" and countryCommon is "Philippines",
 * output "Asia / Philippines"
 ***********************************************/
function formatCoountryDisplay(mappedTimezone, countryCommon) {
  // If mappedTimezone is in IANA format (contains "/"), use the continent part with the country name.
  if (mappedTimezone.includes("/")) {
    const [continent] = mappedTimezone.split("/");
    return `${continent} / ${countryCommon}`;
  }
  // Otherwise, fallback to using the mappedTimezone value as-is.
  return mappedTimezone;
}


/************************************************
 * UPDATE THE CLOCK EVERY SECOND USING DAY.JS
 ***********************************************/
function updateClock(tzOrOffset) {
  const now = getDayjsForZone(tzOrOffset);
  document.getElementById("timeDisplay").innerText = now.format("HH:mm:ss");
  document.getElementById("dateDisplay").innerText = now.format("dddd, MMM D, YYYY");
}


/************************************************
 * GET A DAYJS OBJECT FOR A GIVEN TIMEZONE OR OFFSET
 ***********************************************/
function getDayjsForZone(tzOrOffset) {
  if (tzOrOffset.toUpperCase().startsWith("UTC")) {
    return dayjs().utcOffset(parseOffsetToMinutes(tzOrOffset));
  } else {
    return dayjs().tz(tzOrOffset);
  }
}


/************************************************
 * PARSE OFFSET STRING (e.g., "UTC+08:00") TO MINUTES
 ***********************************************/
function parseOffsetToMinutes(utcString) {
  const offsetStr = utcString.replace("UTC", "").trim(); // e.g., "+08:00"
  const [hourPart, minutePart] = offsetStr.split(":");
  const hours = parseInt(hourPart, 10);
  const minutes = parseInt(minutePart || "0", 10);
  const totalMinutes = hours * 60 + Math.sign(hours) * minutes;
  return totalMinutes;
}
