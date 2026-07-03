const crypto = require('crypto');

const API_KEY = 'c66289394c2a6e8515c8e8b382fba719';
const OFFER_ID = '13341';
const USER_ID = '75329';
const API_DOMAIN = 'https://t-api.org';

function checkSum(jsonData) {
  return crypto.createHash('sha1').update(jsonData + API_KEY).digest('hex');
}

async function createLead(params) {
  const data = {
    name: params.name ? params.name.trim() : '',
    phone: params.phone ? params.phone.trim() : '',
    offer_id: OFFER_ID,
    country: params.country ? params.country.trim() : 'GR',
  };

  const optionalFields = [
    'tz', 'address', 'region', 'city', 'zip', 'stream_id', 'count',
    'email', 'user_comment', 'utm_source', 'utm_medium', 'utm_campaign',
    'utm_term', 'utm_content', 'sub_id', 'sub_id_1', 'sub_id_2',
    'sub_id_3', 'sub_id_4', 'referer', 'user_agent', 'ip',
  ];

  for (const key of optionalFields) {
    if (params[key] !== undefined && params[key] !== null) {
      data[key] = params[key];
    }
  }

  const payload = { user_id: USER_ID, data };
  const jsonData = JSON.stringify(payload);
  const checksum = checkSum(jsonData);
  const apiUrl = `${API_DOMAIN}/api/lead/create?check_sum=${checksum}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonData,
  });

  const body = await response.json();

  if (body.status === 'ok') {
    return body.data;
  } else if (body.status === 'error') {
    throw new Error(body.error);
  } else {
    throw new Error('Unknown response status');
  }
}

module.exports = async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const query = req.query || {};

  if (!body.name || !body.phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  // Detect real IP
  let ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '';

  try {
    const lead = await createLead({
      name: body.name,
      phone: body.phone,
      region: body.region || null,
      city: body.city || null,
      count: body.count || null,
      offer_id: OFFER_ID,
      stream_id: '',
      country: 'GR',
      tz: '',
      address: body.address || null,
      email: body.email || null,
      zip: body.zip || null,
      user_comment: body.user_comment || null,
      referer: query.referer || req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || 'Unknown',
      ip,
      utm_source: query.utm_source || null,
      utm_medium: query.utm_medium || null,
      utm_campaign: query.utm_campaign || null,
      utm_term: query.utm_term || null,
      utm_content: query.utm_content || null,
      sub_id: query.sub_id || null,
      sub_id_1: query.sub_id_1 || null,
      sub_id_2: query.sub_id_2 || null,
      sub_id_3: query.sub_id_3 || null,
      sub_id_4: query.sub_id_4 || null,
    });

    // Redirect to success page
    res.setHeader('Location', `/success.html?id=${lead.id}`);
    return res.status(302).end();
  } catch (err) {
    console.error('Lead creation error:', err.message);
    res.setHeader('Location', `/?error=1`);
    return res.status(302).end();
  }
};
