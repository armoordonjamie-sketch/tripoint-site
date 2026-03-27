import { Link } from 'react-router-dom';
import { CTAButton } from '@/components/CTAButton';
import { FileText, LayoutDashboard, LogOut, Users } from 'lucide-react';

type AdminNavProps = {
    onLogout: () => void | Promise<void>;
};

export function AdminNav({ onLogout }: AdminNavProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
            >
                <LayoutDashboard className="h-4 w-4" />
                Bookings
            </Link>
            <Link
                to="/admin/leads"
                className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
            >
                <Users className="h-4 w-4" />
                Leads
            </Link>
            <Link
                to="/admin/reports"
                className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface"
            >
                <FileText className="h-4 w-4" />
                Reports
            </Link>
            <CTAButton variant="outline" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Log out
            </CTAButton>
        </div>
    );
}
