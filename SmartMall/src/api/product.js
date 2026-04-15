import request from "@/utils/request.js";

export const getProductByBarcode = (barcode) => {
  return request.get(`/products/${barcode}`);
};

export const getProducts = () => {
  return request.get("/products");
};
