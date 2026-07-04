const originalFetch = window.fetch.bind(window);
window.fetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  const sessionToken = localStorage.getItem('sessionToken');
  const adminToken = localStorage.getItem('adminToken');
  if (sessionToken) headers.set('X-Session-Token', sessionToken);
  if (adminToken) headers.set('X-Admin-Token', adminToken);
  return originalFetch(url, { ...options, headers });
};

export {};