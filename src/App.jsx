import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import SiteAnalytics from "@/components/SiteAnalytics";
import SiteMetadata from "@/components/SiteMetadata";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import ScrollToTop from "@/components/ScrollToTop";
import SimpleNotFound from "@/lib/SimpleNotFound";
import PipelineApp from "@/pipeline/PipelineApp";
import About from "@/pages/About";
import BusinessLaunch from "@/pages/BusinessLaunch";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import CustomBuilds from "@/pages/CustomBuilds";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import LeadGeneration from "@/pages/LeadGeneration";
import Login from "@/pages/Login";
import OAuthConsent from "@/pages/OAuthConsent";
import Privacy from "@/pages/Privacy";
import Products from "@/pages/Products";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Security from "@/pages/Security";
import Terms from "@/pages/Terms";

function AppRoutes() {
  const location = useLocation();
  const isPipeline = location.pathname.startsWith("/pipeline");

  if (isPipeline) {
    return (
      <>
        <ScrollToTop />
        <SiteMetadata />
        <SiteAnalytics />
        <Routes>
          <Route path="/pipeline/*" element={<PipelineApp />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <SiteMetadata />
      <SiteAnalytics />
      <SiteHeader />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/business-launch" element={<BusinessLaunch />} />
          <Route path="/custom-builds" element={<CustomBuilds />} />
          <Route path="/lead-generation" element={<LeadGeneration />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/security" element={<Security />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-consent" element={<OAuthConsent />} />
          <Route path="*" element={<SimpleNotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
