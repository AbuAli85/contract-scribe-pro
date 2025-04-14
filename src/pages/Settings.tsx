
import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Save, RefreshCw, Languages, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<"ar" | "en">("en")
  
  // Form states
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    darkMode: false,
    rtlLayout: false,
    autoSave: true,
    notificationsEnabled: true,
    dateFormat: "dd/mm/yyyy",
    defaultLetterhead: "",
    companyInfo: {
      name: "Your Company",
      crn: "1234567890",
      nameAr: "شركتك",
      crnAr: "١٢٣٤٥٦٧٨٩٠"
    },
    developerMode: false
  })
  
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator"
  })

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const savedProfile = localStorage.getItem("userProfile");
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
    
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
  }, []);
  
  // Handle settings update
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // Handle nested settings update
  const handleCompanyInfoChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [key]: value
      }
    }))
  }
  
  // Handle profile update
  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // Save settings
  const saveSettings = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem("appSettings", JSON.stringify(settings))
      localStorage.setItem("userProfile", JSON.stringify(profile))
      
      setIsLoading(false)
      toast({
        title: language === "ar" ? "تم حفظ الإعدادات" : "Settings saved",
        description: language === "ar" ? "تم تحديث إعدادات التطبيق بنجاح" : "Your application settings have been updated successfully",
      })
    }, 1000)
  }
  
  // Reset settings
  const resetSettings = () => {
    const defaultSettings = {
      defaultLanguage: "en",
      darkMode: false,
      rtlLayout: false,
      autoSave: true,
      notificationsEnabled: true,
      dateFormat: "dd/mm/yyyy",
      defaultLetterhead: "",
      companyInfo: {
        name: "Your Company",
        crn: "1234567890",
        nameAr: "شركتك",
        crnAr: "١٢٣٤٥٦٧٨٩٠"
      },
      developerMode: false
    }
    
    setSettings(defaultSettings)
    
    toast({
      title: language === "ar" ? "تمت إعادة التعيين" : "Settings reset",
      description: language === "ar" ? "تم إعادة تعيين الإعدادات إلى القيم الافتراضية" : "All settings have been reset to default values",
    })
  }
  
  // Export settings
  const exportSettings = () => {
    const settingsData = JSON.stringify({
      settings,
      profile
    }, null, 2)
    
    // Create a blob and download it
    const blob = new Blob([settingsData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contract_generator_settings.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: language === "ar" ? "تم التصدير" : "Settings exported",
      description: language === "ar" ? "تم تصدير الإعدادات إلى ملف JSON" : "Settings have been exported to a JSON file",
    })
  }
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
      </div>
      
      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="general">{language === "ar" ? "عام" : "General"}</TabsTrigger>
          <TabsTrigger value="appearance">{language === "ar" ? "المظهر" : "Appearance"}</TabsTrigger>
          <TabsTrigger value="company">{language === "ar" ? "الشركة" : "Company"}</TabsTrigger>
          <TabsTrigger value="advanced">{language === "ar" ? "متقدم" : "Advanced"}</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "الإعدادات العامة" : "General Settings"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "إدارة الإعدادات الأساسية للتطبيق" : "Manage basic application settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{language === "ar" ? "اللغة الافتراضية" : "Default Language"}</Label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => handleSettingChange("defaultLanguage", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder={language === "ar" ? "اختر اللغة" : "Select language"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">{language === "ar" ? "تنسيق التاريخ" : "Date Format"}</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => handleSettingChange("dateFormat", value)}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder={language === "ar" ? "اختر تنسيق التاريخ" : "Select date format"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave">{language === "ar" ? "حفظ تلقائي للعقود" : "Auto-save contracts"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "حفظ تلقائي للعقود أثناء التحرير" 
                      : "Automatically save contracts while editing"}
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">{language === "ar" ? "تمكين الإشعارات" : "Enable notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "إظهار إشعارات النظام" 
                      : "Show system notifications"}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{language === "ar" ? "الملف الشخصي" : "Profile"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "معلومات المستخدم والحساب" : "User and account information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{language === "ar" ? "الاسم" : "Name"}</Label>
                <Input 
                  id="name" 
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">{language === "ar" ? "الدور" : "Role"}</Label>
                <Select 
                  value={profile.role}
                  onValueChange={(value) => handleProfileChange("role", value)}
                  disabled
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? "تغيير الدور غير متاح في هذا الإصدار" : "Role change is not available in this version"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "إعدادات المظهر" : "Appearance Settings"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "تخصيص مظهر التطبيق" : "Customize the application appearance"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">{language === "ar" ? "الوضع الداكن" : "Dark Mode"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "تفعيل المظهر الداكن للتطبيق" 
                      : "Enable dark theme for the application"}
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rtlLayout">{language === "ar" ? "تخطيط من اليمين إلى اليسار" : "RTL Layout"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "تمكين تخطيط من اليمين إلى اليسار للنصوص" 
                      : "Enable right-to-left layout for text"}
                  </p>
                </div>
                <Switch
                  id="rtlLayout"
                  checked={settings.rtlLayout}
                  onCheckedChange={(checked) => handleSettingChange("rtlLayout", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="letterhead">{language === "ar" ? "الترويسة الافتراضية" : "Default Letterhead"}</Label>
                <Input 
                  id="letterhead" 
                  placeholder={language === "ar" ? "مسار الصورة" : "Image path"}
                  value={settings.defaultLetterhead}
                  onChange={(e) => handleSettingChange("defaultLetterhead", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "ar" 
                    ? "اترك فارغًا لاستخدام الترويسة الافتراضية للنظام" 
                    : "Leave empty to use system default letterhead"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>{language === "ar" ? "معلومات الشركة" : "Company Information"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "إدارة معلومات الشركة المستخدمة في العقود" : "Manage company information used in contracts"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{language === "ar" ? "اسم الشركة (بالإنجليزية)" : "Company Name (English)"}</Label>
                  <Input 
                    id="companyName" 
                    value={settings.companyInfo.name}
                    onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyNameAr">{language === "ar" ? "اسم الشركة (بالعربية)" : "Company Name (Arabic)"}</Label>
                  <Input 
                    id="companyNameAr" 
                    value={settings.companyInfo.nameAr}
                    onChange={(e) => handleCompanyInfoChange("nameAr", e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crn">{language === "ar" ? "رقم السجل التجاري (بالإنجليزية)" : "Commercial Registration No. (English)"}</Label>
                  <Input 
                    id="crn" 
                    value={settings.companyInfo.crn}
                    onChange={(e) => handleCompanyInfoChange("crn", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crnAr">{language === "ar" ? "رقم السجل التجاري (بالعربية)" : "Commercial Registration No. (Arabic)"}</Label>
                  <Input 
                    id="crnAr" 
                    value={settings.companyInfo.crnAr}
                    onChange={(e) => handleCompanyInfoChange("crnAr", e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{language === "ar" ? "الإعدادات المتقدمة" : "Advanced Settings"}</CardTitle>
                  <CardDescription>
                    {language === "ar" ? "إعدادات متقدمة للمستخدمين ذوي الخبرة" : "Advanced settings for experienced users"}
                  </CardDescription>
                </div>
                <Badge variant="destructive">
                  {language === "ar" ? "متقدم" : "Advanced"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="devMode">{language === "ar" ? "وضع المطور" : "Developer Mode"}</Label>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "تمكين ميزات متقدمة للمطورين" 
                      : "Enable advanced features for developers"}
                  </p>
                </div>
                <Switch
                  id="devMode"
                  checked={settings.developerMode}
                  onCheckedChange={(checked) => handleSettingChange("developerMode", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {language === "ar" ? "تصدير واستيراد الإعدادات" : "Export and Import Settings"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" 
                    ? "تصدير واستيراد إعدادات التطبيق" 
                    : "Export and import application settings"}
                </p>
                <div className="flex flex-col xs:flex-row gap-2 mt-2">
                  <Button variant="secondary" onClick={exportSettings}>
                    {language === "ar" ? "تصدير الإعدادات" : "Export Settings"}
                  </Button>
                  <Button variant="outline" disabled>
                    {language === "ar" ? "استيراد الإعدادات" : "Import Settings"}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {language === "ar" ? "إعادة تعيين الإعدادات" : "Reset Settings"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" 
                    ? "إعادة تعيين جميع الإعدادات إلى القيم الافتراضية" 
                    : "Reset all settings to default values"}
                </p>
                <Button variant="destructive" onClick={resetSettings} className="mt-2">
                  {language === "ar" ? "إعادة تعيين الإعدادات" : "Reset Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex items-center justify-between">
        <div>
          <Button variant="outline" asChild>
            <a href="/dashboard">
              {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
            </a>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={saveSettings} 
            disabled={isLoading} 
            className="flex gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {language === "ar" ? "حفظ الإعدادات" : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
