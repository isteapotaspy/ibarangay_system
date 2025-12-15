"use client"

import { JSX } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,  
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url?: string
  icon?: LucideIcon
  items?: {
    title: string
    url: string
    render?: () => React.ReactNode
  }[]
  render?: () => React.ReactNode
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

/* ---------------------------------- */
/* INDIVIDUAL MENU ITEM COMPONENT     */
/* ---------------------------------- */

function NavMainItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const hasSubItems = item.items && item.items.length > 0
  const isActive = pathname.startsWith(item.url || "")

  const [open, setOpen] = useState(isActive)

  // If a custom render is provided, just render it instead
  if (item.render) {
    return <SidebarMenuItem>{item.render()}</SidebarMenuItem>
  }

  return (
    <SidebarMenuItem>
      {hasSubItems ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isActive}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight
                className={`ml-auto transition-transform ${
                  open ? "rotate-90" : ""
                }`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items!.map((sub) =>
                sub.render ? (
                  <SidebarMenuSubItem key={sub.title}>
                    {sub.render()}
                  </SidebarMenuSubItem>
                ) : (
                  <SidebarMenuSubItem key={sub.title}>
                    <SidebarMenuSubButton asChild isActive={pathname === sub.url}>
                      <Link href={sub.url}>
                        <span>{sub.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={item.url!}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  )
}
