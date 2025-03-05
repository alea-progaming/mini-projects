document.getElementById("search").addEventListener("click", async () => {
  const country = document.querySelector(".country-input").value.trim();

  if (!country) {
    alert("Please enter a country name.");
    return;
  }

  try {
    // Fetch timezone from the backend
    const response = await fetch(
      `http://localhost:3000/get-time?country=${encodeURIComponent(country)}`
    );
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Hide input screen & Show clock display
    document.querySelector(".input-container").style.display = "none";
    createClockDisplay(data);
  } catch (error) {
    alert("Error fetching time. Please try again.");
  }
});

// Function to dynamically create the clock display
function createClockDisplay(data) {
  const clockContainer = document.createElement("div");
  clockContainer.classList.add("clock-container");

  clockContainer.innerHTML = `
        <div class="item-container">
            <div class="country">
                <p>${data.timezone}</p>
            </div>
            <div class="time"><p id="clock">${data.time}</p></div>
            <div class="date"><p id="date">${data.date}</p></div>
        </div>
    `;

  document.body.appendChild(clockContainer);

  // Update the time every second
  setInterval(() => {
    updateTime(data.timezone);
  }, 1000);
}

// Function to update the time every second
async function updateTime(timezone) {
  const response = await fetch(
    `http://localhost:3000/get-time?country=${timezone}`
  );
  const data = await response.json();

  if (!data.error) {
    document.getElementById("clock").innerText = data.time;
    document.getElementById("date").innerText = data.date;
  }
}
