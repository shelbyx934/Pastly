import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatePastePage from "./pages/CreatePastePage";
import ViewPastePage from "./pages/ViewPastePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/paste",
    element: <CreatePastePage />,
  },
  {
    path: "/p/:slug",
    element: <ViewPastePage />,
  },
]);

export default router;
