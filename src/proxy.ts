import { Agent, ProxyAgent, setGlobalDispatcher } from 'undici';
import type { Dispatcher } from 'undici';

// Matches a request hostname against the NO_PROXY / no_proxy list.
// Handles exact matches and suffix matches (e.g. "example.com" also covers "sub.example.com").
function matchesNoProxy(hostname: string): boolean {
  const noProxy = process.env.NO_PROXY ?? process.env.no_proxy;
  if (!noProxy) return false;
  const lower = hostname.toLowerCase();
  return noProxy
    .split(',')
    .map(h => h.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean)
    .some(entry => entry === '*' || lower === entry || lower.endsWith('.' + entry));
}

// Ensures a proxy URL has a protocol prefix. A bare host:port (e.g. "localhost:8080")
// is treated as HTTP, matching the convention used by curl and most proxy tools.
function normalizeProxyUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `http://${url}`;
}

// Routes each fetch() call through HTTPS_PROXY or HTTP_PROXY based on the request
// protocol, bypassing the proxy for any host that matches NO_PROXY.
// Extends Agent so all Dispatcher methods are already implemented.
class ProxyRoutingDispatcher extends Agent {
  private readonly _httpsProxy: ProxyAgent | undefined;
  private readonly _httpProxy: ProxyAgent | undefined;

  constructor(httpProxy: string | undefined, httpsProxy: string | undefined) {
    super();
    this._httpsProxy = httpsProxy
      ? new ProxyAgent({ uri: normalizeProxyUrl(httpsProxy) })
      : undefined;
    this._httpProxy = httpProxy ? new ProxyAgent({ uri: normalizeProxyUrl(httpProxy) }) : undefined;
  }

  dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandlers): boolean {
    const origin = options.origin instanceof URL ? options.origin : new URL(String(options.origin));

    if (!matchesNoProxy(origin.hostname)) {
      const proxy =
        origin.protocol === 'https:'
          ? (this._httpsProxy ?? this._httpProxy)
          : (this._httpProxy ?? this._httpsProxy);
      if (proxy) return proxy.dispatch(options, handler);
    }

    return super.dispatch(options, handler);
  }
}

/**
 * Reads proxy configuration from environment variables and patches the global
 * fetch dispatcher used by Node.js native fetch.
 *
 * Supported env vars:
 *   HTTPS_PROXY / https_proxy — proxy for HTTPS requests
 *   HTTP_PROXY  / http_proxy  — proxy for HTTP requests
 *   NO_PROXY    / no_proxy    — comma-separated list of hosts to bypass
 *
 * For corporate environments that use SSL inspection (MITM proxies), add the
 * corporate CA certificate to Node's trust store rather than disabling verification:
 *   NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
 * Node reads this at startup and it applies to all TLS connections, including
 * the inner tunnel established through a CONNECT proxy.
 */
export function applyProxyConfig(): void {
  const httpsProxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY ?? process.env.http_proxy;

  if (!httpsProxy && !httpProxy) return;

  setGlobalDispatcher(new ProxyRoutingDispatcher(httpProxy, httpsProxy));
}
