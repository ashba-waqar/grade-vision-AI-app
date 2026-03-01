import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UploadCloud, FileText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Individual');
  const [batchGraphData, setBatchGraphData] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  const [predictionResult, setPredictionResult] = useState(null);
  const [batchFile, setBatchFile] = useState(null);
  const [inputs, setInputs] = useState({
    attendance: '', assignments: '', quizzes: '', midterm: '', studyHours: ''
  });

  const userData = location.state || { name: 'Guest User', email: 'guest@example.com' };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- INDIVIDUAL PREDICTION ---
  const handlePredict = async (e) => {
    e.preventDefault();
    setPredictionResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: parseFloat(inputs.attendance),
          assignments: parseFloat(inputs.assignments),
          quizzes: parseFloat(inputs.quizzes),
          midterms: parseFloat(inputs.midterm),
          study_hours: parseFloat(inputs.studyHours)
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setPredictionResult(data.prediction);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Backend connection failed. Please ensure the Python server is running.");
    }
  };

  // --- BATCH PROCESSING ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setBatchFile(file);
  };

  const handleBatchProcess = async () => {
    if (!batchFile) {
      alert("Please upload a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', batchFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict_batch', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        // 1. Download Predicted CSV
        const blob = new Blob([data.csv_data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Batch_Predictions.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // 2. Process Data for the Graph
        let excellent = 0, good = 0, average = 0, poor = 0;
        data.predictions.forEach(grade => {
          if (grade >= 80) excellent++;
          else if (grade >= 60) good++;
          else if (grade >= 50) average++;
          else poor++;
        });

        setBatchGraphData([
          { name: 'Excellent (>80)', count: excellent, fill: '#10b981' },
          { name: 'Good (60-80)', count: good, fill: '#3b82f6' },
          { name: 'Average (50-60)', count: average, fill: '#f59e0b' },
          { name: 'Poor (<50)', count: poor, fill: '#ef4444' }
        ]);

        alert("Batch Processing Complete! Your file has been downloaded.");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Connection to backend failed.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">🎓 Grade Vision</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{userData.name}</p>
              <p className="text-xs text-blue-100">{userData.email}</p>
            </div>
            <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-lg hover:bg-red-500 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="p-10">
          {/* Tabs */}
          <div className="flex gap-4 mb-10">
            <button 
              onClick={() => { setActiveTab('Individual'); setBatchGraphData(null); }}
              className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'Individual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Individual Analysis
            </button>
            <button 
              onClick={() => { setActiveTab('Batch'); setPredictionResult(null); }}
              className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'Batch' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Batch Analysis
            </button>
          </div>

          {activeTab === 'Individual' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Form */}
              <form onSubmit={handlePredict} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Enter Metrics</h2>
                {Object.keys(inputs).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-600 capitalize mb-1">{key}</label>
                    <input 
                      type="number" required 
                      value={inputs[key]} 
                      onChange={(e) => setInputs({...inputs, [key]: e.target.value})}
                      className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Predict Grade</button>
              </form>

              {/* Individual Graph Result */}
              {predictionResult && (
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
                    <p className="text-green-800 font-bold">Predicted Final Score</p>
                    <h3 className="text-5xl font-black text-green-600">{predictionResult}%</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Attnd.', val: inputs.attendance },
                        { name: 'Assig.', val: inputs.assignments },
                        { name: 'Quiz', val: inputs.quizzes },
                        { name: 'Mid', val: inputs.midterm },
                        { name: 'Final', val: predictionResult }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="val" fill="#c43bf6ff" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Batch Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center bg-slate-50">
                {batchFile ? (
                  <div className="flex flex-col items-center">
                    <FileText size={48} className="text-green-500 mb-2" />
                    <p className="font-bold">{batchFile.name}</p>
                    <button onClick={() => setBatchFile(null)} className="text-red-500 text-sm mt-2">Remove File</button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={48} className="text-blue-400 mx-auto mb-2" />
                    <p className="text-slate-600 mb-4">Upload student data CSV to analyze the whole class</p>
                    <label className="px-6 py-2 bg-white border border-blue-600 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-50">
                      Browse File
                      <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                    </label>
                  </div>
                )}
              </div>

              <button onClick={handleBatchProcess} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
                Process Batch & Show Distribution
              </button>

              {/* Batch Graph */}
              {batchGraphData && (
                <div className="p-8 border rounded-3xl bg-white shadow-sm">
                  <h3 className="text-center font-bold text-slate-800 mb-6">Class Performance Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={batchGraphData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;