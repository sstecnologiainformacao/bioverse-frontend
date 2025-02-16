'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setError('Credentials invalid');
      return;
    }

    const data = await res.json();
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-black">
      <Card className="w-96 border border-black">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="User" value={username} onChange={(e) => setUsername(e.target.value)} className="border-black" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-black" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleLogin} className="w-full border border-black text-black bg-white hover:bg-black hover:text-white">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
