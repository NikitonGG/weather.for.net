// 1. Словарь погоды (Коды WMO -> Описание + Иконки + Тип анимации)
const WMO_MAP = {
    0:  { desc: 'Чистое небо', icon: '☀️', type: 'sun' },
    1:  { desc: 'В основном ясно', icon: '🌤️', type: 'sun' },
    2:  { desc: 'Переменная облачность', icon: '⛅', type: 'cloud' },
    3:  { desc: 'Пасмурно', icon: '☁️', type: 'cloud' },
    45: { desc: 'Туман', icon: '🌫️', type: 'cloud' },
    48: { desc: 'Оседающий туман', icon: '🌫️', type: 'cloud' },
    51: { desc: 'Легкая морось', icon: '🌦️', type: 'rain' },
    53: { desc: 'Умеренная морось', icon: '🌧️', type: 'rain' },
    55: { desc: 'Плотная морось', icon: '🌧️', type: 'rain' },
    61: { desc: 'Небольшой дождь', icon: '🌧️', type: 'rain' },
    63: { desc: 'Умеренный дождь', icon: '🌧️', type: 'rain' },
    65: { desc: 'Сильный проливной дождь', icon: '🌊', type: 'rain' },
    71: { desc: 'Небольшой снег', icon: '🌨️', type: 'snow' },
    73: { desc: 'Снегопад', icon: '❄️', type: 'snow' },
    75: { desc: 'Густой снегопад', icon: '❄️', type: 'snow' },
    77: { desc: 'Снежные зерна', icon: '❄️', type: 'snow' },
    80: { desc: 'Слабый ливень', icon: '🌦️', type: 'rain' },
    81: { desc: 'Сильный ливень', icon: '🌧️', type: 'rain' },
    85: { desc: 'Слабый снежный заряд', icon: '🌨️', type: 'snow' },
    95: { desc: 'Гроза', icon: '⛈️', type: 'rain' },
    96: { desc: 'Гроза с небольшим градом', icon: '⛈️', type: 'rain' }
};

// 2. DOM Элементы
const elements = {
    searchInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    geoBtn: document.getElementById('geo-btn'),
    cityTitle: document.getElementById('city-title'),
    weatherCondition: document.getElementById('weather-condition'),
    currentTemp: document.getElementById('current-temp'),
    feelsLike: document.getElementById('feels-like'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    uvIndex: document.getElementById('uv-index'),
    visibility: document.getElementById('visibility'),
    hourlyTrack: document.getElementById('hourly-container'),
    weeklyList: document.getElementById('weekly-container'),
    statusText: document.getElementById('status-text'),
    canvas: document.getElementById('weather-canvas')
};

// 3. CANVAS ENGINE (Анимация осадков)
const ctx = elements.canvas.getContext('2d');
let canvasWidth, canvasHeight;
let particles = [];
let currentWeatherType = 'sun'; // 'sun', 'rain', 'snow', 'cloud'

function resizeCanvas() {
    canvasWidth = elements.canvas.width = window.innerWidth;
    canvasHeight = elements.canvas.height = window.innerHeight;
    initParticles();
}
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight - canvasHeight;
        this.size = Math.random() * 2.5 + 1;
        this.speedY = Math.random() * 7 + 4;
        this.speedX = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.6 + 0.2;
    }

    update() {
        if (currentWeatherType === 'rain') {
            this.y += this.speedY * 1.6;
            this.x += this.speedX;
            if (this.y > canvasHeight) this.reset();
        } else if (currentWeatherType === 'snow') {
            this.y += this.speedY * 0.35;
            this.x += Math.sin(this.y * 0.01) * 1.2;
            if (this.y > canvasHeight) this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        if (currentWeatherType === 'rain') {
            ctx.strokeStyle = `rgba(0, 242, 254, ${this.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.speedX, this.y + 14);
            ctx.stroke();
        } else if (currentWeatherType === 'snow') {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function initParticles() {
    particles = [];
    let count = currentWeatherType === 'rain' ? 140 : (currentWeatherType === 'snow' ? 90 : 0);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем мягкое солнце/свечение на фоне, если ясно
    if (currentWeatherType === 'sun') {
        let grad = ctx.createRadialGradient(canvasWidth * 0.8, 120, 10, canvasWidth * 0.8, 120, 350);
        grad.addColorStop(0, 'rgba(0, 242, 254, 0.12)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.8, 120, 350, 0, Math.PI * 2);
        ctx.fill();
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(renderCanvas);
}

resizeCanvas();
renderCanvas();

// 4. API И РАБОТА С ДАННЫМИ (Open-Meteo API)

// Получаем координаты города через Geocoding API
async function getCoords(cityName) {
    setStatus('Поиск координат города...');
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка сети при поиске города');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('Город не найден. Проверь название!');
    }
    
    const res = data.results[0];
    return {
        name: res.name,
        country: res.country || '',
        lat: res.latitude,
        lon: res.longitude
    };
}

// Запрашиваем полные данные погоды
async function getWeatherData(lat, lon) {
    setStatus('Загрузка метеоданных...');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index,visibility&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Не удалось загрузить прогноз');
    return await response.json();
}

// 5. РЕНДЕР ДАННЫХ В UI

function updateUI(cityInfo, weatherData) {
    const current = weatherData.current;
    const hourly = weatherData.hourly;
    const daily = weatherData.daily;

    // Определяем погоду по коду WMO
    const weatherMeta = WMO_MAP[current.weather_code] || { desc: 'Ясно', icon: '☀️', type: 'sun' };

    // Меняем Canvas тему
    currentWeatherType = weatherMeta.type;
    initParticles();

    // Заполняем главную карточку
    elements.cityTitle.innerText = `${cityInfo.name}${cityInfo.country ? ', ' + cityInfo.country : ''}`;
    elements.weatherCondition.innerText = `${weatherMeta.icon} ${weatherMeta.desc}`;
    elements.currentTemp.innerText = Math.round(current.temperature_2m);
    
    // Метрики
    elements.feelsLike.innerText = `${Math.round(current.apparent_temperature)}°C`;
    elements.windSpeed.innerText = `${(current.wind_speed_10m / 3.6).toFixed(1)} м/с`; // км/ч в м/с
    elements.humidity.innerText = `${current.relative_humidity_2m}%`;
    
    // Переводим гПа в мм рт. ст. (1 hPa = 0.750062 mmHg)
    const pressureMm = Math.round(current.surface_pressure * 0.750062);
    elements.pressure.innerText = `${pressureMm} мм`;

    // UV и Видимость берем из первого часа
    elements.uvIndex.innerText = hourly.uv_index[0] !== undefined ? hourly.uv_index[0].toFixed(1) : 'Н/Д';
    elements.visibility.innerText = hourly.visibility[0] !== undefined ? `${(hourly.visibility[0] / 1000).toFixed(1)} км` : '10 км';

    // Рендер 24-часового прогноза
    elements.hourlyTrack.innerHTML = '';
    const currentHourIndex = new Date().getHours();
    
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
        const time = hourly.time[i] ? hourly.time[i].split('T')[1].substr(0, 5) : '--:--';
        const temp = hourly.temperature_2m[i] !== undefined ? Math.round(hourly.temperature_2m[i]) : '--';
        const code = hourly.weather_code[i];
        const icon = (WMO_MAP[code] || {}).icon || '☀️';

        elements.hourlyTrack.innerHTML += `
            <div class="hourly-card">
                <span class="hourly-time">${time}</span>
                <span class="hourly-icon">${icon}</span>
                <span class="hourly-temp">${temp}°C</span>
            </div>
        `;
    }

    // Рендер недельного прогноза (7 дней)
    elements.weeklyList.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Сегодня' : dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weathercode[i];
        const icon = (WMO_MAP[code] || {}).icon || '☀️';

        elements.weeklyList.innerHTML += `
            <div class="weekly-item">
                <div class="weekly-day">${dayName}</div>
                <div class="weekly-icon">${icon}</div>
                <div class="weekly-range">
                    <span style="color: var(--text-muted);">${minTemp}°</span>
                    <div class="temp-bar">
                        <div class="temp-bar-fill" style="left: 15%; width: 70%;"></div>
                    </div>
                    <span>${maxTemp}°</span>
                </div>
            </div>
        `;
    }

    setStatus('Данные успешно обновлены');
}

function setStatus(text) {
    elements.statusText.innerText = text;
}

// 6. ОСНОВНОЙ КОНТРОЛЛЕР ВХОДА

async function loadWeather(city) {
    try {
        const location = await getCoords(city);
        const data = await getWeatherData(location.lat, location.lon);
        updateUI(location, data);
    } catch (err) {
        setStatus(`Ошибка: ${err.message}`);
        alert(`Неудача, братан: ${err.message}`);
    }
}

// Геолокация через GPS
function loadWeatherByGPS() {
    if (!navigator.geolocation) {
        alert('Твой браузер не поддерживает GPS геопозицию!');
        return;
    }
    
    setStatus('Запрос координат GPS...');
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const data = await getWeatherData(lat, lon);
                
                // Передаем кастомное имя локации
                updateUI({ name: 'Моя локация', country: 'GPS' }, data);
            } catch (err) {
                setStatus('Ошибка при обработке GPS данных');
            }
        },
        () => {
            setStatus('Доступ к GPS отклонен пользователем');
            alert('Не удалось получить доступ к локации!');
        }
    );
}

// 7. СВЯЗЫВАЕМ СОБЫТИЯ (EVENT LISTENERS)

// Поиск по кнопке
elements.searchBtn.addEventListener('click', () => {
    const val = elements.searchInput.value.trim();
    if (val) loadWeather(val);
});

// Поиск по нажатию Enter
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const val = elements.searchInput.value.trim();
        if (val) loadWeather(val);
    }
});

// Кнопка локации
elements.geoBtn.addEventListener('click', loadWeatherByGPS);

// Старт системы (По умолчанию загружаем Москву)
loadWeather('Москва');
