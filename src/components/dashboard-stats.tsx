
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calendar, FileText, Users, BarChart2 } from 'lucide-react';

const DashboardStats = () => {
  const [contracts, setContracts] = useState([]);
  const [period, setPeriod] = useState('week');
  
  useEffect(() => {
    // Load saved contracts from localStorage
    const savedContracts = localStorage.getItem("savedContracts");
    if (savedContracts) {
      try {
        const parsedContracts = JSON.parse(savedContracts);
        setContracts(parsedContracts);
      } catch (error) {
        console.error("Error parsing saved contracts:", error);
      }
    }
  }, []);
  
  // Calculate statistics
  const totalContracts = contracts.length;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const contractsThisWeek = contracts.filter(
    c => new Date(c.timestamp) >= startOfWeek
  ).length;
  
  const contractsThisMonth = contracts.filter(
    c => new Date(c.timestamp) >= startOfMonth
  ).length;
  
  // Prepare chart data
  const getTimelineData = () => {
    let timeframeDays = 7;
    if (period === 'month') timeframeDays = 30;
    if (period === 'year') timeframeDays = 365;
    
    const labels = [];
    const data = [];
    
    // Create date labels and initialize counts
    for (let i = 0; i < (period === 'week' ? 7 : period === 'month' ? 30 : 12); i++) {
      const date = new Date();
      
      if (period === 'year') {
        date.setMonth(date.getMonth() - 11 + i);
        labels.push(date.toLocaleString('default', { month: 'short' }));
      } else {
        date.setDate(date.getDate() - (period === 'week' ? 6 : 29) + i);
        labels.push(date.toLocaleDateString('default', { month: 'short', day: 'numeric' }));
      }
      
      data.push({
        name: labels[i],
        value: 0
      });
    }
    
    // Count contracts for each period
    contracts.forEach(contract => {
      const contractDate = new Date(contract.timestamp);
      const today = new Date();
      
      let index;
      if (period === 'year') {
        // Check if within last 12 months
        if (contractDate > new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())) {
          index = 11 - (today.getMonth() - contractDate.getMonth() + (today.getFullYear() - contractDate.getFullYear()) * 12);
          if (index >= 0 && index < 12) {
            data[index].value++;
          }
        }
      } else {
        // Calculate days ago
        const timeDiff = today.getTime() - contractDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff < timeframeDays) {
          index = timeframeDays - 1 - daysDiff;
          if (index >= 0 && index < (period === 'week' ? 7 : 30)) {
            data[index].value++;
          }
        }
      }
    });
    
    return data;
  };
  
  // Data for distribution charts
  const getPartyData = () => {
    const parties = {};
    
    contracts.forEach(contract => {
      const firstPartyName = contract.contract?.firstParty?.nameEn;
      if (firstPartyName) {
        if (parties[firstPartyName]) {
          parties[firstPartyName]++;
        } else {
          parties[firstPartyName] = 1;
        }
      }
    });
    
    return Object.entries(parties)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const getLocationData = () => {
    const locations = {};
    
    contracts.forEach(contract => {
      const locationName = contract.contract?.location?.nameEn;
      if (locationName) {
        if (locations[locationName]) {
          locations[locationName]++;
        } else {
          locations[locationName] = 1;
        }
      }
    });
    
    return Object.entries(locations)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const timelineData = getTimelineData();
  const partyData = getPartyData();
  const locationData = getLocationData();
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-3xl font-bold">{totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold">{contractsThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">{contractsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unique Companies</p>
                <p className="text-3xl font-bold">{Object.keys(partyData).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="week" onValueChange={setPeriod}>
        <div className="flex items-center justify-between">
          <CardTitle>Contract Activity</CardTitle>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="week" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Contracts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Contracts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="year" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Contracts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
            <CardDescription>Most frequent first parties in contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {partyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Most frequent locations in contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={locationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
