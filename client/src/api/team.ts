import api from "./api";

// Description: Get team members
// Endpoint: GET /team
// Request: {}
// Response: { members: Array<{ _id: string, name: string, email: string, role: 'admin' | 'developer' | 'viewer', joinedAt: string }> }
export const getTeamMembers = async () => {
  try {
    console.log("Making getTeamMembers API call");
    const response = await api.get("/team");
    console.log("getTeamMembers API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("getTeamMembers API error:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Invite team member
// Endpoint: POST /team/invite
// Request: { email: string }
// Response: { success: boolean, message: string }
export const inviteTeamMember = async (data: { email: string }) => {
  try {
    const response = await api.post("/team/invite", data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Remove team member
// Endpoint: DELETE /team/:id
// Request: {}
// Response: { success: boolean, message: string }
export const removeTeamMember = async (memberId: string) => {
  try {
    const response = await api.delete(`/team/${memberId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update team member role
// Endpoint: PUT /team/:id/role
// Request: { role: 'admin' | 'developer' | 'viewer' }
// Response: { success: boolean, message: string }
export const updateTeamMemberRole = async (
  memberId: string,
  data: { role: "admin" | "developer" | "viewer" },
) => {
  try {
    const response = await api.put(`/team/${memberId}/role`, data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get member access
// Endpoint: GET /team/:id/access
// Request: {}
// Response: { projects: Array<{ _id: string, name: string, access: 'view' | 'edit' }> }
export const getMemberAccess = async (memberId: string) => {
  try {
    const response = await api.get(`/team/${memberId}/access`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update member access
// Endpoint: PUT /team/:id/access
// Request: { projects: Array<{ id: string, access: 'view' | 'edit' }> }
// Response: { success: boolean, message: string }
export const updateMemberAccess = async (
  memberId: string,
  data: { projects: Array<{ id: string; access: "view" | "edit" }> },
) => {
  try {
    const response = await api.put(`/team/${memberId}/access`, data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Search projects
// Endpoint: GET /team/projects/search
// Request: { query: string }
// Response: { projects: Array<{ _id: string, name: string }> }
export const searchProjects = async (query: string) => {
  try {
    const response = await api.get(
      `/team/projects/search?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Search users in organization
// Endpoint: GET /users/search
// Request: { query: string }
// Response: { users: Array<{ _id: string, name: string, email: string }> }
export const searchUsers = async (query: string) => {
  // This endpoint isn't implemented yet on the backend
  // Mocking the response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers = [
        { _id: "user_123456", name: "John Doe", email: "john@example.com" },
        { _id: "user_123457", name: "Jane Smith", email: "jane@example.com" },
        {
          _id: "user_123458",
          name: "Robert Johnson",
          email: "robert@example.com",
        },
        {
          _id: "user_123459",
          name: "Sarah Williams",
          email: "sarah@example.com",
        },
        {
          _id: "user_123460",
          name: "Michael Brown",
          email: "michael@example.com",
        },
        { _id: "user_123461", name: "Emily Davis", email: "emily@example.com" },
        {
          _id: "user_123462",
          name: "David Wilson",
          email: "david@example.com",
        },
        {
          _id: "user_123463",
          name: "Lisa Martinez",
          email: "lisa@example.com",
        },
      ];

      const filteredUsers = query
        ? mockUsers.filter(
            (u) =>
              u.name.toLowerCase().includes(query.toLowerCase()) ||
              u.email.toLowerCase().includes(query.toLowerCase()),
          )
        : mockUsers;

      resolve({
        users: filteredUsers,
      });
    }, 500);
  });

  // When backend implements this endpoint, uncomment the code below
  // try {
  //   const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
  //   return response.data;
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};