import api from './api';

// Description: Get user projects
// Endpoint: GET /api/projects
// Request: { type: 'drafts' | 'deployed' }
// Response: { projects: Array<{ _id: string, title: string, thumbnail: string, lastEdited: string, visibility: 'private' | 'public' }> }
export const getUserProjects = (type: 'drafts' | 'deployed') => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockProjects = type === 'drafts'
                ? [
                    {
                        _id: 'proj_123456',
                        title: 'E-commerce Chatbot',
                        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                        lastEdited: '2023-06-15T14:23:56.789Z',
                        visibility: 'private'
                    },
                    {
                        _id: 'proj_123457',
                        title: 'Content Generator',
                        thumbnail: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                        lastEdited: '2023-06-10T09:12:34.567Z',
                        visibility: 'private'
                    },
                    {
                        _id: 'proj_123458',
                        title: 'Data Analyzer',
                        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                        lastEdited: '2023-06-05T16:45:12.345Z',
                        visibility: 'public'
                    }
                ]
                : [
                    {
                        _id: 'proj_123459',
                        title: 'Language Translator',
                        thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                        lastEdited: '2023-06-12T11:30:00.000Z',
                        visibility: 'public'
                    },
                    {
                        _id: 'proj_123460',
                        title: 'Image Generator',
                        thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                        lastEdited: '2023-06-08T14:45:00.000Z',
                        visibility: 'private'
                    }
                ];

            resolve({
                projects: mockProjects
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/projects?type=${type}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Delete projects
// Endpoint: DELETE /api/projects
// Request: { projectIds: string[] }
// Response: { success: boolean, message: string }
export const deleteProjects = (data: { projectIds: string[] }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Successfully deleted ${data.projectIds.length} project(s)`
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.delete('/api/projects', { data });
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Rename project
// Endpoint: PUT /api/projects/:id/rename
// Request: { title: string }
// Response: { success: boolean, message: string, project: { _id: string, title: string } }
export const renameProject = (projectId: string, data: { title: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project renamed successfully',
                project: {
                    _id: projectId,
                    title: data.title
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/projects/${projectId}/rename`, data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get project access
// Endpoint: GET /api/projects/:id/access
// Request: {}
// Response: { users: Array<{ id: string, name: string, email: string, access: 'view' | 'edit' }> }
export const getProjectAccess = (projectId: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                users: [
                    {
                        _id: 'user_123456',
                        name: 'John Doe',
                        email: 'john@example.com',
                        access: 'edit'
                    },
                    {
                        _id: 'user_123457',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        access: 'view'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/projects/${projectId}/access`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update project access
// Endpoint: PUT /api/projects/:id/access
// Request: { users: Array<{ id: string, access: 'view' | 'edit' }> }
// Response: { success: boolean, message: string }
export const updateProjectAccess = (projectId: string, data: { users: Array<{ id: string, access: 'view' | 'edit' }> }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project access updated successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/projects/${projectId}/access`, data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};