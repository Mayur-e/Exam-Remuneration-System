import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await api.get("/accountant/faculty");
      setFaculty(res.data);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading faculty list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Faculty Directory</h1>
          <p className="text-slate-500 font-medium">Monitor department faculty claims and profiles.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Faculty</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{faculty.length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <span className="material-symbols-outlined text-3xl">groups</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Claims</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {faculty.reduce((sum, f) => sum + parseInt(f.total_claims || 0), 0)}
            </h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
        </div>
      </div>

      {/* Global Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Bar */}
          <div className="md:col-span-11 relative group">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Search Records</label>
            <div className="absolute left-4 top-[38px] text-slate-400 group-focus-within:text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              placeholder="Name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Clear Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={clearFilters}
              disabled={!searchTerm}
              className="w-full md:w-12 h-[46px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">close</span>
              <span className="md:hidden ml-2 font-medium text-sm">Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[50%]">Faculty Member</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-[25%]">Total Claims</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-[25%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <span className="material-symbols-outlined text-3xl text-slate-400">group_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No faculty found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      We couldn't find any faculty members matching your current filters.
                    </p>
                    {searchTerm && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-primary font-bold text-sm hover:underline inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">clear_all</span>
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                          {(f.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm mb-0.5">{f.name || 'Unknown'}</p>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            {f.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-700 text-xs font-bold w-max mx-auto">
                        <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                        {f.total_claims || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <button
                        onClick={() => navigate(`/accountant/faculty/${f.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 text-xs font-bold rounded-lg transition-all shadow-sm group-hover:shadow whitespace-nowrap ml-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        {filteredFaculty.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              Showing {filteredFaculty.length} of {faculty.length} faculty entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}