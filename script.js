const apiKey = "911a4ff25a8af049e05631fcc7257cc1"; // Replace with your OpenWeatherMap API key

// Get weather by city name
function getWeather() {
    const city = document.getElementById("city").value;
    if (city === "") {
        alert("Please enter a city name");
        return;
    }
    fetchWeatherData(`q=${city}`);
}

// Get weather by user's location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherData(`lat=${lat}&lon=${lon}`);
        }, () => {
            alert("Location access denied!");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Fetch current weather, forecast, and AQI
function fetchWeatherData(query) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${query}&units=metric&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchAQI(data.coord.lat, data.coord.lon);
        })
        .catch(error => console.error("Error fetching current weather:", error));

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error("Error fetching forecast:", error));
}

// Fetch AQI data
function fetchAQI(lat, lon) {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    fetch(aqiUrl)
        .then(response => response.json())
        .then(data => displayAQI(data.list[0].main.aqi))
        .catch(error => console.error("Error fetching AQI:", error));
}

// Display AQI
function displayAQI(aqi) {
    const aqiLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const aqiColors = ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#8e44ad"];
    const level = aqiLevels[aqi - 1];
    const color = aqiColors[aqi - 1];

    document.getElementById("aqi-info").innerHTML = `
        <p>AQI Level: <span style="color:${color}; font-weight:bold;">${level}</span></p>
    `;
}

// Display current weather
function displayCurrentWeather(data) {
    if (data.cod !== 200) {
        document.getElementById("weather-info").innerHTML = "City not found!";
        return;
    }

    const weatherDesc = data.weather[0].description;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    document.getElementById("weather-info").innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <img src="${icon}" alt="${weatherDesc}">
        <p>Temperature: ${temp}°C</p>
        <p>Weather: ${weatherDesc}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
}

// Display 5-day forecast
function displayForecast(data) {
    let forecastHTML = "<h3>5-Day Forecast</h3><div class='forecast-container'>";
    const dailyForecasts = {};

    data.list.forEach(entry => {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = entry;
        }
    });

    for (let date in dailyForecasts) {
        const entry = dailyForecasts[date];
        const temp = entry.main.temp;
        const weatherDesc = entry.weather[0].description;
        const icon = `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`;

        forecastHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <img src="${icon}" alt="${weatherDesc}">
                <p>${temp}°C</p>
                <p>${weatherDesc}</p>
            </div>
        `;
    }

    forecastHTML += "</div>";
    document.getElementById("forecast-info").innerHTML = forecastHTML;
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}
