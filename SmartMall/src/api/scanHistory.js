import request from "@/utils/request.js";

export const getScanHistory = (userId) => {
  return request.get("/scanHistory", {
    params: {
      userId,
    },
  });
};

export const createScanHistoryRecord = (payload) => {
  return request.post("/scanHistory", payload);
};
