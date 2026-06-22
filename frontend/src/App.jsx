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
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  async function load(stageId = selectedStageId) {
    try {
      const stageData = await api.stages();
      const activeStageId = stageData.some((stage) => stage.id === stageId) ? stageId : stageData[0]?.id;
      const [healthData, objectiveData, leadData, analyticsData] = await Promise.all([
        api.health(),
        api.objectives(),
        api.leads(activeStageId),
        api.analytics(activeStageId)
      ]);
      setHealth(healthData);
      setObjectives(objectiveData);
      setLeads(leadData);
      setStages(stageData);
      setSelectedStageId(activeStageId);
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
    await api.importLeads(file, selectedStageId);
    await load(selectedStageId);
  }

  async function logCall(id, payload) {
    await api.logCall(id, payload);
    await load(selectedStageId);
  }

  async function updateLead(id, payload) {
    setLeads((items) => items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
    await api.updateLead(id, payload);
    await load(selectedStageId);
  }

  async function deleteLead(id) {
    await api.deleteLead(id);
    await load(selectedStageId);
  }

  async function deleteAllLeads() {
    await api.deleteAllLeads(selectedStageId);
    await load(selectedStageId);
  }

  async function selectStage(stageId) {
    setSelectedStageId(stageId);
    await load(stageId);
  }

  async function createStage() {
    const defaultName = `Etapa ${stages.length + 1}`;
    const name = window.prompt('Nombre de la nueva etapa:', defaultName);
    if (name === null) return;
    const stage = await api.createStage({ name });
    await load(stage.id);
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
        <>
          <StageBar stages={stages} selectedStageId={selectedStageId} onSelect={selectStage} onCreate={createStage} />
          <ColdCalling
            key={selectedStageId}
            leads={leads}
            analytics={analytics?.calls}
            onImport={importLeads}
            onLogCall={logCall}
            onUpdateLead={updateLead}
          />
        </>
      ) : null}
      {activeView === 'lead-database' ? (
        <>
          <StageBar stages={stages} selectedStageId={selectedStageId} onSelect={selectStage} onCreate={createStage} />
          <LeadDatabase leads={leads} onDeleteLead={deleteLead} onDeleteAllLeads={deleteAllLeads} />
        </>
      ) : null}
    </Shell>
  );
}

function StageBar({ stages, selectedStageId, onSelect, onCreate }) {
  const newestStageId = stages[0]?.id;

  return (
    <div className="glass mb-5 flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Etapa de leads</div>
        <div className="mt-2 flex items-center gap-2">
          <select className="field min-w-56" value={selectedStageId || ''} onChange={(event) => onSelect(Number(event.target.value))}>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.id === newestStageId ? `Leads frescos - ${stage.name}` : stage.name} ({stage.lead_count})
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={onCreate}
        className="rounded-lg border border-signal/30 bg-signal/10 px-4 py-2.5 text-sm text-ice hover:bg-signal/15"
      >
        + Nueva etapa
      </button>
    </div>
  );
}
