import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

// Static import for LCP (landing page)
import { HomePage } from '@/pages/HomePage';

// Lazy-loaded pages
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const DiagnosticCalloutPage = lazy(() => import('@/pages/services/DiagnosticCalloutPage').then((m) => ({ default: m.DiagnosticCalloutPage })));
const VorVanDiagnosticsPage = lazy(() => import('@/pages/services/VorVanDiagnosticsPage').then((m) => ({ default: m.VorVanDiagnosticsPage })));
const PrePurchaseHealthCheckPage = lazy(() => import('@/pages/services/PrePurchaseHealthCheckPage').then((m) => ({ default: m.PrePurchaseHealthCheckPage })));
// Mercedes Van Servicing & Brakes
const MercedesVanServicingPage = lazy(() => import('@/pages/services/MercedesVanServicingPage').then((m) => ({ default: m.MercedesVanServicingPage })));
const SprinterServicingPage = lazy(() => import('@/pages/services/SprinterServicingPage').then((m) => ({ default: m.SprinterServicingPage })));
const VitoServicingPage = lazy(() => import('@/pages/services/VitoServicingPage').then((m) => ({ default: m.VitoServicingPage })));
const CitanServicingPage = lazy(() => import('@/pages/services/CitanServicingPage').then((m) => ({ default: m.CitanServicingPage })));
const SprinterBrakesPage = lazy(() => import('@/pages/services/SprinterBrakesPage').then((m) => ({ default: m.SprinterBrakesPage })));
const VitoBrakesPage = lazy(() => import('@/pages/services/VitoBrakesPage').then((m) => ({ default: m.VitoBrakesPage })));
const CitanBrakesPage = lazy(() => import('@/pages/services/CitanBrakesPage').then((m) => ({ default: m.CitanBrakesPage })));
// Commercial Van Tuning
const VanLoadDriveabilityTunePage = lazy(() => import('@/pages/services/VanLoadDriveabilityTunePage').then((m) => ({ default: m.VanLoadDriveabilityTunePage })));
const VanEconomyTunePage = lazy(() => import('@/pages/services/VanEconomyTunePage').then((m) => ({ default: m.VanEconomyTunePage })));
const FleetVanTuningPage = lazy(() => import('@/pages/services/FleetVanTuningPage').then((m) => ({ default: m.FleetVanTuningPage })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const CoveragePage = lazy(() => import('@/pages/CoveragePage').then((m) => ({ default: m.CoveragePage })));
const AreaPage = lazy(() => import('@/pages/areas-covered/AreaPage').then((m) => ({ default: m.AreaPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const BookingPage = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })));
const PaymentPage = lazy(() => import('@/pages/PaymentPage').then((m) => ({ default: m.PaymentPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminLeadsPage = lazy(() => import('@/pages/admin/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })));
const AdminReportEditorPage = lazy(() => import('@/pages/admin/AdminReportEditorPage').then((m) => ({ default: m.AdminReportEditorPage })));
const ReportViewerPage = lazy(() => import('@/pages/ReportViewerPage').then((m) => ({ default: m.ReportViewerPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() => import('@/pages/legal/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })));
const AccessibilityPage = lazy(() => import('@/pages/legal/AccessibilityPage').then((m) => ({ default: m.AccessibilityPage })));
const OurWorkPage = lazy(() => import('@/pages/OurWorkPage').then((m) => ({ default: m.OurWorkPage })));
const ProcessPage = lazy(() => import('@/pages/ProcessPage').then((m) => ({ default: m.ProcessPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export function AppRoutes() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
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

