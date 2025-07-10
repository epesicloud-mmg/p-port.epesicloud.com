import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, ArrowRight, Zap, Shield, Users, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Box className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">ModularDXP</span>
            </div>
            <Button asChild>
              <a href="/api/login">
                Get Started
                <ArrowRight size={16} className="ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Digital Experience Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Modern Digital
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Experiences
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create websites, portals, and applications with our modular, drag-and-drop platform.
            Built with React and Node.js for modern development teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <a href="/api/login">
                Start Building
                <ArrowRight size={20} className="ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From simple websites to complex enterprise portals, ModularDXP provides
              all the tools you need in one modern platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-primary" size={24} />
                </div>
                <CardTitle className="text-lg">Drag & Drop Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build pages visually with our intuitive drag-and-drop interface.
                  No coding required.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-accent" size={24} />
                </div>
                <CardTitle className="text-lg">Modular Portlets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Extend functionality with reusable React components.
                  Build once, use everywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-success" size={24} />
                </div>
                <CardTitle className="text-lg">Multi-Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize projects in workspaces. Perfect for teams,
                  agencies, and enterprises.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-warning" size={24} />
                </div>
                <CardTitle className="text-lg">Enterprise Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in security, scalability, and compliance features
                  for enterprise deployment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and organizations building the future
            of digital experiences with ModularDXP.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
            <a href="/api/login">
              Get Started Free
              <ArrowRight size={20} className="ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold">ModularDXP</span>
            </div>
            <div className="text-gray-400">
              © 2024 ModularDXP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
