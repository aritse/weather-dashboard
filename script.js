const keyOpenWeather = "37300038cc70b396e019d4f86fd98ae4";
const apiWeather = "http://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + keyOpenWeather;
const apiForecast = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=" + keyOpenWeather;
const apiUVI = "http://api.openweathermap.org/data/2.5/uvi?appid=" + keyOpenWeather;
const baseUrlIcon = "http://openweathermap.org/img/wn/";

function forecast5Days(lat, lon, city) {
  var today = moment();
  var url = apiForecast;
  url += city ? `&q=${city},us` : `&lat=${lat}&lon=${lon}`;
  $.ajax({ url: url, method: "get" }).then(res => {
    for (let i = 0; i < 5; i++) {
      const midday = res.list[i * 8 + 4];
      const date = today.add(i + 1, "days");
      const li = $("#day" + (i + 1));

      $(`#forecast li:nth-child(${i + 1}) div.date`).text(date.format("MM/DD/YYYY"));
      $(`#forecast li:nth-child(${i + 1}) div.temp`).text("Temp: " + midday.main.temp.toFixed(2) + "F");
      $(`#forecast li:nth-child(${i + 1}) div.humidity`).text("Humidity: " + midday.main.humidity.toFixed(2) + "%");
      const urlIcon = baseUrlIcon + midday.weather[0].icon + "@2x.png";
      $(`#forecast li:nth-child(${i + 1}) div.icon img`).attr("src", urlIcon);
    }
  });
}

function currentWeather(lat, lon, city) {
  var today = moment();
  var url = apiWeather;
  url += city ? `&q=${city}` : `&lat=${lat}&lon=${lon}`;
  $.ajax({ url: url, method: "get" }).then(res => {
    [lat, lon] = [res.coord.lat, res.coord.lon];

    $("#current-city").text(res.name);
    $("#current-date").text(today.format("MM/DD/YYYY"));
    $("#current-temp").text(res.main.temp.toFixed(1) + "F");
    $("#current-humidity").text(res.main.humidity + "%");
    $("#wind-speed").text(res.wind.speed.toFixed(1) + "MPH");

    const urlIcon = baseUrlIcon + res.weather[0].icon + "@2x.png";
    $("#current-weather-icon").attr("src", urlIcon);

    url = apiUVI + `&lat=${lat}&lon=${lon}`;
    $.ajax({ url: url, method: "get" }).then(uv => {
      const index = uv.value.toFixed(2);
      const elem = $("#uv-index");
      if (index <= 2) elem.css("background-color", "green");
      else if (index <= 5) elem.css("background-color", "yellow");
      else if (index <= 7) elem.css("background-color", "orange");
      else if (index <= 10) elem.css("background-color", "red");
      else elem.css("background-color", "purple");
      elem.text(index);
    });
  });
}

function showWeather(event) {
  event.preventDefault();
  const city = $("#city").val();
  currentWeather(null, null, city);
  forecast5Days(null, null, city);
  var li = $("<li>").text(city);
  $("#cities").prepend(li);
}

function localWeather(position) {
  const latitude = position.coords.latitude.toFixed(2);
  const longitude = position.coords.longitude.toFixed(2);
  currentWeather(latitude, longitude, null);
  forecast5Days(latitude, longitude, null);
}

navigator.geolocation.getCurrentPosition(localWeather);
$("#city-search").submit(showWeather);
