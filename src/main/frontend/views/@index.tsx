import { useEffect, useState } from 'react';
import { PostMetaService } from 'Frontend/generated/endpoints';
import PostMeta from 'Frontend/generated/com/adudu/ashpalt/models/project/PostMeta';
import {MetaValueCalenderProps} from "Frontend/components/project/dto/projectDto";
import Post from "Frontend/generated/com/adudu/ashpalt/models/project/Post";
import PostmetaStatsDto from "Frontend/generated/com/adudu/ashpalt/models/project/dto/PostmetaStatsDto";

export const config = {
    route: '',
    title: 'Dashboard',
    menu: {
        order: 0,
        icon: 'line-awesome/svg/home-solid.svg'
    }
};


export default function MainView() {
    const [agendas, setAgendas] = useState<PostMeta[]>([]);
    const [tasks, setTasks] = useState<PostmetaStatsDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgendas = async () => {
            try {
                const data = await PostMetaService.getAssignedAgendas();
                setAgendas((data || []).filter((item): item is PostMeta => !!item));
                const dataTasks = await PostMetaService.getAssignedTasks();
                setTasks((dataTasks || []).filter((item): item is PostMeta => !!item));
            } catch (error) {
                console.log("Failed to fetch assigned agendas", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgendas();
    }, []);

    const stats = {
        totalAgendas: agendas.length,
        totalTasks: tasks.length,
        upcomingAgendas: agendas.filter(a => {
            try {
                const content: MetaValueCalenderProps = JSON.parse(a.metaValue || '{}');
                const date = new Date(content.date);
                const now = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(now.getDate() + 7);
                return date >= now && date <= nextWeek;
            } catch { return false; }
        }).length,
        recentTasks: tasks.slice(0, 5)
    };

    return (
        <div className="p-6 min-h-screen"
             style={{
                 backgroundImage: 'url(/images/photo-background-1.jpg)',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
             }}
        >
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Summary</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border ">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10  rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.totalAgendas}</div>
                            <div className="text-sm text-gray-700">Assigned Agendas</div>
                        </div>
                    </div>
                </div>



                <div className="bg-white rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.totalTasks}</div>
                            <div className="text-sm text-gray-700">Assigned Tasks</div>
                        </div>
                    </div>
                </div>

                <div className=" rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{stats.upcomingAgendas}</div>
                            <div className="text-sm text-gray-700">Agendas Due Soon (7 Days)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Agendas</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">Your upcoming and recent agendas.</p>

                    <div className="space-y-4">
                        {agendas.length === 0 ? (
                            <div className="text-gray-600 text-center py-4">No assigned agendas.</div>
                        ) : (
                            agendas.slice(0, 5).map((meta) => {
                                try {
                                    const content: MetaValueCalenderProps = JSON.parse(meta.metaValue || '{}');
                                    const date = new Date(content.date);
                                    const formattedDate = date.toLocaleDateString('id-ID', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    });

                                    return (
                                        <div key={meta.id} className="border-l-2 border-blue-500 pl-4">
                                            <div className="text-sm font-medium text-gray-700 mb-1">{formattedDate}</div>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-3 h-3 mt-1.5 rounded-full ${content.color || 'bg-blue-500'}`}></div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {content.title}
                                                    </div>
                                                    {content.startTime && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {content.startTime} {content.endTime ? `- ${content.endTime}` : ''}
                                                        </div>
                                                    )}
                                                    {content.description && (
                                                        <div className="mt-2 bg-slate-300 rounded p-3 text-sm text-black line-clamp-2">
                                                            {content.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    return null;
                                }
                            })
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tasks Overview</h3>
                    <p className="text-sm text-gray-700 mb-4">
                        Snapshot of your assigned tasks.
                    </p>

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-gray-600 text-center py-4">No assigned tasks.</div>
                        ) : (
                            tasks.slice(0, 10).map((task) => {
                                let title = "Task";
                                try {
                                    title = task?.postTitle  || "Untitled Task";
                                } catch {
                                    title = "Task " + task.id;
                                }

                                return (
                                    <div key={task.id} className="flex items-center gap-3">
                                        <div className="text-sm text-gray-300">
                                            <a href="#" className="text-slate-700 hover:underline">{task.postParentTitle} : {task.postTitle}</a>
                                            {' '}<span className="bg-slate-700 text-white px-2 py-0.5 rounded text-xs">{task.columnStatus}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

