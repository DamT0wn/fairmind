export const config = {
  runtime: 'edge',
};

const normalizeBackendBase = () => {
  const raw = (process.env.BACKEND_API_URL || process.env.VITE_API_URL || '').trim();
  if (!raw) {
    return '';
  }

  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export default async function handler(request) {
  const backendBase = normalizeBackendBase();

  if (!backendBase) {
    return new Response(
      JSON.stringify({
        detail: 'Missing BACKEND_API_URL environment variable on Vercel',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }

  const incomingUrl = new URL(request.url);
  const apiPath = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const upstreamUrl = `${backendBase}/${apiPath}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  const method = request.method.toUpperCase();
  const init = {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    redirect: 'follow',
  };

  try {
    const upstream = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        detail: `Upstream request failed: ${err?.message || 'unknown error'}`,
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
