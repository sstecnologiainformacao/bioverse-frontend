'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuestionnairesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redireciona se não estiver logado
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questionnaires`);
        if (!res.ok) throw new Error('Fail to get the questionnaires');
        const data = await res.json();
        setQuestionnaires(data);
      } catch (err) {
        setError('Fail to get the questionnaires.');
      }
    };
    if (user) fetchQuestionnaires();
  }, [user]);

  if (loading) return <p className="text-center text-black">Loading...</p>;
  if (!user) return null;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-6">Wellcome, {user?.username}!</h1>
      <h2 className="text-xl font-semibold mb-4">Select one:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionnaires.map((q) => (
          <Card key={q.id} className="w-72 border border-black">
            <CardHeader>
              <CardTitle>{q.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push(`/questionnaires/${q.id}?username=${user.username}`)}
                className="w-full border border-black text-black bg-white hover:bg-black hover:text-white"
              >
                Start
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
