import { useEffect, useState } from 'react';
import userService from '../services/userService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserAnalytics();
        setAnalyticsData(response.analytics);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Decrypting Signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-black text-white mb-2">Sync Failed</h2>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-zinc-950 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-luxury">Retry Connection</button>
        </div>
      </div>
    );
  }

  const { totals = {}, posts = [] } = analyticsData || {};

  // Prepare Chart Data
  const chartData = {
    labels: posts.slice(0, 7).map(p => p.title.length > 20 ? p.title.substring(0, 17) + '...' : p.title),
    datasets: [
      {
        label: 'Views',
        data: posts.slice(0, 7).map(p => p.views),
        backgroundColor: '#0f172a', // Slate 900
        borderRadius: 8,
      },
      {
        label: 'Likes',
        data: posts.slice(0, 7).map(p => p.likes),
        backgroundColor: '#f59e0b', // Amber 500
        borderRadius: 8,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { weight: '800', size: 10, family: 'Outfit' },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
        bodyFont: { family: 'Outfit', size: 12 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: true,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
        ticks: { color: '#64748b', font: { size: 10, weight: 'bold', family: 'Outfit' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10, weight: 'bold', family: 'Outfit' } }
      }
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-400 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
            Creator <span className="text-zinc-600">Signals</span>.
          </h1>
          <p className="text-zinc-500 font-medium max-w-lg">
            A comprehensive look at your reach, engagement, and content distribution across the platform.
          </p>
        </header>

        {/* Totals Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500 group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 group-hover:text-white transition-colors">Total Reach</p>
            <h3 className="text-4xl font-black text-white">{totals.views?.toLocaleString() || 0}</h3>
            <p className="text-[10px] text-zinc-700 mt-2 font-bold uppercase tracking-widest">Story Views</p>
          </div>
          <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500 group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 group-hover:text-brand-accent transition-colors">Engagement</p>
            <h3 className="text-4xl font-black text-white">{totals.likes?.toLocaleString() || 0}</h3>
            <p className="text-[10px] text-zinc-700 mt-2 font-bold uppercase tracking-widest">Total Likes</p>
          </div>
          <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500 group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 group-hover:text-white transition-colors">Circulation</p>
            <h3 className="text-4xl font-black text-white">{totals.shares?.toLocaleString() || 0}</h3>
            <p className="text-[10px] text-zinc-700 mt-2 font-bold uppercase tracking-widest">Post Shares</p>
          </div>
          <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/10 blur-3xl -mr-12 -mt-12"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 group-hover:text-brand-accent transition-colors">Discussions</p>
            <h3 className="text-4xl font-black text-white">{totals.comments?.toLocaleString() || 0}</h3>
            <p className="text-[10px] text-zinc-700 mt-2 font-bold uppercase tracking-widest relative z-10">Total Thoughts</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Latest Performance</h4>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full">Top 7 Stories</span>
            </div>
            {posts.length > 0 ? (
              <div className="h-[300px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">No signals detected yet</p>
              </div>
            )}
          </div>

          {/* Side Info / Breakdown */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl flex flex-col">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-10">Story Breakdown</h4>
            <div className="flex-1 space-y-8 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {posts.length === 0 ? (
                <p className="text-xs text-zinc-700 font-medium">Publish your first story to start tracking metrics.</p>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="group cursor-default border-l-2 border-zinc-800 pl-4 hover:border-brand-accent transition-colors">
                    <p className="text-white text-xs font-bold truncate mb-2 group-hover:text-brand-accent transition-colors">{post.title}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-zinc-600">V</span>
                        <span className="text-[10px] font-bold text-zinc-400">{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-zinc-600">L</span>
                        <span className="text-[10px] font-bold text-zinc-400">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-zinc-600">S</span>
                        <span className="text-[10px] font-bold text-zinc-400">{post.shares}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800/50">
                <p className="text-[10px] font-bold text-zinc-600 leading-relaxed italic">
                  "Signals are processed in real-time. Engagement metrics reflect platform activity over the last 24 hours."
                </p>
            </div>
          </div>

        </div>

        {/* Detailed History Table */}
        <section className="mt-16">
           <div className="mb-10">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Full Signal History</h4>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Story Title</th>
                    <th className="pb-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center">Reach</th>
                    <th className="pb-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center">Activity</th>
                    <th className="pb-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center italic">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {posts.map(post => (
                    <tr key={post._id} className="hover:bg-white/2 transition-colors group">
                      <td className="py-7 pr-4">
                        <p className="text-white text-sm font-black tracking-tight group-hover:text-brand-accent transition-colors">{post.title}</p>
                      </td>
                      <td className="py-7 text-center">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{post.views} V</span>
                      </td>
                      <td className="py-7 text-center">
                         <div className="flex items-center justify-center gap-3">
                            <span className="px-3 py-1 bg-zinc-950 border border-white/5 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">{post.likes} L</span>
                            <span className="px-3 py-1 bg-zinc-950 border border-white/5 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">{post.shares} S</span>
                         </div>
                      </td>
                      <td className="py-7 text-center">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.15em]">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Analytics;
