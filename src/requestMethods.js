import axios from "axios";

// console.log("URL is", process.env);
// const BASE_URL = 'http://localhost:5000/api/';
const BASE_URL = 'https://api.naufalkareem.com/api/';
const TOKEN= "AAAeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZWJkNmYzMWFhYWFhMWY5N2EyMWM3YiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY3NzE2MzY1MSwiZXhwIjoxNjc3MzM2NDUxfQ.KFWBQHnkysTU5AOIv-UN84Jbs5HDg1GYv9hEwVq3NOg"

export const publicRequest = axios.create({
    baseURL: BASE_URL,
  });

  export const userRequest = axios.create({
    baseURL: BASE_URL,
    header: { token: `Bearer ${TOKEN}` },
  });