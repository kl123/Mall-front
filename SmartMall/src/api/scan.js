import request from "@/utils/request.js";

export const scanBarcode = async (barcode, userId) => {
  return request.get("/scan", {
    params: {
      barcode,
      userId,
    },
  });
};
