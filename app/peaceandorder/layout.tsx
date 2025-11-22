"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PaoSidebar } from "@/components/pao-sidebar";

export default function PeaceAndOrderLayout({children}: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <PaoSidebar />
            <main>
                {children}
            </main>
        </SidebarProvider>
    );
}