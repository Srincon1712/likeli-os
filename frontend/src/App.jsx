import { useEffect, useState } from 'react';
import { ColdCalling } from './components/ColdCalling.jsx';
import { LeadDatabase } from './components/LeadDatabase.jsx';
import { Objectives } from './components/Objectives.jsx';
import { Overview } from './components/Overview.jsx';
import { Shell } from './components/Shell.jsx';
import { api } from './lib/api.js';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [objectives, setObjectives] = useState([]);
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [healthData, objectiveData, leadData, analyticsData] = await Promise.all([
        api.health(),
        api.objectives(),
        api.leads(),
        api.analytics()
      ]);
      setHealth(healthData);
      setObjectives(objectiveData);
      setLeads(leadData);
      setAnalytics(analyticsData);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createObjective(payload) {
    await api.createObjective(payload);
    await load();
  }

  async function updateObjective(id, payload) {
    setObjectives((items) => items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
    await api.updateObjective(id, payload);
    await load();
  }

  async function deleteObjective(id) {
    await api.deleteObjective(id);
    await load();
  }

  async function importLeads(file) {
    await api.importLeads(file);
    await load();
  }

  async function logCall(id, payload) {
    await api.logCall(id, payload);
    await load();
  }

  async function updateLead(id, payload) {
    setLeads((items) => items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
    await api.updateLead(id, payload);
    await load();
  }

  async function deleteLead(id) {
    await api.deleteLead(id);
    await load();
  }

  async function deleteAllLeads() {
    await api.deleteAllLeads();
    await load();
  }

  return (
    <Shell activeView={activeView} onViewChange={setActiveView} health={health}>
      {error ? (
        <div className="mb-5 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          Backend offline: {error}. Start the Node server on port 4040.
        </div>
      ) : null}

      {activeView === 'overview' ? <Overview analytics={analytics} /> : null}
      {activeView === 'objectives' ? (
        <Objectives
          objectives={objectives}
          analytics={analytics?.objectives}
          onCreate={createObjective}
          onUpdate={updateObjective}
          onDelete={deleteObjective}
        />
      ) : null}
      {activeView === 'calls' ? (
        <ColdCalling
          leads={leads}
          analytics={analytics?.calls}
          onImport={importLeads}
          onLogCall={logCall}
          onUpdateLead={updateLead}
        />
      ) : null}
      {activeView === 'lead-database' ? (
        <LeadDatabase leads={leads} onDeleteLead={deleteLead} onDeleteAllLeads={deleteAllLeads} />
      ) : null}
    </Shell>
  );
}
