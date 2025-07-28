import api from './api';

// Description: Get user projects from Pythagora API
// Endpoint: GET /projects
// Request: {}
// Response: { projects: Array<{ id: string, name: string, folder_name: string, updated_at: string, created_at?: string }> }
export const getProjects = async () => {
  try {
    console.log('ProjectsAPI: Fetching projects from Pythagora API');
    const response = await api.get('/projects');
    console.log('ProjectsAPI: Projects fetched successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('ProjectsAPI: Error fetching projects:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a deployed project
// Endpoint: POST /deployment/delete/:projectId
// Request: { projectId: string, folderPath: string }
// Response: { success: boolean, message: string }
export const deleteDeployedProject = async (projectId: string, folderPath: string) => {
  try {
    console.log('ProjectsAPI: Deleting deployed project:', { projectId, folderPath });

    // Make the delete request with the standard Authorization header
    const response = await api.post(`/deployment/delete/${projectId}`,
      { folderPath }
    );

    console.log('ProjectsAPI: Deployed project deleted successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('ProjectsAPI: Error deleting deployed project:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Setup custom domain for a deployed project
// Endpoint: POST /deployment/custom-domain
// Request: { domain: string, projectId: string, folderPath: string }
// Response: { message: string, domain: string, publicIp: string, dnsInstructions: { type: string, name: string, value: string, ttl: number, instructions: string }, status: string }
export const setupCustomDomain = async (projectId: string, folderPath: string, domain: string) => {
  try {
    console.log('ProjectsAPI: Setting up custom domain:', { projectId, folderPath, domain });

    // Make the custom domain setup request with standard Authorization header
    const response = await api.post('/deployment/custom-domain',
      {
        domain,
        projectId,
        folderPath
      }
    );

    console.log('ProjectsAPI: Custom domain setup initiated successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('ProjectsAPI: Error setting up custom domain:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete custom domain for a deployed project
// Endpoint: DELETE /deployment/custom-domain/:domain
// Request: { domain: string }
// Response: { success: boolean, message: string }
export const deleteCustomDomain = async (domain: string) => {
  try {
    console.log('ProjectsAPI: Deleting custom domain:', { domain });

    // Make the delete request with standard Authorization header
    const response = await api.delete(`/deployment/custom-domain/${domain}`);

    console.log('ProjectsAPI: Custom domain deleted successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('ProjectsAPI: Error deleting custom domain:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a project
// Endpoint: DELETE /api/projects/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const deleteProject = (id: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'Project deleted successfully' });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.delete(`/api/projects/${id}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}

// Description: Rename a project
// Endpoint: PUT /api/projects/:id
// Request: { id: string, name: string }
// Response: { success: boolean, message: string, project: { id: string, name: string, folder_name: string, updated_at: string } }
export const renameProject = (id: string, name: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project renamed successfully',
                project: {
                    id,
                    name,
                    folder_name: name.toLowerCase().replace(/\s+/g, '-'),
                    updated_at: new Date().toISOString()
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/projects/${id}`, { name });
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}

// Description: Create a new project
// Endpoint: POST /api/projects
// Request: { name: string, description?: string }
// Response: { success: boolean, message: string, project: { id: string, name: string, folder_name: string, created_at: string } }
export const createProject = (name: string, description?: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project created successfully',
                project: {
                    id: Math.random().toString(36).substring(2, 15),
                    name,
                    folder_name: name.toLowerCase().replace(/\s+/g, '-'),
                    created_at: new Date().toISOString()
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post('/api/projects', { name, description });
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}

// Description: Deploy a project
// Endpoint: POST /api/projects/:id/deploy
// Request: { id: string }
// Response: { success: boolean, message: string, deploymentUrl?: string }
export const deployProject = (id: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project deployed successfully',
                deploymentUrl: `https://${id}.deployments.pythagora.ai`
            });
        }, 1000);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post(`/api/projects/${id}/deploy`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}

// Description: Update project access (make public/private)
// Endpoint: PUT /api/projects/:id/access
// Request: { id: string, isPublic: boolean }
// Response: { success: boolean, message: string }
export const updateProjectAccess = (id: string, isPublic: boolean) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Project access updated to ${isPublic ? 'public' : 'private'}`
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put(`/api/projects/${id}/access`, { isPublic });
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}

// Description: Duplicate a project
// Endpoint: POST /api/projects/:id/duplicate
// Request: { id: string }
// Response: { success: boolean, message: string, project: { id: string, name: string, folder_name: string, created_at: string } }
export const duplicateProject = (id: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Project duplicated successfully',
                project: {
                    id: Math.random().toString(36).substring(2, 15),
                    name: `Copy of Project`,
                    folder_name: `copy-of-project-${Math.random().toString(36).substring(2, 7)}`,
                    created_at: new Date().toISOString()
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post(`/api/projects/${id}/duplicate`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
}