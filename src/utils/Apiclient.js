// ApiClient.js
import axios from 'axios';

class ApiClient {
  constructor(baseURL) {
    this.instance = axios.create({
      baseURL,
      headers: {'g-api-key': '6cca5d4e-719b-4c28-aabd-4aeb2618ee1d'},
    });

    this.instance.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(err)
    );
  }

//   setAuthToken(token) {
//     this.instance.defaults.headers.Authorization = `Bearer ${token}`;
//   }

  get(url, config) {
    return this.instance.get(url, config);
  }

  post(url, data, config) {
    return this.instance.post(url, data, config);
  }

  // Add more methods as needed
}

//export default new ApiClient('http://192.168.0.114:5000');

export default new ApiClient('https://api.streamalong.live');
