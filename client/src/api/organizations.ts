import api from './api';

// Description: Get user organization memberships
// Endpoint: GET /users/{userId}/memberships
// Request: { userId: string }
// Response: { success: boolean, memberships: Array<{ organizationId: string, organizationSlug: string, organizationName: string, role: string }> }
export const getUserMemberships = async (userId: string) => {
  try {
    const response = await api.get(`/organizations/memberships/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get organization details
// Endpoint: GET /organizations/{slug}
// Request: { slug: string }
// Response: { success: boolean, organization: object }
export const getOrganization = async (slug: string) => {
  try {
    const response = await api.get(`/organizations/${slug}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get organization members
// Endpoint: GET /organizations/{slug}/members
// Request: { slug: string }
// Response: { success: boolean, organization: object, members: Array<object>, totalMembers: number }
export const getOrganizationMembers = async (slug: string) => {
  try {
    const response = await api.get(`/organizations/${slug}/members`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get organization apps
// Endpoint: GET /apps?organizationId={organizationId}
// Request: { organizationId: string }
// Response: { success: boolean, apps: Array<object>, total: number }
export const getOrganizationApps = async (organizationId: string) => {
  try {
    const response = await api.get(`/apps?organizationId=${organizationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Search organization apps
// Endpoint: GET /apps/search?organizationId={organizationId}&query={query}
// Request: { organizationId: string, query: string }
// Response: { success: boolean, apps: Array<object>, total: number }
export const searchOrganizationApps = async (organizationId: string, query: string) => {
  try {
    const response = await api.get(`/apps/search?organizationId=${organizationId}&query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Invite user to organization
// Endpoint: POST /organizations/{slug}/users
// Request: { slug: string, userEmail: string, role: string, orgPermissions: object }
// Response: { success: boolean, message: string, membership: object }
export const inviteUserToOrganization = async (slug: string, userEmail: string, role: string = 'member', orgPermissions: object = {}) => {
  try {
    const response = await api.post(`/organizations/${slug}/users`, {
      userEmail,
      role,
      orgPermissions: {
        canManageUsers: false,
        canManageApps: false,
        canViewAuditLogs: false,
        ...orgPermissions
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Invite member to organization (alias for inviteUserToOrganization)
// Endpoint: POST /organizations/{slug}/users
// Request: { slug: string, userEmail: string, role: string, orgPermissions: object }
// Response: { success: boolean, message: string, membership: object }
export const inviteOrganizationMember = async (slug: string, userEmail: string, role: string = 'member', orgPermissions: object = {}) => {
  try {
    const response = await api.post(`/organizations/${slug}/users`, {
      userEmail,
      role,
      orgPermissions: {
        canManageUsers: false,
        canManageApps: false,
        canViewAuditLogs: false,
        ...orgPermissions
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Remove member from organization
// Endpoint: DELETE /organizations/{slug}/members/{userId}
// Request: { slug: string, userId: string }
// Response: { success: boolean, message: string }
export const removeOrganizationMember = async (slug: string, userId: string) => {
  try {
    const response = await api.delete(`/organizations/${slug}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update member role in organization
// Endpoint: PUT /organizations/{slug}/members/{userId}/role
// Request: { slug: string, userId: string, role: string }
// Response: { success: boolean, message: string }
export const updateMemberRole = async (slug: string, userId: string, role: string) => {
  try {
    const response = await api.put(`/organizations/${slug}/members/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update organization member role (alias for updateMemberRole)
// Endpoint: PUT /organizations/{slug}/members/{userId}/role
// Request: { slug: string, userId: string, role: string }
// Response: { success: boolean, message: string }
export const updateOrganizationMemberRole = async (slug: string, userId: string, role: string) => {
  try {
    const response = await api.put(`/organizations/${slug}/members/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Update member app access permissions
// Endpoint: PUT /organizations/{slug}/members/{userId}/apps
// Request: { slug: string, userId: string, appPermissions: object }
// Response: { success: boolean, message: string }
export const updateMemberAppAccess = async (slug: string, userId: string, appPermissions: object) => {
  try {
    const response = await api.put(`/organizations/${slug}/members/${userId}/apps`, { appPermissions });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Accept organization invitation
// Endpoint: POST /api/organizations/accept-invite
// Request: { token: string }
// Response: { success: boolean, message: string, membership?: object }
export const acceptInvite = async (token: string) => {
  try {
    const response = await api.post('/api/organizations/accept-invite', { token });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get member app access permissions
// Endpoint: GET /organizations/{slug}/members/{userId}/apps
// Request: { slug: string, userId: string }
// Response: { success: boolean, apps: Array<{ appId: string, appName: string, permissions: Array<string> }> }
export const getMemberAppAccess = async (slug: string, userId: string) => {
  try {
    const response = await api.get(`/organizations/${slug}/members/${userId}/apps`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};