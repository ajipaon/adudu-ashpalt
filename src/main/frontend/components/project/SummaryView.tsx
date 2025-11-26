import { useEffect, useState } from 'react';
import { ProjectService } from 'Frontend/generated/endpoints';

interface SummaryViewProps {
    projectId: string;
}

export default function SummaryView({ projectId }: SummaryViewProps) {
    const [stats, setStats] = useState({
        completed: 13,
        updated: 37,
        created: 25,
        dueSoon: 0
    });

    return (
        <div className="p-6  min-h-screen">
            {/*<div className="mb-6">*/}
            {/*    <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 flex items-center gap-2">*/}
            {/*        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">*/}
            {/*            <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />*/}
            {/*        </svg>*/}
            {/*        Filter*/}
            {/*    </button>*/}
            {/*</div>*/}

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.completed} completed</div>
                            <div className="text-sm text-gray-400">in the last 7 days</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.updated} updated</div>
                            <div className="text-sm text-gray-400">in the last 7 days</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.created} created</div>
                            <div className="text-sm text-gray-400">in the last 7 days</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.dueSoon} due soon</div>
                            <div className="text-sm text-gray-400">in the next 7 days</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Status Overview */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Status overview</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Get a snapshot of the status of your work items. <a href="#" className="text-blue-400 hover:underline">View all work items</a>
                    </p>
                    <div className="flex items-center justify-center py-8">
                        <div className="relative w-64 h-64">
                            <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                {/* Donut chart segments */}
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="40" strokeDasharray="150 500" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#8b5cf6" strokeWidth="40" strokeDasharray="100 500" strokeDashoffset="-150" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray="80 500" strokeDashoffset="-250" />
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray="70 500" strokeDashoffset="-330" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-4xl font-bold text-white">265</div>
                                <div className="text-sm text-gray-400">Total work item...</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-300">WAITING SCHOOL...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-sm text-gray-300">DONE: 11 - 80</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                            <span className="text-sm text-gray-300">To Do: 38</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-300">UNRESOLVED: 8</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-300">Done: 43</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-300">In Progress: 80</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recent activity</h3>
                        <button className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Stay up to date with what's happening across the space.</p>

                    <div className="space-y-4">
                        <div className="border-l-2 border-blue-500 pl-4">
                            <div className="text-sm font-medium text-gray-400 mb-2">Yesterday</div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    J
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-300">
                                        <span className="text-blue-400">Jatin_NTB</span> commented on{' '}
                                        <a href="#" className="text-blue-400 hover:underline">HD-2363: [Tiwari] [Setting Kode CID BNI 46]</a>
                                        {' '}<span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">IN PROGRESS</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">about 12 hours ago</div>
                                    <div className="mt-2 bg-slate-900 rounded p-3 text-sm text-gray-300">
                                        <div className="font-semibold mb-1">Revisi Email :</div>
                                        <div>Nomor HP : +62 812-5856-1226</div>
                                        <div>Email : <a href="mailto:ida.pandulan@pn.co.id" className="text-blue-400">ida.pandulan@pn.co.id</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Priority breakdown</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Get a holistic view of how your work is being prioritized. <a href="#" className="text-blue-400 hover:underline">How to manage priorities for spaces</a>
                    </p>
                    <div className="h-64 flex items-end justify-around gap-4 mb-4">
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-full bg-red-500 rounded-t" style={{ height: '20%' }}></div>
                            <div className="text-xs text-gray-400 mt-2">Highest</div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-full bg-orange-500 rounded-t" style={{ height: '30%' }}></div>
                            <div className="text-xs text-gray-400 mt-2">High</div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-full bg-yellow-500 rounded-t" style={{ height: '50%' }}></div>
                            <div className="text-xs text-gray-400 mt-2">Medium</div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-full bg-blue-500 rounded-t" style={{ height: '15%' }}></div>
                            <div className="text-xs text-gray-400 mt-2">Low</div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="w-full bg-gray-500 rounded-t" style={{ height: '10%' }}></div>
                            <div className="text-xs text-gray-400 mt-2">Lowest</div>
                        </div>
                    </div>
                </div>

                {/* Related Work */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Related work from other projects</h3>
                    <p className="text-sm text-gray-400 mb-4">Connect work items across projects to improve tracking and visibility.</p>
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        Related work items from other projects will appear here.
                    </div>
                </div>

                {/* Team Workload */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Team workload</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Monitor the capacity of your team. <a href="#" className="text-blue-400 hover:underline">Reassign work items to get the right balance</a>
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                S
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-300 mb-1">salesteknodigit...</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">32%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                P
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-300 mb-1">prodiki.qa</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">15%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                R
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-300 mb-1">f0kic80</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">15%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                B
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-300 mb-1">backend-NU</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '13%' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">13%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                J
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-300 mb-1">Jatin_NTB</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Epic progress</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        See how your epics are progressing at a glance. <a href="#" className="text-blue-400 hover:underline">View all epics</a>
                    </p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-gray-300">HD-1 BUG DAN ERROR</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div className="flex h-full">
                                        <div className="bg-green-500" style={{ width: '52%' }}></div>
                                        <div className="bg-blue-500" style={{ width: '14%' }}></div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 w-12">52%</span>
                                <span className="text-xs text-blue-400 w-12">14%</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-gray-300">HD-2 SETTING KODE BILLER</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div className="flex h-full">
                                        <div className="bg-green-500" style={{ width: '73%' }}></div>
                                        <div className="bg-blue-500" style={{ width: '26%' }}></div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 w-12">73%</span>
                                <span className="text-xs text-blue-400 w-12">26%</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-gray-300">HD-6 PERUBAHAN DATA</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div className="flex h-full">
                                        <div className="bg-green-500" style={{ width: '63%' }}></div>
                                        <div className="bg-blue-500" style={{ width: '8%' }}></div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 w-12">63%</span>
                                <span className="text-xs text-blue-400 w-12">8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Types of Work */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-2">Types of work</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Get a breakdown of work items by their types. <a href="#" className="text-blue-400 hover:underline">View all items</a>
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-32">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-300">Task</span>
                            </div>
                            <div className="flex-1 bg-slate-700 rounded-full h-3">
                                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '89%' }}></div>
                            </div>
                            <span className="text-xs text-gray-400 w-12">89%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-32">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                </svg>
                                <span className="text-sm text-gray-300">Story</span>
                            </div>
                            <div className="flex-1 bg-slate-700 rounded-full h-3">
                                <div className="bg-green-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <span className="text-xs text-gray-400 w-12">0%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-32">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-300">Epic</span>
                            </div>
                            <div className="flex-1 bg-slate-700 rounded-full h-3">
                                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <span className="text-xs text-gray-400 w-12">0%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-32">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-300">Bug</span>
                            </div>
                            <div className="flex-1 bg-slate-700 rounded-full h-3">
                                <div className="bg-red-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <span className="text-xs text-gray-400 w-12">0%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-32">
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-300">Subtask</span>
                            </div>
                            <div className="flex-1 bg-slate-700 rounded-full h-3">
                                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <span className="text-xs text-gray-400 w-12">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
