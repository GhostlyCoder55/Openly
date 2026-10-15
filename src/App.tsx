import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/AboutPage";
import { CategoryPage } from "./pages/CategoryPage";
import { FieldGuideEntryPage } from "./pages/FieldGuideEntryPage";
import { FieldGuidePage } from "./pages/FieldGuidePage";
import { FormatPage } from "./pages/FormatPage";
import { FormatsPage } from "./pages/FormatsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SoftwareDetailPage } from "./pages/SoftwareDetailPage";
import { SoftwarePage } from "./pages/SoftwarePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="formats" element={<FormatsPage />} />
          <Route path="formats/:extension" element={<FormatPage />} />
          <Route path="categories/:category" element={<CategoryPage />} />
          <Route path="software" element={<SoftwarePage />} />
          <Route path="software/:slug" element={<SoftwareDetailPage />} />
          <Route path="field-guide" element={<FieldGuidePage />} />
          <Route path="field-guide/:slug" element={<FieldGuideEntryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
