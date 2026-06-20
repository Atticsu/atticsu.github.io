const DEFAULT_MONITOR_USER = 'yuhan';
const DEFAULT_MONITOR_DATA_ORIGIN = 'http://121.43.111.176:18080';

const textEncoder = new TextEncoder();

const protectedPathPrefixes = [
  '/strategy-monitor',
  '/quant-monitor',
  '/monitor-data',
];

const getMonitorDataOrigin = () => process.env.MONITOR_DATA_ORIGIN || DEFAULT_MONITOR_DATA_ORIGIN;

const isProtectedRequest = (url: URL) => {
  if (url.hostname.startsWith('quant.')) return true;
  return protectedPathPrefixes.some((prefix) => (
    url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  ));
};

const timingSafeEqual = (left: string, right: string) => {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }

  return diff === 0;
};

const decodeBasicAuth = (header: string | null) => {
  if (!header?.startsWith('Basic ')) return null;

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
};

const unauthorized = () => new Response('Authentication required.\n', {
  status: 401,
  headers: {
    'WWW-Authenticate': 'Basic realm="Quant Strategy Monitor"',
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  },
});

const notConfigured = () => new Response('Monitor authentication is not configured.\n', {
  status: 503,
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  },
});

const proxyMonitorData = (request: Request, url: URL) => {
  const monitorDataOrigin = getMonitorDataOrigin();
  const target = new URL(url.pathname + url.search, monitorDataOrigin);
  const headers = new Headers(request.headers);
  headers.set('Host', new URL(monitorDataOrigin).host);

  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  });
};

export const config = {
  matcher: ['/((?!assets|favicon.ico|robots.txt|sitemap.xml).*)'],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  if (!isProtectedRequest(url)) return undefined;

  const expectedPassword = process.env.MONITOR_PASSWORD || '';
  const expectedUser = process.env.MONITOR_USER || DEFAULT_MONITOR_USER;

  if (!expectedPassword) return notConfigured();

  const credentials = decodeBasicAuth(request.headers.get('Authorization'));
  const isAllowed = credentials
    && timingSafeEqual(credentials.user, expectedUser)
    && timingSafeEqual(credentials.password, expectedPassword);

  if (!isAllowed) return unauthorized();

  if (url.pathname === '/monitor-data' || url.pathname.startsWith('/monitor-data/')) {
    return proxyMonitorData(request, url);
  }

  return undefined;
}
