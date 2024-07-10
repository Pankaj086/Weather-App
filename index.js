let userTab = document.querySelector('.tab-user-weather');
let searchTab = document.querySelector('.tab-search-weather');
let userContainer = document.querySelector('.weather-container');
let grantLocation = document.querySelector('.grant-location');
let grantBtn = document.querySelector('[data-grant]');
let searchForm = document.querySelector('.form-container');
let loadingScreen = document.querySelector('.loading-container');
let userInfoContainer = document.querySelector(".user-info-container");
let errorScreen = document.querySelector(".errorPage");

const API_key = 'e70a9b280df37f3e7a77b6f298a8d835';

let currentTab = userTab;
getYourWeather();

currentTab.classList.add('current-tab');

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');
    }

    if (!searchForm.classList.contains('active')) {
        userInfoContainer.classList.remove('active');
        grantLocation.classList.remove('active');
        searchForm.classList.add('active');
        errorScreen.classList.remove('active');
    } else {
        searchForm.classList.remove('active');
        errorScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');

        // in the your weather tab
        getYourWeather();
    }
}

userTab.addEventListener('click', () => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

async function getYourWeather() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    console.log("localCoordinates:", localCoordinates); // Add logging

    if (!localCoordinates) {
        // loadingScreen.classList.remove('active');
        grantLocation.classList.add('active');
    } 
    else {
        const coordinates = JSON.parse(localCoordinates);
        console.log("Parsed coordinates:", coordinates); // Add logging
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    if (!coordinates) {
        console.error("Coordinates are undefined or null");
        return;
    }

    const { lat, lon } = coordinates;
    console.log("Latitude:", lat, "Longitude:", lon); // Add logging

    grantLocation.classList.remove('active');
    loadingScreen.classList.add('active');
    // grantLocation.classList.add('deactive');

    try {
        let data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);
        data = await data.json();

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove('active');
        console.error(err); // Log the error for debugging
    }
}

function renderWeatherInfo(data) {
    let cityName = document.querySelector('[data-cityName]');
    let countryIcon = document.querySelector('[data-country-icon]');
    let weatherType = document.querySelector('[data-weatherType]');
    let weatherTypeImg = document.querySelector('[data-weatherImg]');
    let tempVal = document.querySelector('[data-temp]');
    let speedVal = document.querySelector('.data-speed');
    let humidVal = document.querySelector('.data-humid');
    let cloudVal = document.querySelector('.data-cloud');

    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weatherType.innerText = data?.weather?.[0]?.main;
    weatherTypeImg.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`; // Corrected from scr to src
    tempVal.innerText = ((data?.main?.temp)-273.15).toFixed(2) + " °C";
    speedVal.innerText = data?.wind?.speed + "m/s";
    humidVal.innerText = data?.main?.humidity + "%";
    cloudVal.innerText = data?.clouds?.all + "%"; 
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        // grantLocation.classList.add('deactive');
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("No Geolocation Support Available");
    }
});

let searchInput = document.querySelector('[data-searchInput]'); // Corrected from seachInput to searchInput

async function fetchSearchWeatherInfo(city) {
    userInfoContainer.classList.remove('active');
    grantLocation.classList.remove('active');
    loadingScreen.classList.add('active');

    // try {
    //     // let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
    //     // let data = await response.json();

    //     // loadingScreen.classList.remove('active');
    //     // userInfoContainer.classList.add('active');
    //     // renderWeatherInfo(data);
    //     let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
    //     console.log(`Response status: ${response.status}`); // Log response status
    //     let data = await response.json();
    //     // console.log('Data received:', data); // Log the data received
    //     // console.log(data.message);

    //     if(data.message === "city not found"){
    //         loadingScreen.classList.remove('active');
    //         userInfoContainer.classList.remove('active');
    //         errorScreen.classList.add('active');
    //     }
    //     else{
    //         errorScreen.classList.remove('active');
    //         userInfoContainer.classList.add('active');
    //     }

    // } 
    // catch(err){
    //     // loadingScreen.classList.remove('active');
    //     // userInfoContainer.classList.remove('active');
    //     // errorScreen.classList.add('active');
    //     // console.error(err); // Log the error for debugging
    // }
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
        let data = await response.json();

        if (!response.ok) {
            // If response is not OK, throw an error to be caught in the catch block
            throw new Error(data.message);
        }

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);

    } catch (err) {
        // console.error('Error caught:', err); // Log the error for debugging
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        errorScreen.classList.add('active');
    }
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let InputCity = searchInput.value; // Corrected from seachInput to searchInput

    if (InputCity !== "") { // Corrected from if(!InputCity=="") to if(InputCity !== "")
        fetchSearchWeatherInfo(InputCity);
        searchInput.value = "";
    }
});
