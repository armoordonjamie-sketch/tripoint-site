import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from '@/components/Layout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { DiagnosticCalloutPage } from '@/pages/services/DiagnosticCalloutPage';
import { VorTriagePage } from '@/pages/services/VorTriagePage';
import { EmissionsDiagnosticsPage } from '@/pages/services/EmissionsDiagnosticsPage';
import { PrePurchaseHealthCheckPage } from '@/pages/services/PrePurchaseHealthCheckPage';
import { PricingPage } from '@/pages/PricingPage';
import { CoveragePage } from '@/pages/CoveragePage';
import { AboutPage } from '@/pages/AboutPage';
import { FaqPage } from '@/pages/FaqPage';
import { BookingPage } from '@/pages/BookingPage';
import { ContactPage } from '@/pages/ContactPage';
import { BlogIndexPage } from '@/pages/BlogIndexPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { DisclaimerPage } from '@/pages/legal/DisclaimerPage';
import { OurWorkPage } from '@/pages/OurWorkPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public pages */}
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/diagnostic-callout" element={<DiagnosticCalloutPage />} />
            <Route path="services/vor-triage" element={<VorTriagePage />} />
            <Route path="services/emissions-diagnostics" element={<EmissionsDiagnosticsPage />} />
            <Route path="services/pre-purchase-health-check" element={<PrePurchaseHealthCheckPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="coverage" element={<CoveragePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="our-work" element={<OurWorkPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogIndexPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />

            {/* Legal */}
            <Route path="legal/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="legal/terms" element={<TermsPage />} />
            <Route path="legal/disclaimer" element={<DisclaimerPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
