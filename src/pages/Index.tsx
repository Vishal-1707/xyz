import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Brain, Shield, FileText, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">MediSync AI</h1>
                <p className="text-sm text-muted-foreground">Report Analytics & Virtual Care</p>
              </div>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Healthcare Analytics
          </Badge>
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Transform Your Medical Reports with 
            <span className="text-primary"> AI Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Upload your lab reports and get instant AI-powered analysis, predictions, and insights. 
            Secure, accurate, and designed for your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Start Free Analysis
            </Button>
            <Button size="lg" variant="outline">
              Learn How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold tracking-tight mb-4">
            Powerful Features for Better Health Insights
          </h3>
          <p className="text-lg text-muted-foreground">
            Everything you need to understand and track your health data
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Report Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Advanced AI analyzes your lab reports and highlights normal vs abnormal values 
                with clear, easy-to-understand explanations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Health Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get AI-powered predictions about potential health issues and receive 
                personalized recommendations for preventive care.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your medical data is encrypted and secure. Each user has a unique ID 
                ensuring complete privacy and data protection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multiple Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Upload PDFs, images, or data files. Our AI can process various 
                report formats from different labs and healthcare providers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track your health journey with an intuitive dashboard showing 
                analysis history, trends, and actionable insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Virtual Care Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Seamlessly share your analyzed reports with healthcare providers 
                for better virtual consultations and care coordination.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="text-center p-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">
              Ready to Transform Your Health Data?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of users who trust MediSync AI for their health insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started Now - It's Free
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Secure by design • HIPAA compliant
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-semibold">MediSync AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MediSync AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
