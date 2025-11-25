import { useEffect, useState } from 'react';
import { ProjectService } from 'Frontend/generated/endpoints';
import Project from 'Frontend/generated/com/adudu/ashpalt/models/project/Project';
import { Button, TextField, Dialog, VerticalLayout, Grid } from '@vaadin/react-components';
import { useNavigate } from 'react-router';
import ProjectMembersDialog from 'Frontend/components/project/ProjectMembersDialog';

export default function ProjectListView() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            const projs = await ProjectService.findAllProjects();
            setProjects(projs ? projs.filter((p): p is Project => !!p) : []);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    }

    async function handleAddProject() {
        if (!newProjectTitle) return;

        const newProject: Project = {
            title: newProjectTitle,
            description: newProjectDescription
        };

        try {
            await ProjectService.saveProject(newProject);
            setNewProjectTitle('');
            setNewProjectDescription('');
            setIsDialogOpen(false);
            loadProjects();
        } catch (error) {
            console.error("Failed to save project", error);
        }
    }

    async function handleDeleteProject(id: string) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await ProjectService.deleteProject(id);
            loadProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    }

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Projects</h1>
                <Button theme="primary" onClick={() => setIsDialogOpen(true)}>New Project</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col justify-between h-48">
                        <div onClick={() => navigate(`/project/${project.id}`)} className="cursor-pointer flex-1">
                            <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition-colors">{project.title}</h2>
                            <p className="text-gray-500 line-clamp-3 text-sm">{project.description}</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <Button
                                theme="tertiary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProjectForMembers(project.id!);
                                }}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <span className="la la-users mr-1"></span>
                                Members
                            </Button>
                            <Button
                                theme="tertiary error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id!);
                                }}
                                className="text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                        <div className="text-gray-400 text-5xl mb-4 la la-folder-open"></div>
                        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
                        <Button theme="primary" onClick={() => setIsDialogOpen(true)}>Create Project</Button>
                    </div>
                )}
            </div>

            <Dialog headerTitle="New Project" opened={isDialogOpen} onOpenedChanged={({ detail }) => setIsDialogOpen(detail.value)}>
                <div className="flex flex-col gap-4 p-1 w-full sm:w-[400px]">
                    <TextField
                        label="Title"
                        value={newProjectTitle}
                        onChange={e => setNewProjectTitle(e.target.value)}
                        className="w-full"
                    />
                    <TextField
                        label="Description"
                        value={newProjectDescription}
                        onChange={e => setNewProjectDescription(e.target.value)}
                        className="w-full"
                    />
                    <div className="flex justify-end pt-2">
                        <Button theme="primary" onClick={handleAddProject}>Save</Button>
                    </div>
                </div>
            </Dialog>

            {selectedProjectForMembers && (
                <ProjectMembersDialog
                    projectId={selectedProjectForMembers}
                    isOpen={!!selectedProjectForMembers}
                    onClose={() => setSelectedProjectForMembers(null)}
                />
            )}
        </div>
    );
}
