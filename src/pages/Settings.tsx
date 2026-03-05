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
        <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">Configuration</p>
        <h1 className="mt-1 font-display text-3xl text-heading">Paramètres</h1>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted">
            <User className="h-3.5 w-3.5" /> Profil
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-muted">Prénom</label>
              <input type="text" defaultValue="Pierre" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-muted">Nom</label>
              <input type="text" defaultValue="Durand" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-muted">Email</label>
              <input type="email" defaultValue="pierre.durand@agence-web.fr" className="w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-muted">Entreprise</label>
              <input type="text" defaultValue="WebForce Digital" className="w-full" />
            </div>
          </div>
        </div>

        {/* Verticals */}
        <div className="card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted">
            <Globe className="h-3.5 w-3.5" /> Verticales actives
          </h2>
          <p className="mb-5 text-[14px] text-sub">
            Profils d'acheteurs B2B pour lesquels vous recevez des leads.
          </p>
          <div className="space-y-2.5">
            {verticals.map((v) => {
              const Icon = verticalIcons[v.icon] || Globe;
              const isActive = activeVerticals.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVertical(v.id)}
                  className={`card-interactive flex w-full items-center gap-4 p-4 text-left ${
                    isActive ? "!border-accent/30 !bg-accent-soft" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" style={{ color: v.color }} />
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-heading">{v.label}</p>
                    <p className="text-[12px] text-muted">{v.description}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                      isActive ? "bg-accent text-white" : "border border-border"
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
        <div className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              { key: "email" as const, label: "Email", desc: "Un email chaque matin avec vos leads" },
              { key: "dailyDigest" as const, label: "Digest", desc: "Résumé quotidien à 8h" },
              { key: "webhook" as const, label: "Webhook", desc: "Push temps réel vers votre endpoint" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg bg-surface p-4">
                <div>
                  <p className="text-[14px] font-medium text-heading">{item.label}</p>
                  <p className="text-[12px] text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications[item.key] ? "bg-accent" : "bg-raised"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[item.key] ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API */}
        <div className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted">
            <Key className="h-3.5 w-3.5" /> API & Intégrations
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-muted">Clé API</label>
              <div className="flex gap-2">
                <input type="password" defaultValue="nci_live_xxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono !bg-surface !text-muted" />
                <button className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-heading transition-all hover:border-accent hover:text-accent">
                  Copier
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-muted">
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
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-[14px] font-semibold shadow-sm transition-all ${
              saved
                ? "bg-score-high text-white"
                : "bg-accent text-white hover:bg-accent-dim"
            }`}
          >
            {saved ? (
              <><Check className="h-4 w-4" />Sauvegardé</>
            ) : (
              "Sauvegarder"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
