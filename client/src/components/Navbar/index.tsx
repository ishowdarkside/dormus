import { CalendarBlank, ChatText, ListChecks, Money, NoteBlank, ShoppingCart, User, UsersThree } from "phosphor-react";
import { cn } from "@/lib/utils.ts";
import { PATHS } from "@/router/paths.ts";
import { NavLink } from "react-router";

const navigations = [
  {
    icon: UsersThree,
    page: PATHS.Family,
  },
  { icon: ListChecks, page: PATHS.Kanban },
  { icon: NoteBlank, page: PATHS.Notes },
  { icon: Money, page: PATHS.Financials },
  { icon: ShoppingCart, page: PATHS.Shopping },
  { icon: CalendarBlank, page: PATHS.Calendar },
];

const options = [
  {
    icon: ChatText,
    page: PATHS.Chat,
  },
  {
    icon: User,
    page: PATHS.Me,
  },
];

const iconBaseStyle = "text-[24px] text-tres cursor-pointer hover:text-dos transition-all";
export const Navbar = () => {
  return (
    <nav className="flex flex-col justify-between bg-linear-to-tr from-cinco py-10 to-[#75B3AA]">
      <span className="font-titles text-uno text-5xl text-center">D</span>
      <ul className="flex flex-col items-center">
        {navigations.map((item) => (
          <NavLink key={item.page} className={({ isActive }) => cn("w-full py-3 flex justify-center", isActive && "bg-uno")} to={item.page}>
            {({ isActive }) => <item.icon className={cn(iconBaseStyle, isActive && "text-cuatro hover:text-cinco")} />}
          </NavLink>
        ))}
      </ul>

      <ul className="flex flex-col  items-center">
        {options.map((item) => (
          <NavLink key={item.page} className={({ isActive }) => cn("w-full py-3 flex justify-center", isActive && "bg-uno")} to={item.page}>
            {({ isActive }) => <item.icon className={cn(iconBaseStyle, isActive && "text-cuatro hover:text-cinco")} />}
          </NavLink>
        ))}
      </ul>
    </nav>
  );
};
