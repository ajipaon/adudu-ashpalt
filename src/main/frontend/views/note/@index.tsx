import RichTextEditor from 'Frontend/components/RichTextEditor';
import Note from 'Frontend/generated/com/adudu/ashpalt/models/note/Note';
import CreateNoteRequest from 'Frontend/generated/com/adudu/ashpalt/services/note/NoteService/CreateNoteRequest';
import { NoteService } from 'Frontend/generated/endpoints';
import { Plus, Share2, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface TeamNote {
  id: number;
  title: string;
  content: string;
  author: string;
  teamId: string;
  teamName: string;
  sharedWithTeams: string[];
  createdAt: string;
  isPublic: boolean;
}

interface ShareRequest {
  noteId: string;
  teamIds: string[];
}

export default function TeamNoteApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', teamId: 'backend' });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const teams = [
    { id: 'backend', name: 'Backend' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'qa', name: 'QA' },
    { id: 'devops', name: 'DevOps' },
    { id: 'design', name: 'Design' },
  ];

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = (await NoteService.getAllNotes()) ?? [];
      setNotes(data.filter((n): n is Note => !!n));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    // Basic validation: must have content
    if (!newNote.content.trim()) {
      alert('Konten tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      let titleToUse = newNote.title.trim();

      // Auto-generate title if empty
      if (!titleToUse) {
        // Create a temporary DOM element to extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newNote.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Take first line or first 50 chars
        const firstLine = textContent.split('\n')[0].trim();
        titleToUse = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');

        if (!titleToUse) {
          titleToUse = 'Untitled Note';
        }
      }

      const noteRequest: CreateNoteRequest = {
        title: titleToUse,
        content: newNote.content,
        public: isPublic,
      };

      const savedNote = await NoteService.createNote(noteRequest);
      if (!savedNote) {
        alert('Gagal membuat note');
        return;
      }
      setNotes([savedNote, ...notes]);
      setNewNote({ title: '', content: '', teamId: 'backend' });
      setSelectedTeams([]);
      setIsPublic(false);
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Gagal membuat note');
    }
    setLoading(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus note ini?')) return;

    setLoading(true);
    try {
      await NoteService.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Gagal menghapus note');
    }
    setLoading(false);
  };

  const handleShareNote = async (id: string) => {
    setLoading(true);
    try {
      const shareRequest: ShareRequest = {
        noteId: id,
        teamIds: selectedTeams,
      };
      // await NoteService.shareNote(shareRequest);
      loadNotes();
      setSelectedTeams([]);
      alert('Note berhasil dibagikan');
    } catch (error) {
      console.error('Error sharing note:', error);
      alert('Gagal membagikan note');
    }
    setLoading(false);
  };

  const toggleTeamShare = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((t) => t !== teamId) : [...prev, teamId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || teamId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Team Note</h1>
          <p className="text-gray-600">Kolaborasi dan berbagi catatan antar tim dengan mudah</p>
        </div>

        {/* Add Note Section */}
        {isAddingNote ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tambah Note Baru</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Masukkan judul note (kosongkan untuk auto-generate)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <RichTextEditor
                  content={newNote.content}
                  onChange={(html) => setNewNote({ ...newNote, content: html })}
                  placeholder="Tulis konten note di sini..."
                />
              </div>

              <div className="border-t pt-4">
                {/*<label className="flex items-center mb-3">*/}
                {/*  <input*/}
                {/*    type="checkbox"*/}
                {/*    checked={isPublic}*/}
                {/*    onChange={(e) => setIsPublic(e.target.checked)}*/}
                {/*    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"*/}
                {/*  />*/}
                {/*  <span className="ml-2 text-sm font-medium text-gray-700">*/}
                {/*    Buat Publik (Bisa diakses semua tim)*/}
                {/*  </span>*/}
                {/*</label>*/}

                {/*{!isPublic && (*/}
                {/*  <div>*/}
                {/*    <p className="text-sm font-medium text-gray-700 mb-2">Bagikan dengan Tim:</p>*/}
                {/*    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">*/}
                {/*      {teams*/}
                {/*        .filter((t) => t.id !== newNote.teamId)*/}
                {/*        .map((team) => (*/}
                {/*          <label key={team.id} className="flex items-center">*/}
                {/*            <input*/}
                {/*              type="checkbox"*/}
                {/*              checked={selectedTeams.includes(team.id)}*/}
                {/*              onChange={() => toggleTeamShare(team.id)}*/}
                {/*              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"*/}
                {/*            />*/}
                {/*            <span className="ml-2 text-sm text-gray-600">{team.name}</span>*/}
                {/*          </label>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddNote}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Note'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote({ title: '', content: '', teamId: 'backend' });
                    setSelectedTeams([]);
                    setIsPublic(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNote(true)}
            className="mb-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition shadow-lg"
          >
            <Plus size={20} /> Tambah Note Baru
          </button>
        )}

        {/* Notes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{note.title}</h3>
                    {/*<p className="text-indigo-100 text-sm">oleh {note.author}</p>*/}
                  </div>
                  {note.public && (
                    <span className="bg-yellow-300 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                      Publik
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4">
                <div
                  className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: note.content || '' }}
                />

                {/* Meta Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span className="font-medium">
                      Tim: <span className="text-indigo-600">{'note.teamName'}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(note.createdAt!!)}</div>
                </div>

                {/* Shared With */}
                {/*{note.sharedWithTeams.length > 0 && (*/}
                {/*    <div className="mb-4">*/}
                {/*        <p className="text-xs font-semibold text-gray-600 mb-2">Dibagikan dengan:</p>*/}
                {/*        <div className="flex flex-wrap gap-2">*/}
                {/*            {note.sharedWithTeams.map(teamId => (*/}
                {/*                <span key={teamId} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">*/}
                {/*                   {getTeamName(teamId)}*/}
                {/*                </span>*/}
                {/*            ))}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShareNote(note.id!!)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 rounded transition text-sm"
                  >
                    <Share2 size={16} /> Bagikan
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id!!)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded transition text-sm disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && !isAddingNote && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Belum ada note. Mulai dengan menambah note baru!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
