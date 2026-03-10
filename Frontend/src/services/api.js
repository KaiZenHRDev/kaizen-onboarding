// fileName: services/api.js

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

async function http(method, path, body) {
  // ✅ Retrieve token for every request
  const token = localStorage.getItem('authToken');
  
  const headers = { 
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

// candidateAPI handles multi-tenant candidate operations
export const candidateAPI = {
  
  async getCandidates() {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) throw new Error("Company context is missing.");
    
    // SECURE ROUTE: /api/companies/{companyId}/candidates
    return http('GET', `/companies/${encodeURIComponent(companyId)}/candidates`);
  },

  async getCandidateById(id, companyId, positionCode) {
    const cid = companyId || localStorage.getItem('companyId');
    if (!cid) throw new Error("Company context is missing.");

    // Optional positionCode is kept as a query param for application-specific filtering
    const query = positionCode ? `?positionCode=${encodeURIComponent(positionCode)}` : '';
    
    // SECURE ROUTE: /api/companies/{companyId}/candidates/{id}
    return http('GET', `/companies/${encodeURIComponent(cid)}/candidates/${id}${query}`);
  },

  async createCandidate(payload) {
    const companyId = payload.companyId || localStorage.getItem('companyId');
    if (!companyId) throw new Error("Company context is missing.");

    // SECURE ROUTE: /api/companies/{companyId}/candidates
    return http('POST', `/companies/${encodeURIComponent(companyId)}/candidates`, payload);
  },

  async updateCandidate(id, payload) {
    const companyId = payload.companyId || localStorage.getItem('companyId');
    if (!companyId) throw new Error("Company context is missing.");

    // SECURE ROUTE: /api/companies/{companyId}/candidates/{id}
    return http('PUT', `/companies/${encodeURIComponent(companyId)}/candidates/${id}`, payload);
  },

  async updateStatus(id, status, companyId, positionCode) {
    const cid = companyId || localStorage.getItem('companyId');
    if (!cid) throw new Error("Company context is missing.");

    const query = positionCode ? `?positionCode=${encodeURIComponent(positionCode)}` : '';
    
    // SECURE ROUTE: /api/companies/{companyId}/candidates/{id}/status
    return http('PATCH', `/companies/${encodeURIComponent(cid)}/candidates/${id}/status${query}`, { status: status });
  },

  async deleteCandidate(id, companyId, positionCode) {
    const cid = companyId || localStorage.getItem('companyId');
    if (!cid) throw new Error("Company context is missing.");

    const query = positionCode ? `?positionCode=${encodeURIComponent(positionCode)}` : '';
    
    // SECURE ROUTE: /api/companies/{companyId}/candidates/{id}
    return http('DELETE', `/companies/${encodeURIComponent(cid)}/candidates/${id}${query}`);
  },
};