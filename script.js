const API_WEATHER = "https://api.openweathermap.org/data/2.5/weather?appid=37300038cc70b396e019d4f86fd98ae4&units=imperial";
const API_FORECAST = "https://api.openweathermap.org/data/2.5/forecast?appid=37300038cc70b396e019d4f86fd98ae4&units=imperial";
const API_UV_INDEX = "https://api.openweathermap.org/data/2.5/uvi?appid=37300038cc70b396e019d4f86fd98ae4&units=imperial";

window.onload = showSearchHistory;
navigator.geolocation.getCurrentPosition(fetchWeather);
$("#search-form").submit(searchCity);
$("#cities").on("click", "button", searchAgain);

function searchCity(event) {
  event.preventDefault();
  const city = $("#city-input").val();
  if (city) {
    $("#city-input").val("");
    fetchWeather(city.toUpperCase());
    addToSearchHistory(city);
    showSearchHistory();
  }
}

function searchAgain() {
  const city = $(this).text();
  fetchWeather(city);
}

function fetchWeather(loc) {
  var [city, lat, lon] = [null, null, null];

  if (typeof loc == "string") city = loc.toUpperCase();
  else [lat, lon] = [loc.coords.latitude.toFixed(2), loc.coords.longitude.toFixed(2)];

  currentWeather(lat, lon, city);
  forecastWeather(lat, lon, city);
}

function currentWeather(lat, lon, city) {
  const now = moment();
  var urlWeather = API_WEATHER;

  if (city) urlWeather += "&q=" + city;
  else urlWeather += "&lat=" + lat + "&lon=" + lon;

  $.ajax({ url: urlWeather, method: "get" }).then(response => {
    [lat, lon] = [response.coord.lat, response.coord.lon];

    $("#city").text(response.name);
    $("#now").text(now.format("(MM/DD/YYYY)"));
    $("#curr-temp").text(response.main.temp.toFixed(1) + "F");
    $("#curr-humid").text(response.main.humidity + "%");
    $("#wind").text(response.wind.speed.toFixed(1) + "MPH");

    const icon = response.weather[0].icon;
    $("#curr-icon").attr("src", `https://openweathermap.org/img/wn/${icon}@2x.png`);

    var urlUVIndex = API_UV_INDEX;
    urlUVIndex += "&lat=" + lat + "&lon=" + lon;
    $.ajax({ url: urlUVIndex, method: "get" }).then(response => {
      const index = response.value.toFixed(2);
      if (index <= 2) $("#uv").css("background-color", "green");
      else if (index <= 5) $("#uv").css("background-color", "#f6d55c");
      else if (index <= 7) $("#uv").css("background-color", "orange");
      else if (index <= 10) $("#uv").css("background-color", "red");
      else $("#uv").css("background-color", "purple");
      $("#uv").text(index);
    });
  });
}

function forecastWeather(lat, lon, city) {
  var date = moment();
  var urlForecast = API_FORECAST;

  if (city) urlForecast += "&q=" + city;
  else urlForecast += "&lat=" + lat + "&lon=" + lon;

  $.ajax({ url: urlForecast, method: "get" }).then(response => {
    for (let i = 1; i < 6; i++) {
      const li = `#forecast li:nth-child(${i})`;
      const snapshot = response.list[(i - 1) * 8];

      date = date.add(1, "days");
      const temp = snapshot.main.temp.toFixed(2);
      const humidity = snapshot.main.humidity.toFixed(0);
      const icon = snapshot.weather[0].icon;

      $(li + " .date").text(date.format("MM/DD/YYYY"));
      $(li + " .temp").text("Temp: " + temp + "F");
      $(li + " .humid").text("Humidity: " + humidity + "%");
      $(li + " .icon img").attr("src", `https://openweathermap.org/img/wn/${icon}@2x.png`);
    }
  });
}

function addToSearchHistory(city) {
  var cities = JSON.parse(localStorage.getItem("cities"));
  if (cities) {
    for (let i = 0; i < cities.length; i++) {
      if (city == cities[i]) return;
    }
    cities.push(city);
  } else cities = [city];

  localStorage.setItem("cities", JSON.stringify(cities));
}

function showSearchHistory() {
  const history = $("#cities").empty();
  const cities = JSON.parse(localStorage.getItem("cities"));
  if (cities) {
    cities.forEach(city => {
      const li = $("<li>").html(`<button id="button-${city.toLowerCase()}">` + city + "</button>");
      history.prepend(li);
    });
  }
}
