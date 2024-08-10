document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'aff7ea14ef76b902cc764977cd0ad168'; 
    const searchButton = document.getElementById('search-button');
    const cityInput = document.getElementById('city-input');
    const currentWeatherDetails = document.getElementById('current-weather-details');
    const forecastCards = document.getElementById('forecast-cards');
    const historyList = document.getElementById('history-list');

    // Load search history from localStorage
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Function to fetch weather data
    async function fetchWeatherData(city) {
        try {
            // Get coordinates for the city
            const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
            const geoData = await geoResponse.json();
            if (geoData.length === 0) {
                alert('City not found');
                return;
            }
            const { lat, lon } = geoData[0];

            // Fetch weather data with imperial units (Fahrenheit and mph)
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
            const weatherData = await weatherResponse.json();

            // Display current weather and forecast
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);

            // Update search history
            updateSearchHistory(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Function to display current weather
    function displayCurrentWeather(data) {
        const current = data.list[0];
        currentWeatherDetails.innerHTML = `
            <center><h1 style="color: #FFA500;">${data.city.name}</h1>
            <p>Date: ${new Date(current.dt * 1000).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
            <p>Temperature: ${current.main.temp.toFixed(1)} °F</p>
            <p>Humidity: ${current.main.humidity}%</p>
            <p>Wind Speed: ${current.wind.speed.toFixed(1)} mph</p></center>
        `;
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
        forecastCards.innerHTML = '';
        for (let i = 0; i < data.list.length; i += 8) {
            const forecast = data.list[i];
            const card = document.createElement('div');
            card.classList.add('forecast-card');
            card.innerHTML = `
                <p>Date: ${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p>Temperature: ${forecast.main.temp.toFixed(1)} °F</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
                <p>Wind Speed: ${forecast.wind.speed.toFixed(1)} mph</p>
            `;
            forecastCards.appendChild(card);
        }
    }

    // Function to update search history
    function updateSearchHistory(city) {
        if (!searchHistory.includes(city)) {
            searchHistory.push(city);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            renderSearchHistory();
        }
    }

    // Function to render search history
    function renderSearchHistory() {
        historyList.innerHTML = '';
        searchHistory.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => fetchWeatherData(city));
            historyList.appendChild(li);
        });
    }

    // Event listener for the search button
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            cityInput.value = '';
        }
    });

    // Render initial search history
    renderSearchHistory();
});