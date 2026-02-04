import { Outlet } from "react-router";

export const StructureLayout = () => {
  return (
    <div className=" h-screen bg-[url('/bg.jpg')] py-20 flex items-center justify-center bg-center bg-cover">
      <div className="bg-[url('/pattern.jpg')] overflow-hidden h-full rounded-[10px] max-w-360 w-full bg-cover bg-center relative">
        <Outlet />
      </div>
    </div>
  );
};
