import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { DiagnosticCalloutPage } from '@/pages/services/DiagnosticCalloutPage';
import { VorVanDiagnosticsPage } from '@/pages/services/VorVanDiagnosticsPage';
import { EmissionsDiagnosticsPage } from '@/pages/services/EmissionsDiagnosticsPage';
import { PrePurchaseHealthCheckPage } from '@/pages/services/PrePurchaseHealthCheckPage';
import { SprinterLimpModePage } from '@/pages/services/SprinterLimpModePage';
import { AdblueCountdownPage } from '@/pages/services/AdblueCountdownPage';
import { NoxScrDiagnosticsPage } from '@/pages/services/NoxScrDiagnosticsPage';
import { DpfRegenerationDecisionPage } from '@/pages/services/DpfRegenerationDecisionPage';
import { MercedesXentryPage } from '@/pages/services/MercedesXentryPage';
import { IntermittentElectricalPage } from '@/pages/services/IntermittentElectricalPage';
import { FleetHealthCheckPage } from '@/pages/services/FleetHealthCheckPage';
import { MobileFaultFindingPage } from '@/pages/services/MobileFaultFindingPage';
import { DpfRegenerationDiagnosticsPage } from '@/pages/services/DpfRegenerationDiagnosticsPage';
import { AdblueScrDiagnosticsPage } from '@/pages/services/AdblueScrDiagnosticsPage';
import { EcuCodingPage } from '@/pages/services/EcuCodingPage';
import { PricingPage } from '@/pages/PricingPage';
import { CoveragePage } from '@/pages/CoveragePage';
import { AreaPage } from '@/pages/areas-covered/AreaPage';
import { AboutPage } from '@/pages/AboutPage';
import { FaqPage } from '@/pages/FaqPage';
import { BookingPage } from '@/pages/BookingPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminReportEditorPage } from '@/pages/admin/AdminReportEditorPage';
import { ReportViewerPage } from '@/pages/ReportViewerPage';
import { ContactPage } from '@/pages/ContactPage';
import { BlogIndexPage } from '@/pages/BlogIndexPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { DisclaimerPage } from '@/pages/legal/DisclaimerPage';
import { AccessibilityPage } from '@/pages/legal/AccessibilityPage';
import { OurWorkPage } from '@/pages/OurWorkPage';
import { ProcessPage } from '@/pages/ProcessPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
    return (
        <Routes>
          <Route element={<Layout />}>
            {/* Public pages */}
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/diagnostic-callout" element={<DiagnosticCalloutPage />} />
            <Route path="services/vor-van-diagnostics" element={<VorVanDiagnosticsPage />} />
            <Route path="services/vor-triage" element={<Navigate to="/services/vor-van-diagnostics" replace />} />
            <Route path="services/emissions-diagnostics" element={<EmissionsDiagnosticsPage />} />
            <Route path="services/pre-purchase-digital-health-check" element={<PrePurchaseHealthCheckPage />} />
            <Route path="services/pre-purchase-health-check" element={<Navigate to="/services/pre-purchase-digital-health-check" replace />} />
            <Route path="services/sprinter-limp-mode" element={<SprinterLimpModePage />} />
            <Route path="services/adblue-countdown" element={<AdblueCountdownPage />} />
            <Route path="services/nox-scr-diagnostics" element={<NoxScrDiagnosticsPage />} />
            <Route path="services/dpf-regeneration-decision" element={<DpfRegenerationDecisionPage />} />
            <Route path="services/mercedes-xentry-diagnostics-coding" element={<MercedesXentryPage />} />
            <Route path="services/mobile-fault-finding" element={<MobileFaultFindingPage />} />
            <Route path="services/dpf-regeneration-and-diagnostics" element={<DpfRegenerationDiagnosticsPage />} />
            <Route path="services/adblue-scr-diagnostics" element={<AdblueScrDiagnosticsPage />} />
            <Route path="services/ecu-coding-and-variant-coding" element={<EcuCodingPage />} />
            <Route path="services/intermittent-electrical-faults" element={<IntermittentElectricalPage />} />
            <Route path="services/fleet-health-check" element={<FleetHealthCheckPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="areas-covered" element={<CoveragePage />} />
            <Route path="areas-covered/:slug" element={<AreaPage />} />
            <Route path="areas" element={<Navigate to="/areas-covered" replace />} />
            <Route path="coverage" element={<Navigate to="/areas-covered" replace />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="our-work" element={<OurWorkPage />} />
            <Route path="process" element={<ProcessPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="pay/:token" element={<PaymentPage />} />
            <Route path="pay/:token/success" element={<PaymentSuccessPage />} />
            <Route path="report/:shareToken" element={<ReportViewerPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin/reports" element={<AdminReportsPage />} />
            <Route path="admin/reports/:reportId" element={<AdminReportEditorPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogIndexPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />

            {/* Legal */}
            <Route path="legal/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="legal/terms" element={<TermsPage />} />
            <Route path="legal/disclaimer" element={<DisclaimerPage />} />
            <Route path="legal/accessibility" element={<AccessibilityPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    </Routes>
    );
}

