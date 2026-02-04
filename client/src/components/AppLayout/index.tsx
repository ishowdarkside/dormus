import { Outlet } from "react-router";
import { Navbar } from "@/components";
import { useWindowName } from "@/hooks";
import { WebsocketSubscriber } from "@/components/WebsocketSubscriber";

export const AppLayout = () => {
  useWindowName();

  return (
    <>
      <WebsocketSubscriber />
      <div className="grid grid-cols-[100px_1fr] h-full">
        <Navbar />

        <div className="p-22 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};
