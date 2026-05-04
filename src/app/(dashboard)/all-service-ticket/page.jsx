"use client";
import { useState, useEffect } from 'react';
import { Trash2, Edit3, CheckCircle, Loader2, ChevronLeft, ChevronRight, Search, Leaf, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?type=${filters.type}&status=${filters.status}&page=${page}`);
      const result = await res.json();
      if (result.success) {
        setTickets(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      toast.error("Data fetch failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters, page]);

  const handleAction = async (id, col, method, newStatus = null) => {
    const loadingToast = toast.loading("Updating...");
    try {
      const res = await fetch('/api/tickets', {
        method: method,
        body: JSON.stringify({ id, collection: col, status: newStatus })
      });
      if (res.ok) {
        toast.success("Successful!", { id: loadingToast });
        fetchData();
      }
    } catch (err) {
      toast.error("Failed!", { id: loadingToast });
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6 text-slate-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-100 text-white">
            <Leaf size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Service Tickets</h1>
            <p className="text-slate-500 font-medium text-sm">Real-time management for AgroVet</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by owner..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['all', 'livestock', 'agro', 'pet-care'].map((t) => (
            <button 
              key={t}
              onClick={() => {setFilters({...filters, type: t}); setPage(1);}}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filters.type === t ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['all', 'pending', 'completed'].map((s) => (
            <button 
              key={s}
              onClick={() => {setFilters({...filters, status: s}); setPage(1);}}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filters.status === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr>
                {["#SL", "Owner Information", "Service Type", "Appointment", "Status", "Action"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={40} /></td></tr>
              ) : tickets.map((ticket, index) => (
                <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-300">{(page - 1) * 15 + index + 1}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{ticket.ownerName}</span>
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1"><Phone size={10}/> {ticket.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black uppercase w-fit border border-indigo-100">
                        {ticket.categoryType?.split('-')[0]}
                      </span>
                      <span className="text-xs text-slate-400 font-bold tracking-tight">{ticket.species || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={14} className="text-green-600"/> {ticket.displayDate}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 w-fit border ${
                      ticket.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'completed' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAction(ticket._id, ticket.categoryType, 'PATCH', 'completed')}
                        disabled={ticket.status === 'completed'}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm disabled:opacity-30"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(ticket._id, ticket.categoryType, 'DELETE')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page <span className="text-slate-900 font-black">{page}</span> of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-green-600 hover:text-white disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i+1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${page === i + 1 ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))}
            </div>

            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-green-600 hover:text-white disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}