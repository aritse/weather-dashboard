const keyOpenWeather = "37300038cc70b396e019d4f86fd98ae4";
const apiWeather = "http://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + keyOpenWeather;
const apiForecast = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=" + keyOpenWeather;
const apiUVI = "http://api.openweathermap.org/data/2.5/uvi?appid=" + keyOpenWeather;
const baseUrlIcon = "http://openweathermap.org/img/wn/";

function handle(event) {
  event.preventDefault();
  const city = $("#city").val();
  currentWeather(null, null, city);
  forecast(null, null, city);
}

function showWeather(position) {
  const latitude = position.coords.latitude.toFixed(2);
  const longitude = position.coords.longitude.toFixed(2);
  currentWeather(latitude, longitude, null);
  forecast(latitude, longitude, null);
}

function currentWeather(lat, lon, city) {
  // console.log("lat: ", lat, " lon: ", lon, " city: ", city);
  var url = apiWeather;
  url += city ? `&q=${city}` : `&lat=${lat}&lon=${lon}`;
  // console.log("weather url: ", url);
  $.ajax({ url: url, method: "get" }).then(res => {
    [lat, lon] = [res.coord.lat, res.coord.lon];
    city = res.name;
    // console.log("city name: ", city);

    $("#current-city").text(city);
    console.log("Today: ", today.format("MM/DD/YYYY"));
    $("#current-date").text(today.format("MM/DD/YYYY"));
    $("#current-temp").text(res.main.temp.toFixed(1) + "F");
    $("#current-humidity").text(res.main.humidity + "%");
    $("#wind-speed").text(res.wind.speed.toFixed(1) + "MPH");

    const urlIcon = baseUrlIcon + res.weather[0].icon + "@2x.png";
    $("#current-weather-icon").attr("src", urlIcon);
  });

  url = apiUVI + `&lat=${lat}&lon=${lon}`;
  $.ajax({ url: url, method: "get" }).then(res => {
    const index = res.value.toFixed(2);
    const uv = $("#uv-index");
    if (index <= 2) uv.css("background-color", "green");
    else if (index <= 5) uv.css("background-color", "yellow");
    else if (index <= 7) uv.css("background-color", "orange");
    else if (index <= 10) uv.css("background-color", "red");
    else uv.css("background-color", "purple");
    uv.text(index);
  });
}

function forecast(lat, lon, city) {
  var url = apiForecast;
  url += city ? `&q=${city},us` : `&lat=${lat}&lon=${lon}`;

  $.ajax({ url: url, method: "get" }).then(res => {
    for (let i = 0; i < 5; i++) {
      const noon = res.list[i * 8 + 4];
      const date = today.add(i + 1, "days");
      const li = $("#day" + (i + 1));

      $(li + ">.date").text(date.format("MM/DD/YYYY"));
      $(li + ">.temp").text("Temp: " + noon.main.temp.toFixed(2) + "F");
      $(li + ">.humidity").text("Temp: " + noon.main.humidity.toFixed(2) + "%");

      const urlIcon = baseUrlIcon + noon.weather[0].icon + "@2x.png";
      $(li + ">.icon>img").attr("src", urlIcon);
    }
  });
}

var today = moment();
navigator.geolocation.getCurrentPosition(showWeather);
$("#city-search").submit(handle);
