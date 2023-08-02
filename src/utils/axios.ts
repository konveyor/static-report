import axios from "axios";

export const iniAxios = () => {
  axios.defaults.baseURL = "/";
};
