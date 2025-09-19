import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyProfile } from '@/contexts/FamilyProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, User, LogOut, Activity, Brain, TrendingUp, CheckCircle, AlertTriangle, XCircle, Search, Bell, Eye, Download, Trash2, Calendar, Clock, Users, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReportUpload from '@/components/ReportUpload';
import AnalysisResults from '@/components/AnalysisResults';
import ProfileSwitcher from '@/components/ProfileSwitcher';

interface MedicalReport {
  id: string;
  file_name: string;
  file_type: string;
  analysis_results: any;
  detailed_analysis?: any;
  predictions: any;
  processing_status: string;
  profile_id?: string;
  created_at: string;
  report_type?: string;
  validation_status?: string;
  validation_message?: string;
}

interface Profile {
  first_name: string;
  last_name: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { currentProfile } = useFamilyProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentProfile) {
      fetchReports();
    }
  }, [user, currentProfile]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchReports = async () => {
    if (!user || !currentProfile) return;

    setLoadingReports(true);
    const { data, error } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', currentProfile.profile_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load your reports.",
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setLoadingReports(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/auth');
  };

  const handleUploadComplete = () => {
    fetchReports();
    setShowUpload(false);
  };

  const viewReportAnalysis = (report: MedicalReport) => {
    setSelectedReport(report);
    setCurrentPage('analysis');
  };

  const deleteReport = async (reportId: string) => {
    const { error } = await supabase
      .from('medical_reports')
      .delete()
      .eq('id', reportId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Report deleted successfully.",
      });
      fetchReports();
    }
  };

  const completedReports = reports.filter(r => r.processing_status === 'completed' && r.validation_status === 'validated');
  const pendingReports = reports.filter(r => r.processing_status === 'pending' || r.processing_status === 'processing');
  const failedReports = reports.filter(r => r.processing_status === 'failed');
  const rejectedReports = reports.filter(r => r.validation_status === 'rejected');

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MediSync</h1>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              MAIN MENU
            </div>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'dashboard' ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'reports' ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setCurrentPage('analysis')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentPage === 'analysis' ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span>Analysis</span>
            </button>
            <button
              onClick={() => navigate('/family-profiles')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Users className="h-4 w-4" />
              <span>Family Profiles</span>
            </button>
          </nav>
        </div>

        {/* User Profile at bottom */}
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {profile?.first_name?.[0] || user.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-muted-foreground">
                  Welcome back to your health dashboard
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search reports, family...
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {profile?.first_name?.[0] || 'Y'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Profile Switcher */}
          {currentProfile && (
            <div className="mb-6">
              <ProfileSwitcher />
            </div>
          )}

          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Health overview for {currentProfile?.name || 'Unknown'}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                        <p className="text-2xl font-bold">{reports.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{completedReports.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{pendingReports.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                        <p className="text-2xl font-bold">{rejectedReports.length}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Overview */}
              <Card className="mt-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">Health Overview</CardTitle>
                    <CardDescription>All Health Categories</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Show All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Health Score Distribution */}
                    <div>
                      <h3 className="font-semibold mb-4 text-lg">Health Score Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">90%+</span>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: '83%'}}></div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">80-89%</span>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">4</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">70-79%</span>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-muted h-2 rounded-full" style={{width: '0%'}}></div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">0</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">Average: 87%</div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Excellent (90%+)</span>
                        <span>Good (80-89%)</span>
                        <span>Fair (70-79%)</span>
                      </div>
                    </div>

                    {/* Health Categories Grid - Dynamic from Latest Report */}
                    <div>
                      <h3 className="font-semibold mb-4 text-lg">Health Parameters Overview</h3>
                      {completedReports.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {(() => {
                            const latestReport = completedReports[0];
                            const analysisData = latestReport.detailed_analysis || latestReport.analysis_results?.map(item => ({
                              parameter: item.test,
                              status: item.status === 'normal' ? '✅ Normal' : '⚠️ Abnormal'
                            })) || [];
                            
                            // Get first 12 parameters to fill the grid
                            const displayParameters = analysisData.slice(0, 12);
                            
                            return displayParameters.map((param, index) => {
                              const isNormal = param.status?.includes('✅') || param.status === 'normal';
                              const score = isNormal ? Math.floor(Math.random() * 11) + 90 : Math.floor(Math.random() * 21) + 70;
                              const color = score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-yellow-500' : 'bg-red-500';
                              
                              return (
                                <div key={index} className="text-center">
                                  <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight h-8 flex items-center justify-center">
                                    {param.parameter || `Parameter ${index + 1}`}
                                  </div>
                                  <div className="text-lg font-bold mb-2">{score}%</div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className={`${color} h-2 rounded-full transition-all duration-300`}
                                      style={{width: `${score}%`}}
                                    ></div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { name: 'Hemoglobin', score: 90, color: 'bg-green-500' },
                            { name: 'Cholesterol', score: 85, color: 'bg-yellow-500' },
                            { name: 'Blood Glucose', score: 88, color: 'bg-green-500' },
                            { name: 'Creatinine', score: 92, color: 'bg-green-500' },
                            { name: 'White Blood Cells', score: 87, color: 'bg-yellow-500' },
                            { name: 'Red Blood Cells', score: 91, color: 'bg-green-500' },
                            { name: 'Platelet Count', score: 89, color: 'bg-green-500' },
                            { name: 'HDL Cholesterol', score: 83, color: 'bg-yellow-500' },
                            { name: 'LDL Cholesterol', score: 78, color: 'bg-yellow-500' },
                            { name: 'Triglycerides', score: 84, color: 'bg-yellow-500' },
                            { name: 'Liver Function', score: 93, color: 'bg-green-500' },
                            { name: 'Kidney Function', score: 88, color: 'bg-green-500' }
                          ].map((category, index) => (
                            <div key={index} className="text-center">
                              <div className="text-xs font-medium text-muted-foreground mb-1 leading-tight h-8 flex items-center justify-center">
                                {category.name}
                              </div>
                              <div className="text-lg font-bold mb-2">{category.score}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className={`${category.color} h-2 rounded-full transition-all duration-300`}
                                  style={{width: `${category.score}%`}}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'reports' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Medical Reports</h1>
                  <p className="text-muted-foreground">
                    Medical reports for {currentProfile?.name || 'Unknown'}
                  </p>
                </div>
                <Button onClick={() => setShowUpload(true)} className="bg-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>

              {/* Status Cards */}
              <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                        <p className="text-3xl font-bold text-green-800 dark:text-green-200">{completedReports.length}</p>
                      </div>
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending</p>
                        <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">{pendingReports.length}</p>
                      </div>
                      <AlertTriangle className="h-12 w-12 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Failed</p>
                        <p className="text-3xl font-bold text-red-800 dark:text-red-200">{failedReports.length}</p>
                      </div>
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Rejected</p>
                        <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{rejectedReports.length}</p>
                      </div>
                      <AlertTriangle className="h-12 w-12 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="rejected">Rejected (Non-Medical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {loadingReports ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : reports.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Upload your first medical report to get started with AI analysis.
                      </p>
                      <Button onClick={() => setShowUpload(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => {
                    const isRejected = report.validation_status === 'rejected';
                    const isPending = report.processing_status === 'pending' || report.processing_status === 'processing';
                    const isFailed = report.processing_status === 'failed';
                    
                    return (
                      <Card 
                        key={report.id} 
                        className={`hover:bg-muted/50 transition-colors ${
                          isRejected ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30' : ''
                        }`}
                      >
                        <CardContent className="p-6">
                          {isRejected && (
                            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Non-Medical Document Detected</span>
                              </div>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                {report.validation_message || 'This file does not appear to be a medical report.'}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-lg">{report.file_name}</h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(report.created_at).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(report.created_at).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <Badge 
                                variant={
                                  isRejected ? 'secondary' :
                                  report.processing_status === 'completed' ? 'default' : 'secondary'
                                }
                                className={`${
                                  isRejected
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : report.processing_status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : isFailed
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                }`}
                              >
                                {isRejected ? 'REJECTED' : (report.processing_status?.toUpperCase() || 'PENDING')}
                              </Badge>
                              
                              <div className="flex items-center space-x-2">
                                {!isRejected && report.processing_status === 'completed' && (
                                  <Button variant="ghost" size="sm" onClick={() => viewReportAnalysis(report)}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                )}
                                
                                {!isRejected && (
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteReport(report.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentPage === 'family' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Family Profiles</h1>
                <p className="text-muted-foreground">Manage health records for your family members</p>
              </div>
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Family Profiles</h3>
                  <p className="text-muted-foreground">This feature is coming soon!</p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'analysis' && (
            <div className="space-y-6">
              {selectedReport ? (
                <AnalysisResults report={selectedReport} />
              ) : (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold">Analysis Overview</h1>
                  <p className="text-muted-foreground mb-6">
                    View detailed analysis for {currentProfile?.name || 'Unknown'}
                  </p>
                  
                  {completedReports.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Recent Analyses</h3>
                      {completedReports.slice(0, 5).map((report) => (
                        <Card key={report.id} className="hover:bg-muted/50 transition-colors cursor-pointer" 
                              onClick={() => viewReportAnalysis(report)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{report.file_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Brain className="h-4 w-4 mr-2" />
                                View Analysis
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No analyses available</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload a medical report to get AI-powered analysis.
                        </p>
                        <Button onClick={() => setShowUpload(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Report
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload Medical Report</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                  ×
                </Button>
              </div>
              <ReportUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;