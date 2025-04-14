
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import DashboardStats from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [language, setLanguage] = useState<"ar" | "en">("en");

  // List of quick action cards
  const quickActions = [
    {
      title: language === "ar" ? "إنشاء عقد جديد" : "Create New Contract",
      description: language === "ar" ? "إنشاء عقد مروج ثنائي اللغة جديد" : "Create a new bilingual promoter contract",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/create-contract",
    },
    {
      title: language === "ar" ? "العقود الأخيرة" : "Recent Contracts",
      description: language === "ar" ? "عرض العقود التي تم إنشاؤها مؤخرًا" : "View recently created contracts",
      icon: <Clock className="h-5 w-5" />,
      href: "/history",
    },
    {
      title: language === "ar" ? "نماذج العقود" : "Contract Templates",
      description: language === "ar" ? "استخدم نماذج العقود الجاهزة" : "Use pre-built contract templates",
      icon: <FileText className="h-5 w-5" />,
      href: "/templates",
    },
  ];

  // Recent activity items (placeholder data)
  const recentActivity = [
    {
      action: language === "ar" ? "تم إنشاء عقد" : "Contract created",
      details: "CP-20250413-8006",
      timestamp: "10 minutes ago",
    },
    {
      action: language === "ar" ? "تم تحميل مستند" : "Document uploaded",
      details: "letterhead-2025.jpg",
      timestamp: "1 hour ago",
    },
    {
      action: language === "ar" ? "تم تنزيل عقد" : "Contract downloaded",
      details: "PC-20250412-7432",
      timestamp: "Yesterday",
    },
    {
      action: language === "ar" ? "تم تحديث قالب Excel" : "Excel template updated",
      details: "contract_template.xlsx",
      timestamp: "2 days ago",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "لوحة المعلومات" : "Dashboard"}
        </h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link to="/create-contract">
              <PlusCircle className="mr-2 h-4 w-4" />
              {language === "ar" ? "إنشاء عقد" : "Create Contract"}
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-8">
        {/* Stats Section */}
        <DashboardStats />
        
        {/* Quick Actions and Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "اختصارات للمهام الشائعة" : "Shortcuts to common tasks"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {quickActions.map((action, index) => (
                  <Link to={action.href} key={index}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "آخر الإجراءات المتخذة في النظام" : "Latest actions taken in the system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivity.map((activity, index) => (
                  <div className="flex" key={index}>
                    <div className="relative mr-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-4 top-9 bottom-0 w-px -ml-px bg-border" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
