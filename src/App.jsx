import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import ScrollToTop from "@/components/ScrollToTop";
import SimpleNotFound from "@/lib/SimpleNotFound";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import CustomBuilds from "@/pages/CustomBuilds";
import Home from "@/pages/Home";
import Privacy from "@/pages/Privacy";
import Products from "@/pages/Products";
import Terms from "@/pages/Terms";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteHeader />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/custom-builds" element={<CustomBuilds />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<SimpleNotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </BrowserRouter>
  );
}
