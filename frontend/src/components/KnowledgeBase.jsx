import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header, StatCard } from './Shell.jsx';

const initial = { type: 'playbook', title: '', content: '', tags: '' };

export function KnowledgeBase({ items, scripts, onCreateKnowledge, onCreateScript }) {
  const [form, setForm] = useState(initial);
  const allItems = useMemo(() => [
    ...items,
    ...scripts.map((script) => ({ ...script, type: `script:${script.category}` }))
  ], [items, scripts]);

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (form.type === 'script') {
      await onCreateScript({ category: 'script', title: form.title, content: form.content, tags: form.tags });
    } else {
      await onCreateKnowledge(form);
    }
    setForm(initial);
  }

  return (
    <section>
      <Header eyebrow="Likeli / Knowledge" title="Knowledge Base" description="Playbooks, procesos, SOPs, scripts, prompts, aprendizajes, experimentos y documentacion." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Playbooks" value={items.filter((item) => item.type === 'playbook').length} detail="guias internas" />
        <StatCard label="SOPs" value={items.filter((item) => item.type === 'sop').length} detail="procesos repetibles" />
        <StatCard label="Scripts" value={scripts.length} detail="cold calling" />
        <StatCard label="Prompts" value={items.filter((item) => item.type === 'prompt').length} detail="sistemas AI" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><Plus size={18} className="text-signal" /><h3 className="font-medium">Nuevo recurso</h3></div>
          <div className="space-y-2.5">
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="playbook">Playbook</option>
              <option value="process">Proceso</option>
              <option value="sop">SOP</option>
              <option value="script">Script</option>
              <option value="prompt">Prompt</option>
              <option value="learning">Aprendizaje</option>
              <option value="experiment">Experimento</option>
              <option value="documentation">Documentacion</option>
            </select>
            <input className="field" placeholder="Titulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="field" placeholder="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <textarea className="field min-h-36 resize-none" placeholder="Contenido" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <button className="ui-button w-full border border-signal/30 bg-signal/[0.12] font-medium text-ice">Guardar</button>
          </div>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {allItems.map((item) => (
            <article key={`${item.type}-${item.id}`} className="glass rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{item.type}</div>
              <h3 className="mt-1.5 truncate font-medium text-white">{item.title}</h3>
              <p className="mt-2 line-clamp-5 whitespace-pre-line text-[13px] leading-5 text-slate-400">{item.content || 'Sin contenido.'}</p>
              {item.tags ? <div className="mt-3 truncate text-xs text-ice">{item.tags}</div> : null}
            </article>
          ))}
          {!allItems.length ? <div className="glass rounded-lg p-6 text-center text-sm text-slate-400">No hay recursos todavia.</div> : null}
        </div>
      </div>
    </section>
  );
}
