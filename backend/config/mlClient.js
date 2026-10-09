// config/mlClient.js
// ONE shared axios client for the Python ML service.
const axios = require("axios");

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://localhost:8000",
  timeout: 60000,
});

module.exports = mlClient;