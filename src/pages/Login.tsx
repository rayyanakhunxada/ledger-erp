import { Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEMO_USERS, useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { initials } from '@/lib/utils';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const storeName = useSettingsStore((s) => s.settings.storeName);
  const navigate = useNavigate();

  const handleLogin = (id: string) => {
    login(id);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-md bg-amber flex items-center justify-center mb-4">
            <Tag className="h-6 w-6 text-navy-900" />
          </div>
          <h1 className="font-display font-semibold text-xl text-white">{storeName}</h1>
          <p className="text-white/50 text-xs mt-1">Sign in to Ledger ERP</p>
        </div>

        <div className="bg-white rounded-md shadow-pop border border-line p-5">
          <p className="text-xs font-medium text-slate mb-3">Choose a workspace user</p>
          <div className="space-y-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border border-line hover:border-navy-900/30 hover:bg-paper transition-colors text-left"
              >
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {initials(u.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink truncate">{u.name}</span>
                  <span className="block text-[11px] text-slate capitalize">{u.role}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate mt-4 text-center">
            No password needed — this demo runs fully in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
