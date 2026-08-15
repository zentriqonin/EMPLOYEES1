import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Notices = () => {
  const { user, isAdmin, isHR } = useAuth();
  const isManager = isAdmin() || isHR();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');
      // Admin and HR fetch all notices (including inactive ones), Employees fetch active ones only.
      const endpoint = isManager ? '/notices/all' : '/notices';
      const res = await api.get(endpoint);
      setNotices(res.data);
    } catch (e) {
      setError('Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [user]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedNotice(null);
    setTitle('');
    setContent('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (notice) => {
    setModalMode('edit');
    setSelectedNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setIsActive(notice.isActive);
    setModalOpen(true);
  };

  const handleOpenViewModal = (notice) => {
    setModalMode('view');
    setSelectedNotice(notice);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNotice(null);
    setTitle('');
    setContent('');
    setIsActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const payload = {
        title,
        content,
        isActive
      };

      if (modalMode === 'create') {
        await api.post('/notices', payload);
        setSuccess('Announcement posted successfully!');
      } else if (modalMode === 'edit') {
        await api.put(`/notices/${selectedNotice.id}`, payload);
        setSuccess('Announcement updated successfully!');
      }

      handleCloseModal();
      fetchNotices();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.message || 'An error occurred while saving the notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      setError('');
      setSuccess('');
      await api.delete(`/notices/${id}`);
      setSuccess('Notice deleted successfully.');
      fetchNotices();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError('Failed to delete the notice.');
    }
  };

  const handleToggleActive = async (notice) => {
    try {
      setError('');
      setSuccess('');
      const updatedPayload = {
        ...notice,
        isActive: !notice.isActive
      };
      await api.put(`/notices/${notice.id}`, updatedPayload);
      setSuccess(`Notice ${notice.isActive ? 'deactivated' : 'activated'} successfully.`);
      fetchNotices();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError('Failed to toggle notice status.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Notice Board</h1>
          <p className="text-xs text-brand-muted font-medium">Important announcements, news, and policies updates</p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white font-bold text-xs rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Notice
          </button>
        )}
      </div>

      {/* Notifications/Alerts Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
            &times;
          </button>
        </div>
      )}

      {/* Main Grid View */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-brand-ivory rounded-xl border border-brand-warmgray p-6 flex flex-col justify-between transition-all duration-200 ${
                !notice.isActive ? 'opacity-70 bg-[#F2EDE1] border-dashed' : ''
              }`}
            >
              <div>
                {/* Header Information */}
                <div className="flex justify-between items-start gap-2 mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center font-medium text-xs uppercase">
                      {notice.createdByUsername?.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-brand-navy leading-tight">
                        {notice.createdByUsername}
                      </p>
                      <p className="text-[10px] text-brand-navy/80 font-bold tracking-wide uppercase leading-tight">
                        {notice.createdByRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] text-brand-muted font-medium">
                      {formatDate(notice.createdAt)}
                    </span>
                    {!notice.isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F0EEE6] text-[#8A8676] rounded-full border border-brand-warmgray">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-brand-navy text-sm mb-2 line-clamp-1">
                  {notice.title}
                </h3>
                <p className="text-xs text-brand-muted font-medium leading-relaxed mb-4 line-clamp-3">
                  {notice.content}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-brand-warmgray flex justify-between items-center gap-2">
                <button
                  onClick={() => handleOpenViewModal(notice)}
                  className="px-3 py-1.5 bg-brand-ivory hover:bg-[#F2EDE1] border border-brand-warmgray text-brand-navy font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Read More
                </button>

                {isManager && (
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Active Status */}
                    <button
                      onClick={() => handleToggleActive(notice)}
                      title={notice.isActive ? 'Deactivate Notice' : 'Activate Notice'}
                      className={`p-1.5 border border-brand-warmgray rounded-lg transition-all ${
                        notice.isActive
                          ? 'text-[#7A5E1F] hover:bg-[#F2EDE1]'
                          : 'text-[#3F7A4F] hover:bg-[#F2EDE1]'
                      }`}
                    >
                      {notice.isActive ? (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Edit Notice */}
                    <button
                      onClick={() => handleOpenEditModal(notice)}
                      title="Edit Notice"
                      className="p-1.5 text-brand-navy border border-brand-warmgray hover:bg-[#F2EDE1] rounded-lg transition-all"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* Delete Notice */}
                    <button
                      onClick={() => handleDelete(notice.id)}
                      title="Delete Notice"
                      className="p-1.5 text-[#B3543A] border border-brand-warmgray hover:bg-[#F5E3DD] rounded-lg transition-all"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-brand-ivory rounded-xl border border-brand-warmgray p-12 text-center text-brand-muted">
          <svg className="w-12 h-12 mx-auto text-brand-warmgray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="font-bold text-sm">No announcements posted yet.</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for updates from HR and Admin.</p>
        </div>
      )}

      {/* CREATE / EDIT / VIEW MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-brand-ivory w-full max-w-xl rounded-lg border border-brand-warmgray overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-warmgray flex justify-between items-center bg-[#F2EDE1]">
              <h2 className="text-base font-bold text-brand-navy tracking-tight">
                {modalMode === 'view'
                  ? 'Announcement Details'
                  : modalMode === 'edit'
                  ? 'Edit Notice'
                  : 'Post New Notice'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-navy transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            {modalMode === 'view' ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center font-bold text-sm uppercase">
                    {selectedNotice?.createdByUsername?.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-brand-navy leading-tight">
                      {selectedNotice?.createdByUsername}
                    </h4>
                    <p className="text-[10px] text-brand-navy/80 font-bold tracking-wide uppercase mt-0.5">
                      {selectedNotice?.createdByRole}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] text-brand-muted font-medium">
                    {formatDate(selectedNotice?.createdAt)}
                  </span>
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-brand-navy mb-2.5">
                    {selectedNotice?.title}
                  </h3>
                  <div className="text-[13px] text-brand-navy/80 font-normal leading-relaxed bg-[#F2EDE1] border border-brand-warmgray p-4.5 rounded-xl whitespace-pre-wrap">
                    {selectedNotice?.content}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  {/* Title Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                      Notice Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Scheduled System Maintenance"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={150}
                      className="px-4 py-2.5 bg-brand-ivory border border-brand-warmgray focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs rounded-xl outline-none transition-all text-brand-navy font-medium"
                    />
                  </div>

                  {/* Content Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                      Content / Announcement Details
                    </label>
                    <textarea
                      placeholder="Write your announcement details here..."
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      className="px-4 py-2.5 bg-brand-ivory border border-brand-warmgray focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-xs rounded-xl outline-none transition-all text-brand-navy font-medium resize-none leading-relaxed"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-brand-navy border-brand-warmgray rounded focus:ring-brand-navy"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-xs font-bold text-brand-navy cursor-pointer select-none"
                    >
                      Publish immediately (Active Announcement)
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-brand-warmgray flex justify-end gap-3 bg-[#F2EDE1]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4.5 py-2 border border-brand-warmgray text-brand-navy bg-brand-ivory hover:bg-[#F2EDE1] font-bold text-xs rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-brand-navy hover:bg-[#1F2E52] text-white font-bold text-xs rounded-xl transition-all duration-200"
                  >
                    {modalMode === 'edit' ? 'Save Changes' : 'Post Announcement'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
