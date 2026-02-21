import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Section } from '@/components/Section';
import { CTAButton } from '@/components/CTAButton';
import { Loader2, AlertCircle } from 'lucide-react';

const API_BASE = '/api';

async function fetchApi(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return res;
}

export function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetchApi('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.detail || 'Invalid password');
                return;
            }
            navigate('/admin', { replace: true });
        } catch {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Seo title="Admin Login" noIndex />
            <Section>
                <div className="mx-auto max-w-sm rounded-2xl border border-border-default bg-surface-alt p-8">
                    <h1 className="text-xl font-bold text-text-primary">Admin Login</h1>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-border-default bg-surface px-4 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-danger">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <CTAButton type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in…
                                </>
                            ) : (
                                'Log in'
                            )}
                        </CTAButton>
                    </form>
                </div>
            </Section>
        </>
    );
}
