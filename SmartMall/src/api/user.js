import request from "@/utils/request.js";

export function Login(phone, password) {
  return request.post("/login", {
    phone,
    password,
  });
}
