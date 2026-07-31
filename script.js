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