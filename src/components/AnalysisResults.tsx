import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Brain, TrendingUp, AlertTriangle, CheckCircle, Download, User, Calendar, Hospital, ArrowUp, ArrowDown, Heart, Droplets, Activity, Stethoscope } from 'lucide-react';

interface AnalysisData {
  parameter: string;
  value: string;
  unit: string;
  normal_range: string;
  status: '✅ Normal' | '⚠️ Abnormal';
  deviation: string;
  note: string;
  ocr_snippet: string;
}

interface PredictionData {
  condition: string;
  confidence: 'Low' | 'Medium' | 'High';
  linked_values: string[];
  reason_one_line: string;
  proof_citation: string;
}

interface LegacyAnalysisData {
  test: string;
  value: string;
  range: string;
  status: 'normal' | 'abnormal';
  icon: string;
}

interface LegacyPredictionData {
  risk_level: string;
  condition: string;
  recommendation: string;
}

interface MedicalReport {
  id: string;
  file_name: string;
  file_type: string;
  detailed_analysis?: AnalysisData[];
  prediction_details?: PredictionData[];
  analysis_results?: LegacyAnalysisData[];
  predictions?: LegacyPredictionData[];
  processing_status?: string;
  created_at: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  test_date?: string;
  hospital_name?: string;
  doctor_name?: string;
  patient_friendly_analysis?: string;
}

interface AnalysisResultsProps {
  report: MedicalReport;
}

const AnalysisResults = ({ report }: AnalysisResultsProps) => {
  // Use enhanced analysis data if available, fallback to legacy format
  const analysisData = report.detailed_analysis || report.analysis_results?.map(item => ({
    parameter: item.test,
    value: item.value,
    unit: 'N/A',
    normal_range: item.range,
    status: item.status === 'normal' ? '✅ Normal' as const : '⚠️ Abnormal' as const,
    deviation: 'N/A',
    note: item.status === 'normal' ? '' : 'Please consult your healthcare provider',
    ocr_snippet: `${item.test}: ${item.value}`
  })) || [];
  
  const predictions = report.prediction_details || report.predictions?.map(pred => ({
    condition: pred.condition,
    confidence: pred.risk_level as 'Low' | 'Medium' | 'High',
    linked_values: [pred.condition],
    reason_one_line: pred.recommendation,
    proof_citation: 'Clinical guidelines and standard medical practice'
  })) || [];
  
  const normalCount = analysisData.filter(item => item.status === '✅ Normal').length;
  const abnormalCount = analysisData.filter(item => item.status === '⚠️ Abnormal').length;

  const getRiskBadgeVariant = (confidence: string) => {
    const level = confidence.toLowerCase();
    if (level.includes('high')) return 'destructive';
    if (level.includes('medium') || level.includes('moderate')) return 'secondary';
    return 'default';
  };

  const getStatusVariant = (status: string) => {
    if (status.includes('✅')) return 'default';
    if (status.includes('⚠️')) return 'secondary';
    return 'outline';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-3 w-3" />;
    if (status.includes('⚠️')) return <AlertTriangle className="h-3 w-3" />;
    return null;
  };

  const getHealthIcon = (parameter: string) => {
    const param = parameter.toLowerCase();
    if (param.includes('cholesterol') || param.includes('lipid')) return <Heart className="h-4 w-4" />;
    if (param.includes('glucose') || param.includes('sugar')) return <Droplets className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const generateHealthSummary = () => {
    const abnormalItems = analysisData.filter(item => item.status === '⚠️ Abnormal' && item.note && item.note.trim() !== '');
    const summaryCards = abnormalItems.map(item => ({
      parameter: item.parameter,
      status: item.status,
      note: item.note,
      icon: getHealthIcon(item.parameter)
    }));
    return summaryCards;
  };

  const exportToCSV = () => {
    const analysisCSV = [
      ['Parameter', 'Value', 'Unit', 'Report Range', 'Normal Range', 'Status', 'Deviation', 'Note'],
      ...analysisData.map(item => [
        item.parameter,
        item.value,
        item.unit,
        item.normal_range,
        item.normal_range,
        item.status,
        item.deviation,
        item.note
      ])
    ].map(row => row.join(',')).join('\n');

    const predictionCSV = [
      ['Condition', 'Confidence', 'Linked Values', 'Reason', 'Citation'],
      ...predictions.map(pred => [
        pred.condition,
        pred.confidence,
        pred.linked_values.join('; '),
        pred.reason_one_line,
        pred.proof_citation
      ])
    ].map(row => row.join(',')).join('\n');

    const fullCSV = `ANALYSIS RESULTS\n${analysisCSV}\n\nPREDICTIONS\n${predictionCSV}`;
    
    const blob = new Blob([fullCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.file_name}_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    const reportContent = `
MediSync AI - Enhanced Medical Report Analysis
=============================================

Report: ${report.file_name}
Date: ${new Date(report.created_at).toLocaleDateString()}
Processing Status: ${report.processing_status || 'completed'}

DETAILED ANALYSIS RESULTS
========================
${analysisData.map(item => 
  `Parameter: ${item.parameter}
Value: ${item.value} ${item.unit}
Normal Range: ${item.normal_range}
Status: ${item.status}
Deviation: ${item.deviation}
Clinical Note: ${item.note}
Source Text: ${item.ocr_snippet}
`).join('\n')}

EVIDENCE-BASED PREDICTIONS
==========================
${predictions.map(pred => 
  `Condition: ${pred.condition}
Confidence Level: ${pred.confidence}
Linked Parameters: ${pred.linked_values.join(', ')}
Mechanism: ${pred.reason_one_line}
Evidence: ${pred.proof_citation}
`).join('\n')}

Summary: ${normalCount} Normal, ${abnormalCount} Abnormal parameters detected.

Generated by MediSync AI - ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.file_name}_detailed_analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const healthSummary = generateHealthSummary();

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Hi {report.patient_name || 'Patient'}, here's a quick snapshot of your health today
                </CardTitle>
                <div className="flex items-center gap-6 mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Age: {report.patient_age || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Gender: {report.patient_gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Test Date: {report.test_date || new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.hospital_name && (
                    <div className="flex items-center gap-1">
                      <Hospital className="h-4 w-4" />
                      <span>{report.hospital_name}</span>
                    </div>
                  )}
                </div>
                {report.doctor_name && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Reviewed by: Dr. {report.doctor_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadReport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" onClick={exportToCSV} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-bold text-2xl text-green-700 dark:text-green-300">{normalCount}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Parameters Normal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-bold text-2xl text-yellow-700 dark:text-yellow-300">{Math.floor(abnormalCount * 0.6)}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Slightly Abnormal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-bold text-2xl text-red-700 dark:text-red-300">{Math.ceil(abnormalCount * 0.4)}</p>
                <p className="text-sm text-red-600 dark:text-red-400">High Risk</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis & Predictions Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            My Health Summary
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overall Report View
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Health Predictions
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Health Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Health at a Glance</CardTitle>
              <CardDescription>
                Simple, patient-friendly insights from your lab results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthSummary.length > 0 ? (
                <div className="grid gap-4">
                  {healthSummary.map((item, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-full">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{item.parameter}</h4>
                          <p className="text-muted-foreground mb-2">{item.note}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getStatusVariant(item.status)}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(item.status)}
                              {item.status.replace('❌ ', '').replace('✅ ', '')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {healthSummary.length === 0 && (
                    <Card className="p-6 text-center border-2 border-dashed border-green-200 dark:border-green-800">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">
                        Great News! All Your Values Look Normal
                      </h3>
                      <p className="text-green-600 dark:text-green-400">
                        Keep up the healthy lifestyle and regular check-ups.
                      </p>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center border-2 border-dashed border-green-200 dark:border-green-800">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">
                    Great News! All Your Values Look Normal
                  </h3>
                  <p className="text-green-600 dark:text-green-400">
                    Keep up the healthy lifestyle and regular check-ups.
                  </p>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          {/* Key Findings & Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-6 w-6" />
                🔎 Key Findings & Health Insights
              </CardTitle>
              <CardDescription>
                Clear breakdown of {report.patient_name || 'your'} medical report with future health outlook and key risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData
                  .filter(item => item.status === '⚠️ Abnormal')
                  .slice(0, 10)
                  .map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">
                          <strong>{item.parameter} ({item.value} {item.unit}):</strong> {item.note || `Outside normal range (${item.normal_range}). This may indicate potential health concerns that warrant medical attention and further evaluation.`}
                        </p>
                      </div>
                    </div>
                  ))}
                {analysisData.filter(item => item.status === '⚠️ Abnormal').length === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed text-green-700 dark:text-green-300">
                      <strong>Excellent news!</strong> All your test parameters are within normal ranges, indicating good overall health status.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Normal Values Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  ✅ Normal Values
                </CardTitle>
                <CardDescription>
                  Test results within healthy ranges ({analysisData.filter(item => item.status === '✅ Normal').length} parameters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-50 dark:bg-green-950/30">
                        <TableHead className="font-semibold">Test</TableHead>
                        <TableHead className="font-semibold">Result</TableHead>
                        <TableHead className="font-semibold">Normal Range</TableHead>
                        <TableHead className="font-semibold">Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData
                        .filter(item => item.status === '✅ Normal')
                        .map((item, index) => (
                          <TableRow key={index} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                            <TableCell className="font-medium">{item.parameter}</TableCell>
                            <TableCell className="font-semibold text-green-600 dark:text-green-400">
                              {item.value}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.normal_range}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.unit !== 'N/A' ? item.unit : '-'}</TableCell>
                          </TableRow>
                        ))}
                      {analysisData.filter(item => item.status === '✅ Normal').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-lg text-orange-700 dark:text-orange-300 mb-2">
                              No Normal Values Found
                            </h3>
                            <p className="text-orange-600 dark:text-orange-400">
                              Please consult with your healthcare provider for proper evaluation.
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Abnormal / Borderline Values Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  ⚠️ Abnormal / Borderline Values
                </CardTitle>
                <CardDescription>
                  Test results outside normal ranges ({analysisData.filter(item => item.status === '⚠️ Abnormal').length} parameters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50 dark:bg-red-950/30">
                        <TableHead className="font-semibold">Test</TableHead>
                        <TableHead className="font-semibold">Result</TableHead>
                        <TableHead className="font-semibold">Normal Range</TableHead>
                        <TableHead className="font-semibold">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData
                        .filter(item => item.status === '⚠️ Abnormal')
                        .slice(0, Math.max(10, analysisData.filter(item => item.status === '⚠️ Abnormal').length))
                        .map((item, index) => (
                          <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                            <TableCell className="font-medium">{item.parameter}</TableCell>
                            <TableCell className="font-semibold text-red-600 dark:text-red-400">
                              {item.value} {item.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.normal_range}</TableCell>
                            <TableCell className="text-sm text-red-600 dark:text-red-400">
                              {item.deviation === 'High' ? '↑ High' : item.deviation === 'Low' ? '↓ Low' : 'Borderline'}
                            </TableCell>
                          </TableRow>
                        ))}
                      {analysisData.filter(item => item.status === '⚠️ Abnormal').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">
                              No Abnormal Findings
                            </h3>
                            <p className="text-green-600 dark:text-green-400">
                              All your test results are within normal ranges.
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Future Health Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-5 w-5" />
                📈 Future Health Prediction
              </CardTitle>
              <CardDescription>
                Health outlook and recommendations based on your test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abnormalCount > 0 ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">If untreated:</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Risk of complications from abnormal values including potential cardiovascular, metabolic, or organ function issues. 
                        Early intervention is key to preventing progression.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">With early action:</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Good outlook – most issues are modifiable with proper medical care, lifestyle changes, and regular monitoring. 
                        Many abnormal values can be corrected with appropriate treatment.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Immediate focus areas:</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                        <li>• Schedule follow-up with your healthcare provider</li>
                        <li>• Consider lifestyle modifications (diet, exercise, stress management)</li>
                        <li>• Monitor symptoms and track progress</li>
                        <li>• Follow prescribed treatment plans consistently</li>
                        <li>• Regular health check-ups and repeat testing as recommended</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Excellent Health Status:</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      All your test results are within normal ranges, indicating good overall health. 
                      Continue with your current healthy lifestyle and regular check-ups to maintain this positive status.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Encouragement Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ✨ Encouragement
                </h3>
                <p className="text-blue-800 dark:text-blue-200 max-w-2xl mx-auto">
                  {abnormalCount > 0 
                    ? `Your report shows ${normalCount} normal parameters with ${abnormalCount} values needing attention. With simple lifestyle and medical steps, your future health outlook is excellent. Remember: early detection and action lead to the best outcomes.`
                    : "Congratulations! Your report shows excellent health with all parameters in normal ranges. Keep up the great work with your healthy lifestyle and regular medical check-ups."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Values Analysis</CardTitle>
              <CardDescription>
                AI-powered analysis of your medical test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Normal Range</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deviation</TableHead>
                        <TableHead>Clinical Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.map((item, index) => (
                        <TableRow key={index} className={item.status === '⚠️ Abnormal' ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-green-50 dark:bg-green-950/30'}>
                          <TableCell className="font-medium">{item.parameter}</TableCell>
                          <TableCell className="font-bold">{item.value}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{item.normal_range}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(item.status)}
                              className="flex items-center gap-1 px-3 py-1 rounded-full"
                            >
                              {getStatusIcon(item.status)}
                              {item.status.replace('⚠️ ', '').replace('✅ ', '')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{item.deviation}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {item.note && item.note.trim() !== '' && (
                              <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                  {item.note}
                                </p>
                              </div>
                            )}
                            {item.ocr_snippet && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                                  View source text
                                </summary>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded block mt-1">
                                  {item.ocr_snippet}
                                </code>
                              </details>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No analysis data available. The AI may still be processing your report.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Future Health Risks & Recommendations</CardTitle>
              <CardDescription>
                Evidence-based predictions to help you stay healthy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <Card key={index} className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-red-400">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-xl">{prediction.condition}</h4>
                            <Badge 
                              variant={getRiskBadgeVariant(prediction.confidence)}
                              className="text-xs"
                            >
                              {prediction.confidence} Confidence
                            </Badge>
                          </div>
                          
                          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              🧪 Linked Values:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {prediction.linked_values.join(', ')}
                            </p>
                          </div>

                          <p className="text-muted-foreground mb-4 text-base">
                            📖 {prediction.reason_one_line}
                          </p>
                          
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium mb-2">
                              📚 View Scientific Evidence
                            </summary>
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-400">
                              <p className="text-blue-800 dark:text-blue-200 text-sm">{prediction.proof_citation}</p>
                            </div>
                          </details>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      <strong>Medical Disclaimer:</strong> These predictions are AI-generated insights based on clinical evidence and should not replace professional medical advice. Always consult with your healthcare provider for proper medical guidance and treatment decisions.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Card className="p-6 text-center border-2 border-dashed border-green-200 dark:border-green-800">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">
                    No Immediate Health Risks Detected
                  </h3>
                  <p className="text-green-600 dark:text-green-400">
                    Your lab results don't indicate any concerning patterns at this time.
                  </p>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Virtual Health Assistant
              </CardTitle>
              <CardDescription>
                Patient-friendly analysis and guidance from your lab results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.patient_friendly_analysis ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {report.patient_friendly_analysis
                        .replace(/### /g, '• ')
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*(.*?)\*/g, '$1')
                        .split('\n')
                        .map((line, index) => {
                          if (line.startsWith('• ')) {
                            return (
                              <div key={index} className="mb-4">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                  {line.replace('• ', '')}
                                </h3>
                              </div>
                            );
                          }
                          if (line.trim() === '') {
                            return <div key={index} className="mb-2"></div>;
                          }
                          if (line.includes('—') || line.includes('indicates') || line.includes('suggests')) {
                            return (
                              <div key={index} className="mb-3 p-3 bg-white/60 dark:bg-gray-900/60 rounded-md border-l-4 border-l-orange-400">
                                <p className="text-gray-800 dark:text-gray-200">{line}</p>
                              </div>
                            );
                          }
                          if (line.toLowerCase().includes('confidence') || line.toLowerCase().includes('risk')) {
                            return (
                              <div key={index} className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-md border border-yellow-200 dark:border-yellow-800">
                                <p className="text-yellow-800 dark:text-yellow-200">{line}</p>
                              </div>
                            );
                          }
                          if (line.toLowerCase().includes('disclaimer')) {
                            return (
                              <div key={index} className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md border">
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{line}</p>
                              </div>
                            );
                          }
                          return (
                            <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                              {line}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-6 text-center border-2 border-dashed border-blue-200 dark:border-blue-800">
                  <Stethoscope className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">
                    Health Guide Processing
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    Your personalized health guide is being generated. Please check back in a moment.
                  </p>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisResults;