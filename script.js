const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = "ec0bf3c7be59e4d4ddc5ee0876341115";
const UNIT = "imperial";

// DOM elements
const currCity = $("#current-city");
const currDate = $("#current-date");
const currIcon = $("#current-weather-icon");
const currTemp = $("#current-temp");
const currWind = $("#current-wind-speed");
const currHumidity = $("#current-humidity");
const currentUvi = $("#current-uv");
const searchForm = $("#search-form");
const cityInput = $("#search-city");
const cityList = $("#city-list");
const clearButton = $("#clear-button");
const currentLocation = $("#current-location");

const currentWeather = ({ coords }, city) => {
  let weatherUrl;
  if (city) {
    weatherUrl = BASE_URL + `/weather?appid=${API_KEY}&units=${UNIT}&q=${city}`;
  } else {
    weatherUrl = BASE_URL + `/weather?appid=${API_KEY}&units=${UNIT}&lat=${coords.latitude.toFixed(2)}&lon=${coords.longitude.toFixed(2)}`;
  }

  $.ajax(weatherUrl)
    .then(res => {
      const uviUrl = BASE_URL + `/uvi?appid=${API_KEY}&lat=${res.coord.lat}&lon=${res.coord.lon}`;
      $.ajax(uviUrl).then(uvi => renderCurrent(res, uvi));
    })
    .catch(err => console.log(err));
};

const renderCurrent = (data, uvi) => {
  uvi = uvi.value.toFixed(2);
  currCity.text(data.name);
  currDate.text(`(${moment().format("MMM DD, YYYY")})`);
  currIcon.attr("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
  currTemp.text(data.main.temp.toFixed() + "F");
  currWind.text(data.wind.speed.toFixed() + "MPH");
  currHumidity.text(data.main.humidity + "%");

  currentUvi.text(uvi);
  if (uvi <= 2) currentUvi.css("background-color", "green");
  else if (uvi <= 5) currentUvi.css("background-color", "orange");
  else currentUvi.css("background-color", "red");
};

const forecastWeather = ({ coords }, city) => {
  let forecastUrl;
  if (city) {
    forecastUrl = BASE_URL + `/forecast?appid=${API_KEY}&units=${UNIT}&q=${city}`;
  } else {
    forecastUrl = BASE_URL + `/forecast?appid=${API_KEY}&units=${UNIT}&lat=${coords.latitude.toFixed(2)}&lon=${coords.longitude.toFixed(2)}`;
  }

  $.ajax(forecastUrl)
    .then(res => renderForecast(res))
    .catch(err => console.log(err));
};

const renderForecast = forecast => {
  for (let i = 0; i < 5; i++) {
    const snapshot = forecast.list[i * 8];

    const date = moment()
      .add(i + 1, "days")
      .format("MM/DD/YYYY");

    const child = `#forecast div:nth-child(${i + 1})`;
    $(child + "> div .forecast-date").text(date);
    $(child + "> div .forecast-temp").text("Temp: " + snapshot.main.temp.toFixed() + "F");
    $(child + "> div .forecast-humidity").text("Humidity: " + snapshot.main.humidity + "%");
    $(child + "> div .forecast-icon").attr("src", `https://openweathermap.org/img/wn/${snapshot.weather[0].icon}@2x.png`);
  }
};

const getWeather = city => {
  currentWeather({}, city);
  forecastWeather({}, city);
};

const addToHistory = city => {
  const cities = JSON.parse(localStorage.getItem("history"));
  if (cities) {
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem("history", JSON.stringify(cities));
    }
  } else {
    localStorage.setItem("history", JSON.stringify([city]));
  }
};

const renderHistory = () => {
  cityList.empty();
  const cities = JSON.parse(localStorage.getItem("history"));
  if (cities.length > 0) {
    cities.forEach(city => {
      const li = $(`<li class="list-group-item p-0">`).html(`<button class="form-control" id="${city}">${city}</button>`);
      cityList.prepend(li);
    });
    getWeather(cities[cities.length - 1]);
  } else {
    getWeather("Seattle");
  }
};

searchForm.submit(event => {
  event.preventDefault();
  const city = cityInput
    .val()
    .trim()
    .toUpperCase();
  if (city) {
    cityInput.val("");
    getWeather(city);
    addToHistory(city);
    renderHistory();
  }
});

function handleClick() {
  const city = $(this).text();
  getWeather(city);
}

cityList.on("click", "button", handleClick);

clearButton.click(() => {
  localStorage.setItem("history", JSON.stringify([]));
  renderHistory();
});

currentLocation.click(() => {
  try {
    navigator.geolocation.getCurrentPosition(position => {
      currentWeather(position);
      forecastWeather(position);
    });
  } catch (error) {
    console.log(error);
  }
});

window.onload = renderHistory;
