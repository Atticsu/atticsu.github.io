const DEFAULT_MONITOR_USER = 'yuhan';
const DEFAULT_MONITOR_DATA_ORIGIN = 'http://quant-origin.yuhanwu.cn:18080';

const cleanPath = (value) => {
  const raw = Array.isArray(value) ? value.join('/') : value || '';
  return raw
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');
};

const copyHeaders = (source, response) => {
  const allowed = [
    'content-type',
    'content-length',
    'etag',
    'last-modified',
  ];

  for (const name of allowed) {
    const value = source.headers.get(name);
    if (value) response.setHeader(name, value);
  }

  response.setHeader('Cache-Control', 'no-store');
};

export default async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.setHeader('Allow', 'GET, HEAD');
    response.status(405).send('Method not allowed.\n');
    return;
  }

  const monitorUser = process.env.MONITOR_USER || DEFAULT_MONITOR_USER;
  const monitorPassword = process.env.MONITOR_PASSWORD || '';
  const monitorOrigin = process.env.MONITOR_DATA_ORIGIN || DEFAULT_MONITOR_DATA_ORIGIN;

  if (!monitorPassword) {
    response.status(503).send('Monitor authentication is not configured.\n');
    return;
  }

  const path = cleanPath(request.query.path);
  const target = new URL(`/monitor-data/${path}`, monitorOrigin);

  for (const [key, value] of Object.entries(request.query || {})) {
    if (key === 'path') continue;
    if (Array.isArray(value)) {
      for (const item of value) target.searchParams.append(key, item);
    } else if (value !== undefined) {
      target.searchParams.set(key, String(value));
    }
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${monitorUser}:${monitorPassword}`).toString('base64')}`,
        Accept: request.headers.accept || 'application/json',
        'User-Agent': 'YuhanStrategyMonitor/1.0',
      },
      redirect: 'manual',
    });

    copyHeaders(upstream, response);
    response.status(upstream.status);

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    response.send(body);
  } catch (error) {
    response.setHeader('Cache-Control', 'no-store');
    response.status(502).send(`Monitor data proxy failed: ${error instanceof Error ? error.message : 'unknown error'}\n`);
  }
}
