import request from "@/utils/request.js";

export const getComments = (productId) => {
  if (productId) {
    return request.get("/comments", {
      params: { productId },
    });
  }
  return request.get("/comments");
};

export const createComment = (commentPayload) => {
  return request.post("/comments", commentPayload);
};
