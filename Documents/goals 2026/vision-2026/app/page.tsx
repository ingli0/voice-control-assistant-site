"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { 
  Plus, CheckCircle2, X, Trash2, Minus, 
  ChevronRight, Zap, Target, BarChart3, TrendingUp,
  LogOut, Mail, Lock, Edit3
} from 'lucide-react';

export default function GoalApp() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Goal States
  const [newGoal, setNewGoal] = useState({ title: '', category_id: '', target_value: 12 });
  const [editingGoal, setEditingGoal] = useState(null);

  const themeMap = {
    blue: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/30", bar: "bg-blue-500" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/30", bar: "bg-emerald-500" },
    amber: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/30", bar: "bg-amber-500" },
    purple: { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/30", bar: "bg-purple-500" }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchData();
      else setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) {
        setCategories(catData);
        if (!newGoal.category_id) setNewGoal(prev => ({ ...prev, category_id: catData[0].id }));
      }

      const { data: goalData, error } = await supabase
        .from('goals')
        .select('*, cat:categories!goals_category_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (!error) setGoals(goalData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = authMode === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setGoals([]);
  };

  const addGoal = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        title: newGoal.title,
        category_id: parseInt(newGoal.category_id),
        target_value: newGoal.target_value,
        type: 'numeric',
        current_value: 0,
        user_id: user.id 
      }])
      .select('*, cat:categories!goals_category_id_fkey(*)');

    if (error) alert("Error: " + error.message);
    else {
      setGoals([data[0], ...goals]);
      setIsModalOpen(false);
      setNewGoal({ ...newGoal, title: '' });
    }
  };

  // --- EDIT ACTIONS ---
  const openEditModal = (goal) => {
    setEditingGoal({
      id: goal.id,
      title: goal.title,
      category_id: goal.category_id,
      target_value: goal.target_value
    });
    setIsEditModalOpen(true);
  };

  const updateGoalDetails = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('goals')
      .update({
        title: editingGoal.title,
        category_id: parseInt(editingGoal.category_id),
        target_value: editingGoal.target_value
      })
      .eq('id', editingGoal.id);

    if (error) alert(error.message);
    else {
      setIsEditModalOpen(false);
      fetchData();
    }
  };

  const updateProgress = async (goal, change) => {
    const newVal = Math.max(0, (goal.current_value || 0) + change);
    const { error } = await supabase
      .from('goals')
      .update({ current_value: newVal, is_completed: newVal >= goal.target_value })
      .eq('id', goal.id);
    if (!error) fetchData();
  };

  const deleteGoal = async (id) => {
    if (!confirm("Remove this objective?")) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) setGoals(goals.filter(g => g.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-16 h-16 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      <p className="font-mono text-xs tracking-[0.5em] text-blue-500 uppercase">Synchronizing</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase">Vision 2026</h1>
            <p className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">{authMode === 'signup' ? 'Create Access' : 'Secure Authorization'}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Passcode" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-500" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all shadow-xl">
              {authMode === 'signup' ? 'Initialize' : 'Enter'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="w-full text-center mt-8 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
            {authMode === 'signin' ? "Request Access" : "Back to Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30 pb-20">
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-[1px] w-8 bg-blue-500"></span>
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-blue-500">TERMINAL: {user.email}</span>
            </div>
            <h1 className="text-7xl font-black text-white tracking-tighter italic leading-none">STRATEGY.</h1>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setIsModalOpen(true)} className="group bg-white text-black px-10 py-5 rounded-[2rem] font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
              <Plus size={22} className="group-hover:rotate-90 transition-transform" />
              <span className="font-black uppercase tracking-tight">Add Goal</span>
            </button>
            <button onClick={handleSignOut} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] text-gray-500 hover:text-red-500 transition-all">
              <LogOut size={24} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          <div className="md:col-span-2 bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between">
            <TrendingUp className="text-blue-500 mb-4" size={24} />
            <div>
              <p className="text-4xl font-black text-white italic">
                {Math.round((goals.filter(g => g.is_completed).length / (goals.length || 1)) * 100)}%
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Completion</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between">
            <Target className="text-emerald-500 mb-4" size={24} />
            <h2 className="text-4xl font-black text-white">{goals.filter(g => g.is_completed).length}</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Achieved</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between">
            <BarChart3 className="text-purple-500 mb-4" size={24} />
            <h2 className="text-4xl font-black text-white">{goals.length}</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</p>
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal) => {
            const category = goal.cat;
            const theme = themeMap[category?.color_theme] || themeMap.blue;
            const progress = Math.min(100, Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100));
            const isDone = goal.is_completed || progress >= 100;

            return (
              <div key={goal.id} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-9 transition-all duration-700 hover:border-white/20">
                <div className="flex justify-between items-center mb-10">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] border uppercase ${theme.text} ${theme.bg} ${theme.border}`}>
                    {category?.name || 'SECTOR'}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => openEditModal(goal)} className="p-2 text-gray-500 hover:text-blue-500">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-gray-700 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className={`text-2xl font-bold leading-tight mb-10 ${isDone ? 'text-gray-600 line-through' : 'text-white'}`}>
                  {goal.title}
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-end">
                    <p className="font-mono text-sm text-gray-400">{goal.current_value} / {goal.target_value}</p>
                    <p className={`text-2xl font-black italic ${isDone ? 'text-emerald-500' : 'text-white'}`}>{progress}%</p>
                  </div>
                  <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden p-[2px] border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-500' : theme.bar}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => updateProgress(goal, -1)} className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 transition-all border border-white/5">
                    <Minus size={20} />
                  </button>
                  <button onClick={() => updateProgress(goal, 1)} className={`flex-1 rounded-[1.5rem] font-black text-xs tracking-[0.1em] transition-all ${isDone ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white text-black hover:scale-[1.02] active:scale-95'}`}>
                    {isDone ? 'COMPLETE' : 'INCREASE'}
                  </button>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-xl rounded-[4rem] p-16 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 text-gray-500 hover:text-white"><X size={32} /></button>
            <h2 className="text-5xl font-black text-white italic text-center mb-12 uppercase">New Core</h2>
            <form onSubmit={addGoal} className="space-y-8">
              <input required className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none focus:border-blue-500" placeholder="Objective Title" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-8">
                <select className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none" value={newGoal.category_id} onChange={e => setNewGoal({...newGoal, category_id: e.target.value})}>
                  {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-black">{cat.name}</option>)}
                </select>
                <input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none font-mono font-bold" value={newGoal.target_value} onChange={e => setNewGoal({...newGoal, target_value: parseInt(e.target.value) || 0})} />
              </div>
              <button type="submit" className="w-full bg-white py-8 rounded-[2.5rem] font-black text-black text-xl hover:bg-blue-600 hover:text-white transition-all">INITIALIZE</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingGoal && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-xl rounded-[4rem] p-16 relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-12 right-12 text-gray-500 hover:text-white"><X size={32} /></button>
            <h2 className="text-5xl font-black text-white italic text-center mb-12 uppercase tracking-tighter">Modify Core</h2>
            <form onSubmit={updateGoalDetails} className="space-y-8">
              <input required className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none focus:border-blue-500" value={editingGoal.title} onChange={e => setEditingGoal({...editingGoal, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-8">
                <select className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none" value={editingGoal.category_id} onChange={e => setEditingGoal({...editingGoal, category_id: e.target.value})}>
                  {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-black">{cat.name}</option>)}
                </select>
                <input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-7 text-white outline-none font-mono font-bold" value={editingGoal.target_value} onChange={e => setEditingGoal({...editingGoal, target_value: parseInt(e.target.value) || 0})} />
              </div>
              <button type="submit" className="w-full bg-white py-8 rounded-[2.5rem] font-black text-black text-xl hover:bg-blue-500 hover:text-white transition-all uppercase">Update System</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}