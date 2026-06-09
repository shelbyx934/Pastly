import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatePastePage from "./pages/CreatePastePage";
import ViewPastePage from "./pages/ViewPastePage";
import TransferPage from "./pages/TransferPage";
import TransferSendPage from "./pages/TransferSendPage";
import TransferReceivePage from "./pages/TransferReceivePage";
import TransferReceiveByUrlPage from "./pages/TransferReceiveByUrlPage";
import TransferErrorPage from "./pages/TransferErrorPage";

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
  {
    path: "/transfer",
    element: <TransferPage />,
  },
  {
    path: "/transfer/send",
    element: <TransferSendPage />,
  },
  {
    path: "/transfer/receive",
    element: <TransferReceivePage />,
  },
  {
    path: "/t/receive/:code",
    element: <TransferReceiveByUrlPage />,
  },
  {
    path: "/t/error",
    element: <TransferErrorPage />,
  },
]);

export default router;

