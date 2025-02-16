"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserResponsesPage() {
  const params = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.username}`);
        const data = await res.json();
        const groupByDate = {};
        data.map((response: { createdAt: string}) => {
            const { createdAt } = response;
            const formmated = new Date(createdAt).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            let group: unknown = groupByDate[formmated] || { date: formmated, items: []};
            group = {...group, items: [...group.items,response]};
            groupByDate[formmated] = {...group };
        });
        setResponses(groupByDate);
      } catch (error) {
        console.error("Fail to load the answers:", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchResponses();
  }, [params.username]);

  if (loadingData) return <p className="text-center mt-10">Loading answers...</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-black p-10">
      <Card className="w-full max-w-3xl border border-black">
        <CardHeader>
          <CardTitle className="text-center">Answers of {params.username}</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-center text-gray-500">No answer found.</p>
          ) : (
                Object.entries(responses).map(([key, value]) => (
                    <CardContent>
                        <p className="text-center text-gray-500">{key}</p>
                        {value.items.map((response, index) => (
                            <div key={index} className="border-b border-black pb-4 mb-4">
                                <p className="font-bold">{response.questionnaire.name}</p>
                                <p className="text-sm text-gray-700">{response.question.question.question}</p>
                                <p className="mt-1 text-black font-semibold">Answer: {typeof response.answer === "object" ? JSON.stringify(response.answer) : response.answer}</p>
                            </div>
                        ))}
                    </CardContent>
                ))
          )}
          <div className="mt-6">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full border border-black text-black bg-white hover:bg-black hover:text-white"
            >
              Back to painel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
