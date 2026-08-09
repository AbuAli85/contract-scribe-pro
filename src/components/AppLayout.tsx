import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Settings,
  PlusCircle,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { to: "/records",     label: "Contracts",    icon: FileText         },
  { to: "/parties",     label: "Parties",      icon: Users            },
  { to: "/templates",   label: "Templates",    icon: FolderOpen       },
  { to: "/my-templates",label: "My Templates", icon: Sparkles         },
  { to: "/settings",    label: "Settings",     icon: Settings         },
] as const;

export interface AppLayoutProps {
  /**
   * Guard the routes in this group behind a session. Public surfaces —
   * ministry letters, which must work for a visitor arriving from an ad
   * with no account — pass false and get the same chrome without the
   * redirect.
   */
  requireAuth?: boolean;
}

export default function AppLayout({ requireAuth = true }: AppLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const bounce = () => {
      const dest = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(dest)}`, { replace: true });
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          if (requireAuth) bounce();
        } else {
          setUserEmail(session.user.email ?? null);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        // A failed session lookup must not lock a visitor out of a public
        // page — only guarded routes bounce.
        if (requireAuth) bounce();
        setAuthChecked(true);
      });
  }, [navigate, requireAuth]);

  if (!authChecked) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/auth");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          {/* ── Logo ── */}
          <SidebarHeader className="p-4 border-b">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm truncate group-data-[collapsible=icon]:hidden">
                Contract Scribe
              </span>
            </NavLink>
          </SidebarHeader>

          {/* ── Quick action ── */}
          <div className="px-3 pt-3 group-data-[collapsible=icon]:px-2">
            <Button
              size="sm"
              className="w-full justify-start gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              onClick={() => navigate("/records/new")}
            >
              <PlusCircle className="h-4 w-4 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">New Contract</span>
            </Button>
          </div>

          {/* ── Nav links ── */}
          <SidebarContent className="pt-2">
            <SidebarMenu>
              {NAV.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* ── User / sign-out ── */}
          <SidebarFooter className="border-t p-3 space-y-1">
            {userEmail && (
              <p className="text-[11px] text-muted-foreground truncate px-2 group-data-[collapsible=icon]:hidden">
                {userEmail}
              </p>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                {userEmail ? (
                  <SidebarMenuButton tooltip="Sign out" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                ) : (
                  // Public route, no session: offer the way in rather than a
                  // sign-out that would do nothing.
                  <SidebarMenuButton asChild tooltip="Sign in">
                    <NavLink to="/auth">
                      <LogIn className="h-4 w-4" />
                      <span>Sign in</span>
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main content ── */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <header className="flex items-center h-12 px-4 border-b bg-background/95 backdrop-blur sticky top-0 z-30">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
