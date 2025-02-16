"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface iQuestion {
  id: number,
  question: {
    question: {
      question: string;
      type: string;
      options: Array<string>
    }
  }
};

export default function QuestionnairePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loading } = useAuth() || { user: { role: null, username: null }, loading: false };
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = user?.username || searchParams.get("username");

  const [name, setName] = useState<string>()
  const [questions, setQuestions] = useState<iQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: unknown }>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!username) return;
      
      setLoadingData(true);
      try {
        // Buscar o questionário e suas perguntas
        const resQuestions = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questionnaires/${id}`);
        const dataQuestions = await resQuestions.json();
        setName(dataQuestions.name);
        setQuestions(dataQuestions.questions);

        const resAnswers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/responses/${username}/${id}`);
        const dataAnswers = await resAnswers.json();

        const formattedAnswers = dataAnswers.reduce((acc: unknown, response: unknown) => {
          //@ts-expect-error: mapping the answers
          acc[response.question.id] = response.answer;
          return acc;
        }, {});

        setAnswers(formattedAnswers);
      } catch (error) {
        console.error("Fail to load the questionnaires:", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [id, username]);

  const handleAnswerChange = (questionId: number, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!username) return;

    const payload = {
      username,
      questionnaireId: Number(params.id),
      responses: Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      })),
    };

    console.log(payload);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.push("/questionnaires");
    } catch (error) {
      console.error("Fail to send answers:", error);
    }
  };

  if (loadingData) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <Card className="w-full max-w-2xl border border-black p-6">
        <CardHeader>
          <CardTitle className="text-center">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-gray-500">No questions.</p>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id}>
                  <p className="font-semibold">{question.question.question.question}</p>
                  {question.question.question.type === "mcq" ? (
                    <RadioGroup
                      value={answers[question.id] as string || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      {question.question.question.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
                          <label htmlFor={`option-${question.id}-${index}`} className="text-sm">{option}</label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      type="text"
                      value={answers[question.id] as string || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="border-black"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              className="w-full border border-black text-black bg-white hover:bg-black hover:text-white"
            >
              Finish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
