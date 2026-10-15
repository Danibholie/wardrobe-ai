"use client";

import { useEffect, useState, useCallback } from "react";

export type LocationWeatherResult = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  fullLocation: string;
  shortLocation: string;
  latitude?: number;
  longitude?: number;
  temperature: number | null;
  condition: string;
  humidity: number | null;
  weatherSummary: string;
  weatherShort: string;
  isDay: boolean;
  isGps: boolean;
  isLoading: boolean;
  error: string | null;
};

const CACHE_KEY = "wardrobe_ai_location_weather_cache";
const CACHE_DURATION_MS = 20 * 60 * 1000; // 20 minutes

// WMO Weather interpretation codes
export function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Light drizzle";
  if (code >= 56 && code <= 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rain showers";
  if (code >= 66 && code <= 67) return "Freezing rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Pleasant";
}

export const DEFAULT_LOCATION_WEATHER: LocationWeatherResult = {
  city: "Lagos",
  region: "Lagos",
  country: "Nigeria",
  countryCode: "NG",
  fullLocation: "Lagos, Nigeria",
  shortLocation: "Lagos, NG",
  latitude: 6.5244,
  longitude: 3.3792,
  temperature: 31,
  condition: "Humid · Tropical breeze",
  humidity: 78,
  weatherSummary: "31°C · Humid · Tropical breeze",
  weatherShort: "31°C · Humid",
  isDay: true,
  isGps: false,
  isLoading: false,
  error: null,
};

async function fetchWeatherForCoordinates(
  lat: number,
  lon: number
): Promise<{
  temperature: number;
  condition: string;
  humidity: number;
  isDay: boolean;
  summary: string;
  short: string;
} | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.current) return null;

    const temp = Math.round(data.current.temperature_2m);
    const humidity = Math.round(data.current.relative_humidity_2m);
    const condition = getWeatherDescription(data.current.weather_code);
    const isDay = data.current.is_day === 1;

    return {
      temperature: temp,
      condition,
      humidity,
      isDay,
      summary: `${temp}°C · ${condition} · ${humidity}% humidity`,
      short: `${temp}°C · ${condition}`,
    };
  } catch (err) {
    console.warn("Weather fetch error:", err);
    return null;
  }
}

export async function detectLocationAndWeather(
  forceGps = false
): Promise<LocationWeatherResult> {
  let lat: number | null = null;
  let lon: number | null = null;
  let isGps = false;

  // 1. Try browser HTML5 Geolocation (high precision GPS)
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: forceGps ? 8000 : 3500,
          maximumAge: 300000,
        });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      isGps = true;
    } catch {
      // Permission denied or timeout -> fall through to IP detection
      isGps = false;
    }
  }

  // 2. Fetch reverse geocode from BigDataCloud (with coords if GPS, or no params for IP auto-detect)
  try {
    const geoUrl =
      lat !== null && lon !== null
        ? `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        : `https://api.bigdatacloud.net/data/reverse-geocode-client`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    const resolvedLat = lat ?? geoData.latitude ?? DEFAULT_LOCATION_WEATHER.latitude;
    const resolvedLon = lon ?? geoData.longitude ?? DEFAULT_LOCATION_WEATHER.longitude;

    const locality = geoData.locality || geoData.city || "Lagos";
    const region = geoData.principalSubdivision || "Lagos";
    const country = geoData.countryName || "Nigeria";
    const countryCode = geoData.countryCode || "NG";

    // Format fullLocation nicely: e.g. "Alimosho, Lagos" or "Lagos, Nigeria"
    let fullLocation = `${locality}, ${country}`;
    if (region && region !== locality && country === "Nigeria") {
      fullLocation = `${locality}, ${region}`;
    } else if (region && country !== "Nigeria") {
      fullLocation = `${locality}, ${country}`;
    }

    const shortLocation = `${locality || region}, ${countryCode}`;

    // 3. Fetch live weather for these coordinates
    const weatherData = await fetchWeatherForCoordinates(resolvedLat, resolvedLon);

    const result: LocationWeatherResult = {
      city: locality,
      region,
      country,
      countryCode,
      fullLocation,
      shortLocation,
      latitude: resolvedLat,
      longitude: resolvedLon,
      temperature: weatherData?.temperature ?? DEFAULT_LOCATION_WEATHER.temperature,
      condition: weatherData?.condition ?? DEFAULT_LOCATION_WEATHER.condition,
      humidity: weatherData?.humidity ?? DEFAULT_LOCATION_WEATHER.humidity,
      weatherSummary: weatherData?.summary ?? DEFAULT_LOCATION_WEATHER.weatherSummary,
      weatherShort: weatherData?.short ?? DEFAULT_LOCATION_WEATHER.weatherShort,
      isDay: weatherData?.isDay ?? true,
      isGps,
      isLoading: false,
      error: null,
    };

    // Cache to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: result, timestamp: Date.now() })
        );
      } catch {
        // Ignore localStorage quota errors
      }
    }

    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to detect location";
    console.warn("Location/weather detection fallback used:", errorMessage);
    return {
      ...DEFAULT_LOCATION_WEATHER,
      error: errorMessage,
    };
  }
}

export function useLocationWeather() {
  const [data, setData] = useState<LocationWeatherResult>(() => {
    // Synchronously hydrate from cache if available
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
            return { ...parsed.data, isLoading: false };
          }
        }
      } catch {
        // Fall back to default
      }
    }
    return { ...DEFAULT_LOCATION_WEATHER, isLoading: true };
  });

  const refresh = useCallback(async (forceGps = false) => {
    setData((prev) => ({ ...prev, isLoading: true }));
    const result = await detectLocationAndWeather(forceGps);
    setData(result);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Check cache age
      let shouldFetch = true;
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
              if (isMounted) {
                setData({ ...parsed.data, isLoading: false });
              }
              // If cached is less than 10 mins old, skip background re-fetch
              if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
                shouldFetch = false;
              }
            }
          }
        } catch {
          // Continue to fetch
        }
      }

      if (shouldFetch) {
        const result = await detectLocationAndWeather(false);
        if (isMounted) {
          setData(result);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...data,
    refresh,
  };
}
