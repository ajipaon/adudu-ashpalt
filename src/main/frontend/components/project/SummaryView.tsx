import ProjectSummaryDto from 'Frontend/generated/com/adudu/ashpalt/models/project/dto/ProjectSummaryDto';
import { ProjectService } from 'Frontend/generated/endpoints';
import { useEffect, useState } from 'react';

interface SummaryViewProps {
  projectId: string;
}

export default function SummaryView({ projectId }: SummaryViewProps) {
  const [summary, setSummary] = useState<ProjectSummaryDto | null>(null);

  useEffect(() => {
    if (projectId) {
      ProjectService.getProjectSummary(projectId)
        .then((data) => setSummary(data || null))
        .catch(console.error);
    }
  }, [projectId]);

  if (!summary) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold ">{summary.completed} completed</div>
              <div className="text-sm text-gray-700">in the last 7 days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.updated} updated</div>
              <div className="text-sm text-gray-700">in the last 7 days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.created} created</div>
              <div className="text-sm text-gray-700">in the last 7 days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.dueSoon} due soon</div>
              <div className="text-sm text-gray-700">in the next 7 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status Overview */}
        <div className="bg-white rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-black mb-2">Status overview</h3>
          <p className="text-sm text-gray-700 mb-4">
            Get a snapshot of the status of your work items.{' '}
          </p>
          <div className="flex items-center justify-center py-8">
            {/* Simple visualization for status overview */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {Object.entries(summary.statusOverview || {}).map(([status, count]) => (
                <div
                  key={status}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">{status}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-black mb-2">Priority breakdown</h3>
          <p className="text-sm text-gray-700 mb-4">
            Get a holistic view of how your work is being prioritized.{' '}
          </p>
          <div className="h-64 flex items-end justify-around gap-4 mb-4">
            {['DEFAULT', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => {
              const count = summary.priorityBreakdown?.[priority] || 0;
              const values = Object.values(summary.priorityBreakdown || { a: 0 }).filter(
                (v): v is number => typeof v === 'number'
              );
              const max = Math.max(...values, 1);
              const height = `${(count / max) * 100}%`;
              const color =
                priority === 'Highest'
                  ? 'bg-red-500'
                  : priority === 'High'
                    ? 'bg-orange-500'
                    : priority === 'Medium'
                      ? 'bg-yellow-500'
                      : priority === 'Low'
                        ? 'bg-blue-500'
                        : 'bg-gray-500';

              return (
                <div
                  key={priority}
                  className="flex flex-col items-center flex-1 h-full justify-end"
                >
                  <div
                    className={`w-full ${color} rounded-t transition-all duration-500`}
                    style={{ height: height || '1px' }}
                  ></div>
                  <div className="text-xs text-gray-700 mt-2">{priority}</div>
                  <div className="text-xs font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Types of Work */}
        <div className="bg-white rounded-lg p-6 border border-slate-700 col-span-2">
          <h3 className="text-lg font-semibold text-black mb-2">Types of work</h3>
          <p className="text-sm text-gray-700 mb-4">
            Get a breakdown of work items by their types.{' '}
          </p>
          <div className="space-y-3">
            {Object.entries(summary.typeBreakdown || {}).map(([type, count]) => {
              const values = Object.values(summary.typeBreakdown || {}).filter(
                (v): v is number => typeof v === 'number'
              );
              const total = values.reduce((a, b) => a + b, 0);
              const safeCount = count || 0;
              const percentage = total > 0 ? Math.round((safeCount / total) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32 capitalize">
                    <span className="text-sm text-gray-500">{type}</span>
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-700 w-12">
                    {safeCount} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
