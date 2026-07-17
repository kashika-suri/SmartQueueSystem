import axios from "axios";

const API = axios.create({
  baseURL: "https://smartqueuesystem-production.up.railway.app/api",
});

export default API;