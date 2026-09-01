import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import AdminGate, { Dashboard, SettingsPage } from "./admin/Admin";
import { CategoriesAdmin, ClicksAdmin, ProductsAdmin, StoresAdmin } from "./admin/Manage";
import Header from "./components/Header";
import { Toaster } from "./components/ui";
import * as db from "./lib/db";
import { applyAnalytics } from "./lib/utils";
import { CategoriesPage, CategoryDetail } from "./pages/CategoryPages";
import Deals from "./pages/Deals";
import { BestPicks, SearchPage } from "./pages/Discovery";
import GoPage from "./pages/GoPage";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import {
  AboutPage,
  ContactPage,
  CookiesPage,
  DisclosurePage,
  FavoritesPage,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
} from "./pages/StaticPages";
import { StoreDetail, StoresPage } from "./pages/StoresPages";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function ProductRoute() {
  const { slug } = useParams();
  return <ProductPage slug={slug || ""} />;
}
function StoreRoute() {
  const { slug } = useParams();
  return <StoreDetail slug={slug || ""} />;
}
function CategoryRoute() {
  const { slug } = useParams();
  return <CategoryDetail slug={slug || ""} />;
}
function GoRoute() {
  const { slug } = useParams();
  return <GoPage slug={slug || ""} />;
}

export default function App() {
  useEffect(() => {
    applyAnalytics(db.getSettings());
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/store/:slug" element={<StoreRoute />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CategoryRoute />} />
          <Route path="/product/:slug" element={<ProductRoute />} />
          <Route path="/best" element={<BestPicks />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/go/:slug" element={<GoRoute />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/disclosure" element={<DisclosurePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<AdminGate />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="stores" element={<StoresAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="clicks" element={<ClicksAdmin />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
