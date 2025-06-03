import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const WordPressBackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'working' | 'error'>('checking');
  const [siteData, setSiteData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testBackend = async () => {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ generalSettings { title description } }'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.generalSettings) {
          setStatus('working');
          setSiteData(data.data.generalSettings);
        } else {
          setStatus('error');
          setError('No data returned');
        }
      } else {
        setStatus('error');
        setError(`Status: ${response.status}`);
      }
    } catch (err) {
      setStatus('error');
      setError('Connection failed');
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <Card className="w-full max-w-xl mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'working' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            <CardTitle className="text-lg">Headless WordPress</CardTitle>
          </div>
          {status === 'working' && <Badge className="bg-green-500">✅ Connected</Badge>}
          {status === 'error' && <Badge variant="destructive">❌ Offline</Badge>}
          {status === 'checking' && <Badge variant="secondary">⏳ Checking</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {siteData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="font-medium text-green-800">{siteData.title}</p>
              {siteData.description && (
                <p className="text-sm text-green-600">{siteData.description}</p>
              )}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Frontend: Netlify CDN ✅</span>
            <Button variant="outline" size="sm" onClick={testBackend}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordPressBackendStatus;
