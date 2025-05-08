import api from './api';

// Description: Get user projects
// Endpoint: GET /api/projects
// Request: { type: 'drafts' | 'deployed' }
// Response: { projects: Array<{ _id: string, title: string, thumbnail: string, lastEdited: string, visibility: 'private' | 'public' }> }
export const getUserProjects = async (type: 'drafts' | 'deployed') => {
    try {
        const response = await api.get(`/api/projects?type=${type}`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Delete projects
// Endpoint: DELETE /api/projects
// Request: { projectIds: string[] }
// Response: { success: boolean, message: string }
export const deleteProjects = async (data: { projectIds: string[] }) => {
    try {
        const response = await api.delete('/api/projects', { data });
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Rename project
// Endpoint: PUT /api/projects/:id/rename
// Request: { title: string }
// Response: { success: boolean, message: string, project: { _id: string, title: string } }
export const renameProject = async (projectId: string, data: { title: string }) => {
    try {
        const response = await api.put(`/api/projects/${projectId}/rename`, data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Create a new project draft
// Endpoint: POST /api/projects
// Request: { title: string, description?: string, visibility?: 'private' | 'public', thumbnail?: string }
// Response: { success: boolean, message: string, project: Project }
export const createProjectDraft = async (data: {
    title: string,
    description?: string,
    visibility?: 'private' | 'public',
    thumbnail?: string
}) => {
    try {
        const response = await api.post('/api/projects', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Deploy a project draft
// Endpoint: POST /api/projects/:id/deploy
// Request: {}
// Response: { success: boolean, message: string, project: Project }
export const deployProject = async (projectId: string) => {
    try {
        const response = await api.post(`/api/projects/${projectId}/deploy`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Get project access
// Endpoint: GET /api/projects/:id/access
// Request: {}
// Response: { users: Array<{ _id: string, name: string, email: string, access: 'view' | 'edit' }> }
export const getProjectAccess = async (projectId: string) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/access`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update project access
// Endpoint: PUT /api/projects/:id/access
// Request: { users: Array<{ id: string, access: 'view' | 'edit' }> }
// Response: { success: boolean, message: string }
export const updateProjectAccess = async (projectId: string, data: { users: Array<{ id: string, access: 'view' | 'edit' }> }) => {
  try {
    const response = await api.put(`/api/projects/${projectId}/access`, data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Duplicate a project
// Endpoint: POST /api/projects/:id/duplicate
// Request: {}
// Response: { success: boolean, message: string, project: Project }
export const duplicateProject = async (projectId: string) => {
    try {
        const response = await api.post(`/api/projects/${projectId}/duplicate`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};