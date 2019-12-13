const key = "37300038cc70b396e019d4f86fd98ae4"; // openweather
const key2 = "AIzaSyAOtVgodEW3JPEK2tlDLr4jv7hth0B5COE"; // google
const baseUrlWeather = "http://api.openweathermap.org/data/2.5/weather";
const baseUrlIcon = "http://openweathermap.org/img/wn/";
const baseUrlUV = "http://api.openweathermap.org/data/2.5/uvi";
const baseUrlForecast = "http://api.openweathermap.org/data/2.5/forecast";
const baseUrlGoogle = "https://maps.googleapis.com/maps/api/js";

function currentWeather(lat, lon) {
  var urlWeather = baseUrlWeather + "?lat=" + lat + "&lon=" + lon + "&appid=" + key + "&units=imperial";
  $.ajax({ url: urlWeather, method: "get" }).then(res => {
    $("#current-city-span").text(res.name);
    urlIcon = baseUrlIcon + res.weather[0].icon + "@2x.png";
    $("#weather-icon").attr({ src: urlIcon, alt: "weather icon" });
    $("#current-date-span").text(moment().format("(MM/DD/YYYY)"));
    $("#temperature-span").text(res.main.temp.toFixed(1) + " F");
    $("#humidity-span").text(res.main.humidity + "%");
    $("#wind-speed-span").text(res.wind.speed.toFixed(1) + " MPH");
  });

  var urlUv = baseUrlUV + "?lat=" + lat + "&lon=" + lon + "&appid=" + key;
  $.ajax({ url: urlUv, method: "get" }).then(res => {
    var uvIndex = res.value.toFixed(2);
    var element = $("#uv-index-span");
    if (uvIndex <= 2) element.css("background-color", "green");
    else if (uvIndex <= 5) element.css("background-color", "yellow");
    else if (uvIndex <= 7) element.css("background-color", "orange");
    else if (uvIndex <= 10) element.css("background-color", "red");
    else element.css("background-color", "purple");
    element.css("color", "white");
    element.text(uvIndex);
  });
}

function forecast(lat, lon) {
  var urlForecast = baseUrlForecast + "?lat=" + lat + "&lon=" + lon + "&appid=" + key + "&units=imperial";
  $.ajax({ url: urlForecast, method: "get" }).then(res => {
    for (let i = 1; i < 6; i++) {
      const day = res.list[(i - 1) * 8 + 4];
      var date = moment().add(i, "days");
      date = date.format("MM/DD/YYYY");
      var li = $("<li>").attr("id", "day" + i);
      li.append(
        $("<div>")
          .addClass("date")
          .text(date)
      );
      var urlIcon = baseUrlIcon + day.weather[0].icon + "@2x.png";
      var img = $("<img>")
        .attr("src", urlIcon)
        .attr("attr", "weather icon");
      li.append(
        $("<div>")
          .addClass("icon")
          .append(img)
      );
      li.append(
        $("<div>")
          .addClass("temp")
          .text("Temp: " + day.main.temp.toFixed(2) + " F")
      );

      li.append(
        $("<div>")
          .addClass("humidity")
          .text("Humidity: " + day.main.humidity + "%")
      );
      $("#forecast-ul").append(li);
      console.log(day);
    }
  });
}

function showWeather(loc) {
  const [lat, lon] = [loc.coords.latitude.toFixed(2), loc.coords.longitude.toFixed(2)];
  currentWeather(lat, lon);
  forecast(lat, lon);
}

window.onload = navigator.geolocation.getCurrentPosition(showWeather);

$("#search-form").submit(event => {
  event.preventDefault();
  var city = $("input").val();
  console.log("Searching: ", city);
  currentWeather2(city);
  forecast2(city);
});

function currentWeather2(city) {
  var lat, lon;
  var urlWeather = baseUrlWeather + "?q=" + city + "&appid=" + key + "&units=imperial";
  $.ajax({ url: urlWeather, method: "get" }).then(res => {
    console.log(res);
    $("#current-city-span").text(res.name);
    urlIcon = baseUrlIcon + res.weather[0].icon + "@2x.png";
    $("#weather-icon").attr({ src: urlIcon, alt: "weather icon" });
    $("#current-date-span").text(moment().format("(MM/DD/YYYY)"));
    $("#temperature-span").text(res.main.temp.toFixed(1) + " F");
    $("#humidity-span").text(res.main.humidity + "%");
    $("#wind-speed-span").text(res.wind.speed.toFixed(1) + " MPH");
    lat = res.coord.lat;
    lon = res.coord.lon;
    console.log(lat, lon);
  });

  var urlUv = baseUrlUV + "?lat=" + lat + "&lon=" + lon + "&appid=" + key;
  $.ajax({ url: urlUv, method: "get" }).then(res => {
    var uvIndex = res.value.toFixed(2);
    var element = $("#uv-index-span");
    if (uvIndex <= 2) element.css("background-color", "green");
    else if (uvIndex <= 5) element.css("background-color", "yellow");
    else if (uvIndex <= 7) element.css("background-color", "orange");
    else if (uvIndex <= 10) element.css("background-color", "red");
    else element.css("background-color", "purple");
    element.css("color", "white");
    element.text(uvIndex);
  });
}

function forecast2(city) {
  var urlForecast = baseUrlForecast + "?q=" + city + "&appid=" + key + "&units=imperial";
  $.ajax({ url: urlForecast, method: "get" }).then(res => {
    for (let i = 1; i < 6; i++) {
      const day = res.list[(i - 1) * 8 + 4];
      var date = moment().add(i, "days");
      var li = $("#day" + i);

      date = date.format("MM/DD/YYYY");

      $(li + ">.date").text(date);
      var urlIcon = baseUrlIcon + day.weather[0].icon + "@2x.png";
      $(li + ">.icon>img").attr("src", urlIcon);
      $(li + ">.temp").text("Temp: " + day.main.temp.toFixed(2) + " F");
      $(li + ">.humidity").text("Temp: " + day.main.humidity.toFixed(2) + "%");

      console.log(day);
    }
  });
}
