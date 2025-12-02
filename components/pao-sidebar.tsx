
import Link from "next/link";
import { FileText, ClipboardList, ShieldCheck, AlertCircle, BarChart2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SidebarItem = {
  title: string
  url: string
  icon: React.ElementType
}

//MENU ITEMS
const items: SidebarItem[] = [ 
  { title: "Dashboard", url: "/peaceandorder/dashboard", icon: BarChart2, },
  { title: "Incident & Complaint Logging", url: "/peaceandorder/incidentandcomplaint", icon: FileText, },
  { title: "Case Management", url: "/peaceandorder/casemanagement", icon: ClipboardList, },
  { title: "Peacekeeping Management", url: "/peaceandorder/peacekeeping", icon: ShieldCheck, },
  { title: "Disaster Response Logs", url: "/peaceandorder/disasterresponselogs", icon: AlertCircle, },
]


export function PaoSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>PEACE AND ORDER</SidebarGroupLabel>
              <SidebarMenu> 
                {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span> 
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

