import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { APP_PATHS, PATHS } from "@/router/paths.ts";
import { Auth, FamilyManager, Financials, Kanban, Me, Notes, NotFound } from "@/modules";
import { Flip, ToastContainer } from "react-toastify";
import { StructureLayout } from "@/components";
import { AppLayout } from "@/components/AppLayout";
import { MagicToken, Waitlist } from "@/modules/Auth/components";
import { ProtectRoute } from "@/components/ProtectRoute";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<StructureLayout />}>
            <Route
              path={PATHS.Auth}
              element={
                <ProtectRoute protect="Auth">
                  <Auth />
                </ProtectRoute>
              }
            />
            <Route path={PATHS.MagicToken} element={<MagicToken />} />
            <Route
              path={PATHS.Waitlist}
              element={
                <ProtectRoute protect="Waitlist">
                  <Waitlist />
                </ProtectRoute>
              }
            />
            <Route
              path={PATHS.App}
              element={
                <ProtectRoute protect="App">
                  <AppLayout />
                </ProtectRoute>
              }
            >
              <Route index element={<Navigate to={APP_PATHS.Financials} />} />
              <Route path={APP_PATHS.Family} element={<FamilyManager />} />
              <Route path={APP_PATHS.Kanban} element={<Kanban />} />
              <Route path={APP_PATHS.Notes} element={<Notes />} />
              <Route path={APP_PATHS.Financials} element={<Financials />} />
              <Route path={APP_PATHS.Shopping} element={<Kanban />} />
              <Route path={APP_PATHS.Calendar} element={<Kanban />} />
              <Route path={APP_PATHS.Notifications} element={<Kanban />} />
              <Route path={APP_PATHS.Chat} element={<Kanban />} />
              <Route path={APP_PATHS.Me} element={<Me />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" draggable transition={Flip} pauseOnHover theme="colored" hideProgressBar />
      <ReactQueryDevtools initialIsOpen={false} position="right" />
    </QueryClientProvider>
  );
}

export default App;
