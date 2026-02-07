// // src/services/locationService.js - VERSION COMPLÈTE

// // import api from "./api";
// import api from "./api";

// export const getRegions = () => api.get("location/regions/");
// export const getCities = (regionId) =>
//   api.get(`location/cities/?region=${regionId}`);
// export const getDistricts = (cityId) =>
//   api.get(`location/districts/?city=${cityId}`);

// // pres de moi 
// export const getNearbyHousing = (lat, lng, radius = 5) =>
//   api.get("housing/nearby/", {
//     params: { lat, lng, radius },
//   });

// src/services/locationService.js - VERSION COMPLÈTE

// import api from "./api";
import api from "./api";

export const getRegions = () => api.get("regions/");
export const getCities = (regionId) =>
  api.get(`cities/?region=${regionId}`);
export const getDistricts = (cityId) =>
  api.get(`districts/?city=${cityId}`);

// pres de moi 
export const getNearbyHousing = (lat, lng, radius = 5) =>
  api.get("housing/nearby/", {
    params: { lat, lng, radius },
  });
