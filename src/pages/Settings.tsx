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
  const [activeVerticals, setActiveVerticals] = useState<string[]>([
    "agence-web",
    "expert-comptable",
  ]);
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

  const verticalIcons: Record<string, typeof Globe> = {
    Globe,
    Calculator,
    Shield,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez vos verticales et préférences de notification
        </p>
      </div>

      <div className="space-y-6">
        {/* Profil */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <User className="h-5 w-5 text-gray-400" />
            Profil
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                defaultValue="Pierre"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                defaultValue="Durand"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                defaultValue="pierre.durand@agence-web.fr"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Entreprise
              </label>
              <input
                type="text"
                defaultValue="WebForce Digital"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        {/* Verticales */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Globe className="h-5 w-5 text-gray-400" />
            Verticales actives
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Sélectionnez les profils d'acheteurs B2B pour lesquels vous souhaitez
            recevoir des leads qualifiés.
          </p>
          <div className="space-y-3">
            {verticals.map((v) => {
              const Icon = verticalIcons[v.icon] || Globe;
              const isActive = activeVerticals.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVertical(v.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${v.color}15`,
                      color: v.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {v.label}
                    </p>
                    <p className="text-xs text-gray-500">{v.description}</p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {isActive && <Check className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Bell className="h-5 w-5 text-gray-400" />
            Notifications
          </h2>
          <div className="space-y-4">
            {[
              {
                key: "email" as const,
                label: "Notification email",
                desc: "Recevez un email chaque matin avec vos nouveaux leads",
              },
              {
                key: "dailyDigest" as const,
                label: "Digest quotidien",
                desc: "Résumé quotidien des leads à 8h",
              },
              {
                key: "webhook" as const,
                label: "Webhook",
                desc: "Envoi temps réel vers votre endpoint",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications[item.key] ? "bg-primary-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[item.key]
                        ? "left-[22px]"
                        : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Key className="h-5 w-5 text-gray-400" />
            API & Intégrations
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Clé API
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="nci_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                  readOnly
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
                />
                <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Copier
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Webhook className="h-4 w-4" />
                URL Webhook
              </label>
              <input
                type="url"
                placeholder="https://votre-api.com/webhook/newco"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Sauvegardé
              </>
            ) : (
              "Sauvegarder"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
