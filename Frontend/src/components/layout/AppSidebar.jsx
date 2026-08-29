import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";

export default function AppSidebar() {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: <FolderKanban className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* TaskFlow Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10B981]">
              <span className="font-bold text-white">T</span>
            </div>

            {open && (
              <span className="font-semibold text-[#17201B] dark:text-white">
                TaskFlow
              </span>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link) => (
              <SidebarLink key={link.label} link={link} />
            ))}
          </div>
        </div>

        {/* Logout */}
        <SidebarLink
          link={{
            label: "Logout",
            href: "/logout",
            icon: <LogOut className="h-5 w-5 shrink-0 text-red-500" />,
          }}
        />
      </SidebarBody>
    </Sidebar>
  );
}
