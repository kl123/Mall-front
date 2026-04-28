module.exports = (req, res, next) => {
  // 处理 /scan 接口
  if (req.path === '/scan' && req.method === 'GET') {
    const { barcode, userId } = req.query;
    const db = req.app.db; // 获取 lowdb 实例

    const product = db.get('products').find({ id: barcode }).value();
    if (!product) {
      return res.json({ found: false });
    }

    const user = db.get('users').find({ id: parseInt(userId) }).value();
    const userAllergies = user?.allergies || [];

    const matchedAllergens = product.ingredients.filter(ing =>
      userAllergies.some(a => ing.includes(a))
    );

    let score = 80;
    if (matchedAllergens.length > 0) score -= 40;
    if (product.name.includes('全麦') || product.name.includes('有机')) score += 5;
    score = Math.min(100, Math.max(0, score));

    return res.json({
      found: true,
      product: {
        ...product,
        matchedAllergens,
        hasAllergen: matchedAllergens.length > 0,
        matchScore: score
      }
    });
  }

  // 处理登录接口
  if (req.path === '/login' && req.method === 'POST') {
    const { phone, password } = req.body;
    const db = req.app.db;
    const user = db.get('users').find({ phone, password }).value();
    if (user) {
      return res.json({ success: true, userId: user.id, username: user.username });
    } else {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }
  }

  next();
};