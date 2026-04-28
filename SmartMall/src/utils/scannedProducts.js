const SCANNED_PRODUCTS_PREFIX = "smart_scanned_products_";

const getStorageKey = (userId) =>
  `${SCANNED_PRODUCTS_PREFIX}${userId || "guest"}`;

const safeParse = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const getScannedProductsMap = (userId) => {
  const key = getStorageKey(userId);
  return safeParse(localStorage.getItem(key));
};

export const getScannedProductByBarcode = (userId, barcode) => {
  const map = getScannedProductsMap(userId);
  return map[barcode] || null;
};

export const upsertScannedProduct = (userId, barcode, product) => {
  if (!barcode || !product) return;
  const key = getStorageKey(userId);
  const map = getScannedProductsMap(userId);
  map[barcode] = {
    ...product,
    id: product.id || barcode,
    updatedAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(map));
};
