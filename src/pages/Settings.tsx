import { useState } from "react";
import {
  User,
  Bell,
  Globe,
  Calculator,
  Shield,
  Key,
  Webhook,
  Check,
} from "lucide-react";
import { verticals } from "@/lib/mock-data";

export default function Settings() {
  const [activeVerticals, setActiveVerticals] = useState<string[]>(["agence-web", "expert-comptable"]);
  const [notifications, setNotifications] = useState({
    email: true,
    webhook: false,
    dailyDigest: true,
  });
  const [saved, setSaved] = useState(false);

  const toggleVertical = (id: string) => {
    setActiveVerticals((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const verticalIcons: Record<string, typeof Globe> = { Globe, Calculator, Shield };

  return (
    <div className="page-in mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-lime">03 / Config</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-heading">Paramètres</h1>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <div className="card rounded-none p-6">
          <h2 className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <User className="h-3.5 w-3.5" /> Profil
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">Prénom</label>
              <input type="text" defaultValue="Pierre" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">Nom</label>
              <input type="text" defaultValue="Durand" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">Email</label>
              <input type="email" defaultValue="pierre.durand@agence-web.fr" className="w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">Entreprise</label>
              <input type="text" defaultValue="WebForce Digital" className="w-full" />
            </div>
          </div>
        </div>

        {/* Verticals */}
        <div className="card rounded-none p-6">
          <h2 className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <Globe className="h-3.5 w-3.5" /> Verticales actives
          </h2>
          <p className="mb-5 text-[13px] text-sub">
            Profils d'acheteurs B2B pour lesquels vous recevez des leads.
          </p>
          <div className="space-y-2">
            {verticals.map((v) => {
              const Icon = verticalIcons[v.icon] || Globe;
              const isActive = activeVerticals.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVertical(v.id)}
                  className={`card-interactive flex w-full items-center gap-4 rounded-none p-4 text-left ${
                    isActive ? "!border-lime/30 !bg-lime-soft" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" style={{ color: v.color }} />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-heading">{v.label}</p>
                    <p className="text-[11px] text-muted">{v.description}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center transition-colors ${
                      isActive ? "bg-lime text-void" : "border border-border"
                    }`}
                  >
                    {isActive && <Check className="h-3 w-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="card rounded-none p-6">
          <h2 className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              { key: "email" as const, label: "Email", desc: "Un email chaque matin avec vos leads" },
              { key: "dailyDigest" as const, label: "Digest", desc: "Résumé quotidien à 8h" },
              { key: "webhook" as const, label: "Webhook", desc: "Push temps réel vers votre endpoint" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between bg-slab p-4">
                <div>
                  <p className="text-[13px] font-medium text-heading">{item.label}</p>
                  <p className="text-[11px] text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative h-6 w-11 transition-colors ${
                    notifications[item.key] ? "bg-lime" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 bg-void transition-transform ${
                      notifications[item.key] ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API */}
        <div className="card rounded-none p-6">
          <h2 className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <Key className="h-3.5 w-3.5" /> API & Intégrations
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">Clé API</label>
              <div className="flex gap-2">
                <input type="password" defaultValue="nci_live_xxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono !bg-surface !text-muted" />
                <button className="border border-border px-3 py-2 font-mono text-[11px] font-bold text-heading hover:border-lime hover:text-lime">
                  COPIER
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                <Webhook className="h-3 w-3" /> URL Webhook
              </label>
              <input type="url" placeholder="https://votre-api.com/webhook/newco" className="w-full" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 font-mono text-[12px] font-bold transition-all ${
              saved
                ? "bg-score-high text-void"
                : "bg-lime text-void hover:bg-lime-dim"
            }`}
          >
            {saved ? (
              <><Check className="h-4 w-4" />SAUVEGARDÉ</>
            ) : (
              "SAUVEGARDER"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
