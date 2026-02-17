// API-Ninjas weather endpoint
const apiKey = "0Q4pKa7B5xTArJnCHdkH2jDrRj9YEURNBbsYN5Fx";
const apiUrl = "https://api.api-ninjas.com/v1/weather?city=";

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const weatherIcon = document.getElementById('weather-icon');
const tempEl = document.getElementById('temp');
const cityNameEl = document.getElementById('city-name');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const errorEl = document.getElementById('error');

// Events
searchBtn.addEventListener('click', () => checkWeather(cityInput.value.trim()));
cityInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkWeather(cityInput.value.trim()); });

// Enhanced fetch + UI updates (loading state, detailed errors, dynamic background)
async function checkWeather(city){
  clearMessages();
  if(!city){ showError('Please enter a city name.'); return; }

  if(apiKey === 'YOUR_API_KEY_HERE'){
    showError('Replace `YOUR_API_KEY_HERE` in `script.js` with your OpenWeather API key to fetch live data.');
    return;
  }

  showLoading();
  try{
    const url = apiUrl + encodeURIComponent(city);
    console.log('Fetching:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Api-Key': apiKey }
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response body:', text);

    if(response.status === 400){ showError('Bad request — city name invalid or API format changed.'); return; }
    if(response.status === 401){ showError('Invalid API key — check `script.js`.'); return; }
    if(response.status === 404){ showError('City not found! ❌'); return; }
    if(response.status === 429){ showError('Rate limit reached — please try again later.'); return; }
    if(!response.ok){ showError(`Server error (${response.status}). Check browser console.`); return; }

    const data = JSON.parse(text);
    console.log('Parsed data:', data);
    updateUIFromData(data, city);

    // persist last successful city (convenience)
    try{ localStorage.setItem('lastCity', city); }catch(e){ /* ignore */ }
  }catch(err){
    console.error(err);
    showError('Network error. Check your connection.');
  }finally{
    hideLoading();
  }
}

function updateUIFromData(data, cityName){
  tempEl.textContent = `${Math.round(data.temp)}°C`;
  cityNameEl.textContent = cityName;
  humidityEl.textContent = `${data.humidity}%`;
  windEl.textContent = `${Math.round(data.wind_speed)} km/h`;

  // emoji icon based on weather type
  const wxType = data.type || 'Clear';
  weatherIcon.textContent = getWeatherEmoji(wxType);
  weatherIcon.alt = wxType;

  weatherDisplay.style.display = 'block';

  // dynamic background based on weather type
  setWeatherBackground(wxType);
}

function setWeatherBackground(condition){
  const cls = mapWeatherToClass(condition);
  const possible = ['clear','clouds','rain','snow','mist'];
  possible.forEach(c => document.body.classList.remove(c));
  if(cls) document.body.classList.add(cls);
}

function mapWeatherToClass(condition){
  const c = String(condition).toLowerCase();
  if(c.includes('clear') || c.includes('sunny')) return 'clear';
  if(c.includes('cloud')) return 'clouds';
  if(c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return 'rain';
  if(c.includes('snow')) return 'snow';
  if(c.includes('mist') || c.includes('haze') || c.includes('fog') || c.includes('smoke')) return 'mist';
  return 'clear';
}

function getWeatherEmoji(type){
  const t = String(type).toLowerCase();
  if(t.includes('sunny') || t.includes('clear')) return '☀️';
  if(t.includes('cloud')) return '☁️';
  if(t.includes('rain')) return '🌧️';
  if(t.includes('snow')) return '❄️';
  if(t.includes('thunder')) return '⛈️';
  if(t.includes('mist') || t.includes('haze') || t.includes('fog')) return '🌫️';
  return '🌤️';
}

function showLoading(){
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  searchBtn.classList.add('loading');
}
function hideLoading(){
  searchBtn.disabled = false;
  searchBtn.textContent = '🔍';
  searchBtn.classList.remove('loading');
}

function showError(msg){ errorEl.textContent = msg; errorEl.style.display = 'block'; weatherDisplay.style.display = 'none'; }
function clearMessages(){ errorEl.style.display = 'none'; errorEl.textContent = ''; }

// === bootstrap: auto-load last searched city if available ===
(function init(){
  const last = localStorage.getItem('lastCity');
  if(last){ cityInput.value = last; checkWeather(last); }
})();
