import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RouteLoadingFallback } from '@/components/RouteLoadingFallback';

// Static import for LCP (landing page)
import { HomePage } from '@/pages/HomePage';

// Lazy-loaded pages (only Admin/Payment/Report)
const PaymentPage = lazy(() => import('@/pages/PaymentPage').then((m) => ({ default: m.PaymentPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminLeadsPage = lazy(() => import('@/pages/admin/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })));
const AdminReportEditorPage = lazy(() => import('@/pages/admin/AdminReportEditorPage').then((m) => ({ default: m.AdminReportEditorPage })));
const ReportViewerPage = lazy(() => import('@/pages/ReportViewerPage').then((m) => ({ default: m.ReportViewerPage })));

// Static imports for all public indexable pages to support React 18+ renderToString SSG
import { ServicesPage } from '@/pages/ServicesPage';
import { DiagnosticCalloutPage } from '@/pages/services/DiagnosticCalloutPage';
import { VorVanDiagnosticsPage } from '@/pages/services/VorVanDiagnosticsPage';
import { PrePurchaseHealthCheckPage } from '@/pages/services/PrePurchaseHealthCheckPage';
import { MercedesVanServicingPage } from '@/pages/services/MercedesVanServicingPage';
import { SprinterServicingPage } from '@/pages/services/SprinterServicingPage';
import { VitoServicingPage } from '@/pages/services/VitoServicingPage';
import { CitanServicingPage } from '@/pages/services/CitanServicingPage';
import { SprinterBrakesPage } from '@/pages/services/SprinterBrakesPage';
import { VitoBrakesPage } from '@/pages/services/VitoBrakesPage';
import { CitanBrakesPage } from '@/pages/services/CitanBrakesPage';
import { VanLoadDriveabilityTunePage } from '@/pages/services/VanLoadDriveabilityTunePage';
import { VanEconomyTunePage } from '@/pages/services/VanEconomyTunePage';
import { FleetVanTuningPage } from '@/pages/services/FleetVanTuningPage';
import { PricingPage } from '@/pages/PricingPage';
import { CoveragePage } from '@/pages/CoveragePage';
import { AreaPage } from '@/pages/areas-covered/AreaPage';
import { AboutPage } from '@/pages/AboutPage';
import { FaqPage } from '@/pages/FaqPage';
import { BookingPage } from '@/pages/BookingPage';
import { ContactPage } from '@/pages/ContactPage';
import { BlogIndexPage } from '@/pages/BlogIndexPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { DisclaimerPage } from '@/pages/legal/DisclaimerPage';
import { AccessibilityPage } from '@/pages/legal/AccessibilityPage';
import { OurWorkPage } from '@/pages/OurWorkPage';
import { ProcessPage } from '@/pages/ProcessPage';
import { SampleDiagnosticReportPage } from '@/pages/SampleDiagnosticReportPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
    return (
        <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
                <Route element={<Layout />}>
                    {/* Public pages */}
                    <Route index element={<HomePage />} />
                    <Route path="services" element={<ServicesPage />} />

                    {/* Diagnostics (3 surviving pages) */}
                    <Route path="services/diagnostic-callout" element={<DiagnosticCalloutPage />} />
                    <Route path="services/vor-van-diagnostics" element={<VorVanDiagnosticsPage />} />
                    <Route path="services/pre-purchase-digital-health-check" element={<PrePurchaseHealthCheckPage />} />

                    {/* Diagnostic redirects (merged pages → Standard Diagnosis) */}
                    <Route path="services/emissions-diagnostics" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/adblue-countdown" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/nox-scr-diagnostics" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/dpf-regeneration-decision" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/dpf-regeneration-and-diagnostics" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/adblue-scr-diagnostics" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/sprinter-limp-mode" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/mercedes-xentry-diagnostics-coding" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/intermittent-electrical-faults" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/mobile-fault-finding" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/ecu-coding-and-variant-coding" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/fleet-health-check" element={<Navigate to="/services/diagnostic-callout?from=merged" replace />} />
                    <Route path="services/vor-triage" element={<Navigate to="/services/vor-van-diagnostics" replace />} />
                    <Route path="services/pre-purchase-health-check" element={<Navigate to="/services/pre-purchase-digital-health-check" replace />} />

                    {/* Mercedes Van Servicing & Brakes */}
                    <Route path="services/mercedes-van-servicing" element={<MercedesVanServicingPage />} />
                    <Route path="services/sprinter-servicing" element={<SprinterServicingPage />} />
                    <Route path="services/vito-servicing" element={<VitoServicingPage />} />
                    <Route path="services/citan-servicing" element={<CitanServicingPage />} />
                    <Route path="services/sprinter-brakes" element={<SprinterBrakesPage />} />
                    <Route path="services/vito-brakes" element={<VitoBrakesPage />} />
                    <Route path="services/citan-brakes" element={<CitanBrakesPage />} />

                    {/* Commercial Van Tuning */}
                    <Route path="services/van-load-driveability-tune" element={<VanLoadDriveabilityTunePage />} />
                    <Route path="services/van-economy-tune" element={<VanEconomyTunePage />} />
                    <Route path="services/fleet-van-tuning" element={<FleetVanTuningPage />} />

                    <Route path="pricing" element={<PricingPage />} />
                    <Route path="areas-covered" element={<CoveragePage />} />

                    {/* Area page redirects — retired pages (8 slugs, 301-equivalent client-side) */}
                    <Route path="areas-covered/bromley" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/lewisham" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/dartford" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/eltham" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/sevenoaks" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/tunbridge-wells" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/gravesend" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="areas-covered/sidcup" element={<Navigate to="/areas-covered/bexley" replace />} />

                    {/* Surviving area pages + new Medway page */}
                    <Route path="areas-covered/:slug" element={<AreaPage />} />
                    <Route path="areas" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="coverage" element={<Navigate to="/areas-covered" replace />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="our-work" element={<OurWorkPage />} />
                    <Route path="process" element={<ProcessPage />} />
                    <Route path="sample-diagnostic-report" element={<SampleDiagnosticReportPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="pay/:token" element={<PaymentPage />} />
                    <Route path="pay/:token/success" element={<PaymentSuccessPage />} />
                    {/* Stripe Payment Link after_completion redirect (invoice links) */}
                    <Route path="payment-success" element={<PaymentSuccessPage />} />
                    <Route path="report/:shareToken" element={<ReportViewerPage />} />
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/login" element={<AdminLoginPage />} />
                    <Route path="admin/leads" element={<AdminLeadsPage />} />
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
        </Suspense>
    );
}

