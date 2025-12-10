import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button, Dialog, TextField } from '@vaadin/react-components';
import AvatarGroup from 'Frontend/components/AvatarGroup';
import Post from 'Frontend/generated/com/adudu/ashpalt/models/project/Post';
import Project from 'Frontend/generated/com/adudu/ashpalt/models/project/Project';
import { ProjectService } from 'Frontend/generated/endpoints';
import { useProjectMembersStore } from 'Frontend/store/projectMembersStore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import CalendarView from '../../components/project/CalendarView';
import SummaryView from '../../components/project/SummaryView';
import TaskDetailModal from '../../components/project/TaskDetailModal';
type ColumnWithTasks = {
  id?: string;
  postTitle?: string;
  postOrder?: number;
  postParent?: string;
  tasks?: Post[];
};

export default function BoardView() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project>();
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [openMenuColumnId, setOpenMenuColumnId] = useState<string | null>(null);
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<
    'summary' | 'timeline' | 'backlog' | 'board' | 'calendar'
  >('board');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { projectMembersStore } = useProjectMembersStore();
  const [editColumn, setEditColumn] = useState<ColumnWithTasks | null>(null);

  useEffect(() => {
    const updateCurrent = async () => {
      const query = new URLSearchParams(window.location.search);
      const currentParam = query.get('current');

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('Pesan ini muncul setelah 1 detik');
          resolve();
        }, 1000);
      });

      setCurrentTaskId(currentParam);
    };

    updateCurrent();

    window.addEventListener('popstate', updateCurrent);
    return () => window.removeEventListener('popstate', updateCurrent);
  }, []);

  useEffect(() => {
    if (projectId) loadProject(projectId);
  }, [projectId, projectMembersStore]);

  useEffect(() => {
    const el = document.getElementById('board-scroll');
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let isDraggingTask = false;

    const onDragStart = () => (isDraggingTask = true);
    const onDragEnd = () => setTimeout(() => (isDraggingTask = false), 50);

    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragend', onDragEnd);

    const mouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return;
      if (isDraggingTask) return;

      e.preventDefault();
      isDown = true;
      el.style.cursor = 'grabbing';

      startX = e.pageX;
      scrollLeft = el.scrollLeft;
    };

    const mouseUp = () => {
      isDown = false;
      el.style.cursor = 'default';
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      el.scrollLeft = scrollLeft - dx;
    };

    const wheelBlock = (e: WheelEvent) => {
      e.preventDefault();
    };

    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('mousedown', mouseDown);
    el.addEventListener('mouseup', mouseUp);
    el.addEventListener('mouseleave', mouseUp);
    el.addEventListener('mousemove', mouseMove);
    el.addEventListener('wheel', wheelBlock, { passive: false });

    return () => {
      el.removeEventListener('mousedown', mouseDown);
      el.removeEventListener('mouseup', mouseUp);
      el.removeEventListener('mouseleave', mouseUp);
      el.removeEventListener('mousemove', mouseMove);
      el.removeEventListener('wheel', wheelBlock);
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuColumnId(null);
      setOpenMenuTaskId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function loadProject(id: string) {
    const proj = await ProjectService.getProject(id);
    if (!proj) return;
    setProject(proj);

    const cols = await ProjectService.getColumnsByProjectId(id);
    if (!cols) return;

    const columnsWithTasks: ColumnWithTasks[] = [];

    for (const col of cols) {
      if (!col || !col.id) continue;

      const tasks = await ProjectService.getTasksByColumnId(col.id, projectMembersStore?.userId);
      const sortedTasks = (tasks || [])
        .filter((t): t is Post => !!t)
        .sort((a, b) => (a.postOrder || 0) - (b.postOrder || 0));

      columnsWithTasks.push({
        id: col.id,
        postTitle: col.postTitle,
        postOrder: col.postOrder,
        postParent: col.postParent,
        tasks: sortedTasks,
      });
    }

    columnsWithTasks.sort((a, b) => (a.postOrder || 0) - (b.postOrder || 0));
    setColumns(columnsWithTasks);
  }

  async function handleAddColumn() {
    if (!project || !newColumnName) return;

    await ProjectService.saveColumn({
      postType: 'column',
      postTitle: newColumnName,
      postOrder: columns.length + 1,
      postParent: project.id,
    });

    setNewColumnName('');
    setIsColumnDialogOpen(false);
    await loadProject(project.id!);
  }

  async function handleAddTask() {
    if (!selectedColumnId || !newTaskTitle) return;
    if (!project) return;
    const col = columns.find((c) => c.id === selectedColumnId);
    if (!col) return;

    await ProjectService.saveTask({
      postType: 'task',
      postTitle: newTaskTitle,
      postParent: col.id,
      postOrder: col.tasks?.length || 0,
      projectId: project.id,
    });

    setNewTaskTitle('');
    setIsTaskDialogOpen(false);
    await loadProject(project!.id!);
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceCol = columns.find((c) => c.id === source.droppableId);
    const destCol = columns.find((c) => c.id === destination.droppableId);
    if (!sourceCol || !destCol) return;

    const newColumns = [...columns];
    const sourceTasks = [...(sourceCol.tasks || [])];
    const destTasks =
      source.droppableId === destination.droppableId ? sourceTasks : [...(destCol.tasks || [])];

    const [moved] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, moved);

    sourceTasks.forEach((t, i) => (t.postOrder = i));
    destTasks.forEach((t, i) => (t.postOrder = i));

    sourceCol.tasks = sourceTasks;
    destCol.tasks = destTasks;

    setColumns(newColumns);
    await ProjectService.moveTask(draggableId, destCol.id!, destination.index);
  }

  async function handleDeleteColumn(colId: string) {
    await ProjectService.deleteColumn(colId);
    setOpenMenuColumnId(null);
    await loadProject(project!.id!);
  }
  async function handleMoveColumn(colId: string, index: string) {
    let int1 = parseInt(index);
    await ProjectService.moveOrderColumn(colId, int1);
    setOpenMenuColumnId(null);
    await loadProject(project!.id!);
  }

  async function handleDeleteTask(taskId: string) {
    await ProjectService.deleteTask(taskId);
    setOpenMenuTaskId(null);
    await loadProject(project!.id!);
  }

  async function handleSaveColumnName() {
    try {
      const currentColumn = await ProjectService.getTask(editColumn?.id);
      if (currentColumn) {
        currentColumn.postTitle = editColumn?.postTitle;
        await ProjectService.saveTask(currentColumn);
      }
    } catch (error) {
      console.error('Failed to save task', error);
    }
    if (projectId) await loadProject(projectId);
    setEditColumn(null);
  }

  if (!project) return <div>Loading...</div>;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden select-none"
      style={{
        backgroundImage: 'url(/images/photo-background-1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="backdrop-blur-md bg-white/20 border   shadow-lg text-white">
        <div className="px-6 py-3 flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">{project.title}</h1>
            {project.description && <p className="text-sm text-gray-400">{project.description}</p>}
          </div>
        </div>

        <div className="px-6 flex gap-1 border-t border-slate-700">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors ${
              activeTab === 'summary' ? 'bg-slate-700 border-b-2 ' : ''
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors ${
              activeTab === 'timeline' ? 'bg-slate-700 border-b-2' : ''
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('backlog')}
            className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors ${
              activeTab === 'backlog' ? 'bg-slate-700 border-b-2' : ''
            }`}
          >
            Backlog
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors ${
              activeTab === 'board' ? 'bg-slate-700 border-b-2' : ''
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-3 text-sm font-medium hover:bg-slate-700 transition-colors ${
              activeTab === 'calendar' ? 'bg-slate-700 border-b-2 ' : ''
            }`}
          >
            Calendar
          </button>
          {activeTab == 'board' && <AvatarGroup projectId={projectId!} />}
        </div>
      </div>

      {activeTab === 'summary' && <SummaryView projectId={projectId!} />}

      {activeTab === 'board' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div id="board-scroll" className="flex-1 overflow-x-auto whitespace-nowrap">
            <div className="flex gap-6 p-6 items-start">
              {columns.map((col) => (
                <div
                  key={col.id}
                  className="w-80 min-w-[20rem] bg-gray-100 rounded-xl shadow-lg flex flex-col relative"
                >
                  <div className="p-4 border-b text-gray-700 font-bold flex justify-between items-center group">
                    {editColumn?.id == col.id ? (
                      <input
                        type="text"
                        value={editColumn?.postTitle || ''}
                        onChange={(e) =>
                          setEditColumn((prev: Post | null) =>
                            prev ? { ...prev, postTitle: e.target.value } : null
                          )
                        }
                        onBlur={() => handleSaveColumnName()}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveColumnName()}
                        className="w-full font-bold text-gray-100 border-2 border-blue-500 rounded focus:outline-none bg-slate-700"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:pointer-events-auto"
                        onClick={() => setEditColumn(col)}
                      >
                        {col.postTitle}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuPosition({ x: rect.right + 10, y: rect.bottom });
                        setOpenMenuColumnId(openMenuColumnId === col.id ? null : col.id!);
                      }}
                      className="opacity-100 p-1 hover:bg-gray-300 rounded transition-all"
                      title="Column actions"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>

                    {openMenuColumnId === col.id && (
                      <div
                        className="fixed bg-slate-700 text-white rounded-lg  z-50 py-2 w-1/6"
                        style={{
                          left: `${menuPosition.x}px`,
                          top: `${menuPosition.y}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedColumnId(col.id!);
                            setIsTaskDialogOpen(true);
                            setOpenMenuColumnId(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors"
                        >
                          Add card
                        </button>
                        <hr className="my-2 border-gray-700" />
                        <div className="w-full px-4 py-2 text-left">
                          <label className="text-sm text-left font-semibold text-gray-400 block">
                            Move List
                          </label>
                          <select
                            value={col.postOrder}
                            onChange={(e) => {
                              handleMoveColumn(col.id!!, e.target.value).then((r) => {
                                return;
                              });
                            }}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {columns.map((cols, index) => {
                              return (
                                <option
                                  key={cols.id}
                                  value={cols.postOrder}
                                  disabled={col.postOrder === cols?.postOrder}
                                >
                                  {index === cols?.postOrder
                                    ? cols?.postOrder + 1
                                    : cols?.postOrder}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <hr className="my-2 border-gray-700" />
                        <button
                          onClick={() => handleDeleteColumn(col.id!)}
                          className="w-full px-4 py-2 text-left hover:bg-red-600 transition-colors text-red-400 hover:text-white"
                        >
                          Delete list
                        </button>
                      </div>
                    )}
                  </div>

                  <Droppable droppableId={col.id!}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                      >
                        {col.tasks?.map((task, i) => (
                          <Draggable key={task.id} draggableId={task.id!} index={i}>
                            {(provided, snap) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 bg-white rounded-lg shadow mb-3 "
                                onClick={() => {
                                  const url = new URL(window.location.href);
                                  url.searchParams.set('current', task?.id!!);
                                  window.history.pushState({}, '', url.toString());
                                  setCurrentTaskId(task?.id!);
                                }}
                                style={provided.draggableProps.style}
                              >
                                <div className="flex justify-between items-center group border-b text-gray-700 font-bold group">
                                  {task.postTitle}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = (
                                        e.currentTarget as HTMLElement
                                      ).getBoundingClientRect();
                                      setMenuPosition({ x: rect.right + 10, y: rect.bottom });
                                      setOpenMenuTaskId(
                                        openMenuTaskId === task.id ? null : task.id!
                                      );
                                    }}
                                    className="opacity-100 p-1 hover:bg-gray-300 rounded transition-all"
                                    title="Column actions"
                                  >
                                    <svg
                                      className="w-5 h-5 text-gray-600"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="12" cy="5" r="2" />
                                      <circle cx="12" cy="12" r="2" />
                                      <circle cx="12" cy="19" r="2" />
                                    </svg>
                                  </button>
                                </div>
                                {openMenuTaskId === task.id && (
                                  <div
                                    className="fixed bg-slate-700 text-white rounded-lg  z-50 py-2 max-w-56"
                                    style={{
                                      left: `${menuPosition.x}px`,
                                      top: `${menuPosition.y}px`,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <hr className="my-2 border-gray-700" />
                                    <button
                                      onClick={() => handleDeleteTask(task.id!)}
                                      className="w-full px-4 py-2 text-left hover:bg-red-600 transition-colors text-red-400 hover:text-white"
                                    >
                                      Delete Task
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button
                    onClick={() => {
                      setSelectedColumnId(col.id!);
                      setIsTaskDialogOpen(true);
                    }}
                    className="p-3 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    + Add a card
                  </button>
                </div>
              ))}

              <button
                onClick={() => setIsColumnDialogOpen(true)}
                className="w-40 h-12 bg-slate-700 text-white rounded-xl border-white/30"
              >
                + Add list
              </button>
            </div>
          </div>
        </DragDropContext>
      )}

      {activeTab === 'timeline' && (
        <div className="flex-1 flex items-center justify-center backdrop-blur-md bg-white/20 border shadow-lgtext-gray-400">
          Timeline view - Coming soon
        </div>
      )}

      {activeTab === 'backlog' && (
        <div className="flex-1 flex items-center justify-center backdrop-blur-md bg-white/20 border shadow-lg">
          Backlog view - Coming soon
        </div>
      )}

      {activeTab === 'calendar' && <CalendarView projectId={projectId!} />}

      <Dialog
        headerTitle="New Column"
        opened={isColumnDialogOpen}
        onOpenedChanged={(e) => setIsColumnDialogOpen(e.detail.value)}
      >
        <div className="p-3 flex flex-col gap-3">
          <TextField
            label="Name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
          />
          <Button theme="primary" onClick={handleAddColumn}>
            Save
          </Button>
        </div>
      </Dialog>

      <Dialog
        headerTitle="New Task"
        opened={isTaskDialogOpen}
        onOpenedChanged={(e) => setIsTaskDialogOpen(e.detail.value)}
      >
        <div className="p-3 flex flex-col gap-3">
          <TextField
            label="Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <Button theme="primary" onClick={handleAddTask}>
            Save
          </Button>
        </div>
      </Dialog>

      <TaskDetailModal
        taskId={currentTaskId}
        isOpen={!!currentTaskId}
        projectId={projectId!}
        onClose={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('current');
          window.history.pushState({}, '', url.toString());
          setCurrentTaskId(null);
          project?.id && loadProject(project.id);
        }}
        columns={columns}
      />
    </div>
  );
}
