// =====================================================
// Admin Controller — Dashboard + Users + Balance Transfer
// =====================================================
const User = require('../models/User');

const AUTOCALLS_API_BASE = 'https://app.autocalls.ai/api';

// ══════════════════════════════════════════════════════
// GET /api/admin/dashboard — Real-time stats
// ══════════════════════════════════════════════════════
exports.getDashboard = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' });
    const activeClients = await User.countDocuments({ role: 'client', isActive: true });
    const inactiveClients = await User.countDocuments({ role: 'client', isActive: false });

    // Clients with API key connected
    const connectedClients = await User.countDocuments({
      role: 'client',
      $or: [
        { sondosApiKey: { $exists: true, $ne: '' } },
        { api_key: { $exists: true, $ne: '' } }
      ]
    });

    // Recent clients (last 10)
    const recentClients = await User.find({ role: 'client' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email company isActive createdAt lastLogin sondosApiKey api_key');

    // Clients registered per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await User.aggregate([
      { $match: { role: 'client', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalClients,
          activeClients,
          inactiveClients,
          connectedClients,
        },
        recentClients: recentClients.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          company: u.company || '',
          isActive: u.isActive,
          hasApiKey: !!(u.sondosApiKey || u.api_key),
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
        })),
        monthlyRegistrations,
      }
    });
  } catch (error) {
    console.error('[Admin Dashboard]', error.message);
    res.status(500).json({ success: false, message: 'حدث خطأ في تحميل البيانات' });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/admin/transfer-balance — Transfer via AutoCalls White-Label API
// https://docs.autocalls.ai/api-reference/white-label/transfer-balance
// ══════════════════════════════════════════════════════
exports.transferBalance = async (req, res) => {
  try {
    const { user_id, email, transfer_type, operation, amount } = req.body;

    // Validate required fields
    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني والمبلغ مطلوبان'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ يجب أن يكون أكبر من صفر'
      });
    }

    const apiKey = process.env.AUTOCALLS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'مفتاح AutoCalls API غير مُعد في الخادم'
      });
    }

    // Call AutoCalls White-Label Transfer API
    const response = await fetch(`${AUTOCALLS_API_BASE}/white-label/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id || undefined,
        email,
        transfer_type: transfer_type || 'balance',
        operation: operation || 'add',
        amount: parseFloat(amount),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Transfer Balance] AutoCalls error:', response.status, data);
      return res.status(response.status).json({
        success: false,
        message: data.message || data.error || `خطأ من AutoCalls: ${response.status}`,
        details: data,
      });
    }

    res.json({
      success: true,
      message: `تم تحويل ${amount} بنجاح إلى ${email}`,
      data,
    });
  } catch (error) {
    console.error('[Transfer Balance]', error.message);
    res.status(502).json({
      success: false,
      message: 'فشل الاتصال بخدمة AutoCalls',
    });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/admin/users — List all users with pagination & search
// ══════════════════════════════════════════════════════
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query)
      .select('+plainPassword')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: users.map(u => u.toAdminJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+plainPassword');
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    res.json({ success: true, data: user.toAdminJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, company, timezone, role, isActive, sondosApiKey, api_key } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company !== undefined) user.company = company;
    if (timezone) user.timezone = timezone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (sondosApiKey !== undefined) { user.sondosApiKey = sondosApiKey; user.api_key = sondosApiKey; }
    if (api_key !== undefined) { user.api_key = api_key; user.sondosApiKey = api_key; }

    await user.save();
    res.json({ success: true, message: 'تم تحديث بيانات المستخدم', data: user.toAdminJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    user.isActive = isActive;
    await user.save();
    res.json({
      success: true,
      message: isActive ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'لا يمكن حذف حساب المدير' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};