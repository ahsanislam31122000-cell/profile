import React, { useState } from 'react';
import { ContactInquiry } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Inbox,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  X,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';

interface InquiriesManagerProps {
  inquiries: ContactInquiry[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const InquiriesManager: React.FC<InquiriesManagerProps> = ({
  inquiries,
  onRefresh,
  showToast,
}) => {
  const { authFetch } = useAuth();
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(null);

  // Toggle Read Status
  const handleToggleRead = async (inquiry: ContactInquiry) => {
    try {
      const res = await authFetch(`/api/admin/inquiries/${inquiry.id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to update inquiry status.');

      showToast(`Marked as ${inquiry.isRead ? 'Unread' : 'Read'}.`);
      onRefresh();
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, isRead: !prev.isRead } : null));
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating inquiry.', 'error');
    }
  };

  // Open Message Detail Modal & Automatically Mark as Read if unread
  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.isRead) {
      handleToggleRead(inquiry);
    }
  };

  // Delete Inquiry
  const handleDeleteConfirm = async () => {
    if (!inquiryToDelete) return;
    try {
      const res = await authFetch(`/api/admin/inquiries/${inquiryToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete inquiry.');

      showToast('Inquiry removed safely.');
      setInquiryToDelete(null);
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error deleting inquiry.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Privacy Reassurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Client Inquiries Inbox</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Private client messages submitted via the public portfolio contact form.
          </p>
        </div>

        {/* Security badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Strictly Private: Never exposed to public visitors</span>
        </div>
      </div>

      {/* Messages List */}
      {inquiries.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <Inbox className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-xs">No client inquiries received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                !inq.isRead
                  ? 'bg-zinc-900/95 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
              onClick={() => handleOpenDetail(inq)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {!inq.isRead ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block ring-4 ring-emerald-500/20" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{inq.name}</span>
                      <span className="text-xs text-zinc-400">({inq.email})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        {inq.service}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-zinc-200 mt-1">
                      {inq.subject || 'New Project Inquiry'}
                    </h4>

                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-2xl">
                      {inq.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRead(inq);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    title={inq.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${inq.isRead ? 'text-zinc-500' : 'text-emerald-400'}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInquiryToDelete(inq);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 text-xs"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MESSAGE DETAILS MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {selectedInquiry.service}
              </span>
              <h3 className="text-xl font-bold text-white mt-3">
                {selectedInquiry.subject || 'Project Inquiry'}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
                <span>From: <strong className="text-zinc-200">{selectedInquiry.name}</strong></span>
                <span>•</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-emerald-400 hover:underline">
                  {selectedInquiry.email}
                </a>
                <span>•</span>
                <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap mb-6 max-h-[300px] overflow-y-auto">
              {selectedInquiry.message}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRead(selectedInquiry)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  {selectedInquiry.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>

                <button
                  onClick={() => setInquiryToDelete(selectedInquiry)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>

              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                  selectedInquiry.subject || 'Your project inquiry'
                )}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                <Mail className="w-4 h-4" />
                <span>Reply via Email Client</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Inquiry</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Are you sure you want to delete this message from{' '}
              <strong className="text-white">{inquiryToDelete.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setInquiryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
