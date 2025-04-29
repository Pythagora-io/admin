import api from './api';

// Description: Get team members
// Endpoint: GET /api/team
// Request: {}
// Response: { members: Array<{ id: string, name: string, email: string, role: 'admin' | 'developer' | 'viewer', joinedAt: string }> }
export const getTeamMembers = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                members: [
                    {
                        _id: 'user_123456',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'admin',
                        joinedAt: '2023-01-15T10:30:00.000Z'
                    },
                    {
                        _id: 'user_123457',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: 'developer',
                        joinedAt: '2023-02-10T14:45:00.000Z'
                    },
                    {
                        _id: 'user_123458',
                        name: 'Robert Johnson',
                        email: 'robert@example.com',
                        role: 'viewer',
                        joinedAt: '2023-03-05T09:15:00.000Z'
                    },
                    {
                        _id: 'user_123459',
                        name: 'Sarah Williams',
                        email: 'sarah@example.com',
                        role: 'developer',
                        joinedAt: '2023-04-20T11:30:00.000Z'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/team');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Invite team member
// Endpoint: POST /api/team/invite
// Request: { email: string }
// Response: { success: boolean, message: string }
export const inviteTeamMember = (data: { email: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Invitation sent to ${data.email}`
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post('/api/team/invite', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Remove team member
// Endpoint: DELETE /api/team/:id
// Request: {}
// Response: { success: boolean, message: string }
export const removeTeamMember = (memberId: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Team member removed successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.delete(`/api/team/${memberId}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update team member role
// Endpoint: PUT /api/team/:id/role
// Request: { role: 'admin' | 'developer' | 'viewer' }
// Response: { success: boolean, message: string }
export const updateTeamMemberRole = (memberId: string, data: { role: 'admin' | 'developer' | 'viewer' }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Team member role updated to ${data.role}`
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/team/${memberId}/role`, data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get member access
// Endpoint: GET /api/team/:id/access
// Request: {}
// Response: { projects: Array<{ id: string, name: string, access: 'view' | 'edit' }> }
export const getMemberAccess = (memberId: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                projects: [
                    {
                        _id: 'proj_123456',
                        name: 'E-commerce Chatbot',
                        access: 'edit'
                    },
                    {
                        _id: 'proj_123457',
                        name: 'Content Generator',
                        access: 'view'
                    },
                    {
                        _id: 'proj_123458',
                        name: 'Data Analyzer',
                        access: 'view'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/team/${memberId}/access`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update member access
// Endpoint: PUT /api/team/:id/access
// Request: { projects: Array<{ id: string, access: 'view' | 'edit' }> }
// Response: { success: boolean, message: string }
export const updateMemberAccess = (memberId: string, data: { projects: Array<{ id: string, access: 'view' | 'edit' }> }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Member access updated successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/team/${memberId}/access`, data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Search users in organization
// Endpoint: GET /api/users/search
// Request: { query: string }
// Response: { users: Array<{ _id: string, name: string, email: string }> }
export const searchUsers = (query: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockUsers = [
                { _id: 'user_123456', name: 'John Doe', email: 'john@example.com' },
                { _id: 'user_123457', name: 'Jane Smith', email: 'jane@example.com' },
                { _id: 'user_123458', name: 'Robert Johnson', email: 'robert@example.com' },
                { _id: 'user_123459', name: 'Sarah Williams', email: 'sarah@example.com' },
                { _id: 'user_123460', name: 'Michael Brown', email: 'michael@example.com' },
                { _id: 'user_123461', name: 'Emily Davis', email: 'emily@example.com' },
                { _id: 'user_123462', name: 'David Wilson', email: 'david@example.com' },
                { _id: 'user_123463', name: 'Lisa Martinez', email: 'lisa@example.com' }
            ];

            const filteredUsers = query
                ? mockUsers.filter(u => 
                    u.name.toLowerCase().includes(query.toLowerCase()) || 
                    u.email.toLowerCase().includes(query.toLowerCase())
                )
                : mockUsers;

            resolve({
                users: filteredUsers
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Search projects
// Endpoint: GET /api/projects/search
// Request: { query: string }
// Response: { projects: Array<{ id: string, name: string }> }
export const searchProjects = (query: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockProjects = [
                { _id: 'proj_123456', name: 'E-commerce Chatbot' },
                { _id: 'proj_123457', name: 'Content Generator' },
                { _id: 'proj_123458', name: 'Data Analyzer' },
                { _id: 'proj_123459', name: 'Language Translator' },
                { _id: 'proj_123460', name: 'Image Generator' },
                { _id: 'proj_123461', name: 'Meeting Summarizer' },
                { _id: 'proj_123462', name: 'Code Assistant' },
                { _id: 'proj_123463', name: 'FAQ Bot' },
                { _id: 'proj_123464', name: 'Document Scanner' }
            ];

            const filteredProjects = query
                ? mockProjects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
                : mockProjects;

            resolve({
                projects: filteredProjects
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/projects/search?query=${encodeURIComponent(query)}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};