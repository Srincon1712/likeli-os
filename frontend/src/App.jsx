import { useEffect, useState } from 'react';
import { ColdCalling } from './components/ColdCalling.jsx';
import { CommercialPipeline, CRM } from './components/CRM.jsx';
import { Dashboard, CEODashboard } from './components/Dashboard.jsx';
import { Finance } from './components/Finance.jsx';
import { KnowledgeBase } from './components/KnowledgeBase.jsx';
import { LeadDatabase } from './components/LeadDatabase.jsx';
import { Objectives } from './components/Objectives.jsx';
import { PersonalAnalytics } from './components/PersonalAnalytics.jsx';
import { Productivity } from './components/Productivity.jsx';
import { SalesAnalytics } from './components/SalesAnalytics.jsx';
import { Shell } from './components/Shell.jsx';
import { api } from './lib/api.js';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [objectives, setObjectives] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [productivityItems, setProductivityItems] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [personalMetrics, setPersonalMetrics] = useState([]);
  const [error, setError] = useState('');

  async function load(stageId = selectedStageId) {
    try {
      const stageData = await api.stages();
      const activeStageId = stageData.some((stage) => stage.id === stageId) ? stageId : stageData[0]?.id;
      const [
        healthData,
        objectiveData,
        leadData,
        analyticsData,
        scriptData,
        dealData,
        financeData,
        productivityData,
        knowledgeData,
        personalData
      ] = await Promise.all([
        api.health(),
        api.objectives(),
        api.leads(activeStageId),
        api.analytics(activeStageId),
        api.scripts(),
        api.deals(),
        api.finance(),
        api.productivity(),
        api.knowledge(),
        api.personal()
      ]);
      setHealth(healthData);
      setObjectives(objectiveData);
      setLeads(leadData);
      setStages(stageData);
      setSelectedStageId(activeStageId);
      setAnalytics(analyticsData);
      setScripts(scriptData);
      setDeals(dealData);
      setFinanceRecords(financeData);
      setProductivityItems(productivityData);
      setKnowledgeItems(knowledgeData);
      setPersonalMetrics(personalData);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const objectiveActions = {
    onCreate: async (payload) => {
      await api.createObjective(payload);
      await load();
    },
    onUpdate: async (id, payload) => {
      setObjectives((items) => items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
      await api.updateObjective(id, payload);
      await load();
    },
    onDelete: async (id) => {
      await api.deleteObjective(id);
      await load();
    }
  };

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

  async function createLead(payload) {
    await api.createLead({ ...payload, stage_id: selectedStageId });
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
        <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          Backend offline: {error}. Start the Node server on port 4040.
        </div>
      ) : null}

      {activeView === 'dashboard' ? <Dashboard analytics={analytics} leads={leads} productivityItems={productivityItems} /> : null}
      {activeView === 'ceo' ? <CEODashboard analytics={analytics} /> : null}
      {activeView === 'crm' ? <CRM leads={leads} onCreateLead={createLead} onUpdateLead={updateLead} /> : null}
      {activeView === 'sales-analytics' ? <SalesAnalytics analytics={analytics} /> : null}
      {activeView === 'pipeline' ? <CommercialPipeline leads={leads} deals={deals} analytics={analytics} onUpdateLead={updateLead} /> : null}
      {activeView === 'finance' ? <Finance records={financeRecords} analytics={analytics} onCreate={async (payload) => { await api.createFinance(payload); await load(selectedStageId); }} /> : null}
      {activeView === 'productivity' ? (
        <Productivity
          items={productivityItems}
          analytics={analytics}
          objectives={objectives}
          objectiveAnalytics={analytics?.objectives}
          onCreate={async (payload) => { await api.createProductivity(payload); await load(selectedStageId); }}
          onUpdate={async (id, payload) => { await api.updateProductivity(id, payload); await load(selectedStageId); }}
          objectiveActions={objectiveActions}
        />
      ) : null}
      {activeView === 'knowledge' ? (
        <KnowledgeBase
          items={knowledgeItems}
          scripts={scripts}
          onCreateKnowledge={async (payload) => { await api.createKnowledge(payload); await load(selectedStageId); }}
          onCreateScript={async (payload) => { await api.createScript(payload); await load(selectedStageId); }}
        />
      ) : null}
      {activeView === 'personal' ? <PersonalAnalytics records={personalMetrics} analytics={analytics} onCreate={async (payload) => { await api.createPersonal(payload); await load(selectedStageId); }} /> : null}
      {activeView === 'objectives' ? (
        <Objectives objectives={objectives} analytics={analytics?.objectives} onCreate={objectiveActions.onCreate} onUpdate={objectiveActions.onUpdate} onDelete={objectiveActions.onDelete} />
      ) : null}
      {activeView === 'calls' ? (
        <>
          <StageBar stages={stages} selectedStageId={selectedStageId} onSelect={selectStage} onCreate={createStage} />
          <ColdCalling key={selectedStageId} leads={leads} analytics={analytics?.calls} scripts={scripts} onImport={importLeads} onLogCall={logCall} onUpdateLead={updateLead} />
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
    <div className="glass mb-4 flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Etapa de leads</div>
        <div className="mt-2 flex items-center gap-2">
          <select className="field w-full sm:w-64" value={selectedStageId || ''} onChange={(event) => onSelect(Number(event.target.value))}>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.id === newestStageId ? `Leads frescos - ${stage.name}` : stage.name} ({stage.lead_count})
              </option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={onCreate} className="ui-button border border-signal/30 bg-signal/10 text-ice hover:bg-signal/15">
        + Nueva etapa
      </button>
    </div>
  );
}
