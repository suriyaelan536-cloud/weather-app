const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const message = document.querySelector("#message");
const weatherCard = document.querySelector("#weather-card");

const weatherDescriptions = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Heavy thunderstorm with hail", "⛈️"]
};

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not contact the city search service.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not get weather right now. Please try again.");
  return response.json();
}

function displayWeather(place, data) {
  const current = data.current;
  const [description, icon] = weatherDescriptions[current.weather_code] || ["Weather conditions", "🌡️"];
  const country = place.country ? `, ${place.country}` : "";

  document.querySelector("#location-label").textContent = `${place.name}${country}`;
  document.querySelector("#local-time").textContent = `Local time: ${current.time.replace("T", " ")}`;
  document.querySelector("#weather-icon").textContent = icon;
  document.querySelector("#temperature").textContent = `${Math.round(current.temperature_2m)}°`;
  document.querySelector("#condition").textContent = description;
  document.querySelector("#feels-like").textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
  document.querySelector("#humidity").textContent = `${current.relative_humidity_2m}%`;
  document.querySelector("#wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.querySelector("#detail-feels").textContent = `${Math.round(current.apparent_temperature)}°C`;

  weatherCard.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";
  weatherCard.hidden = true;
  showMessage("Looking up the city and current weather...");

  try {
    const place = await getCoordinates(city);
    const data = await getWeather(place.latitude, place.longitude);
    displayWeather(place, data);
    showMessage("Here is the latest weather data available.");
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.", true);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});
