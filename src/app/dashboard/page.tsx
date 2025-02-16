"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, loading } = useAuth() || { user: { role: null }, loading: false };
  const router = useRouter();
  const [users, setUsers] = useState<{ username: string; completedQuestionnaires: number }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Fail to load the users:", error);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  if (loadingUsers) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-black p-10">
      <Card className="w-full max-w-3xl border border-black">
        <CardHeader>
          <CardTitle className="text-center">Administrative Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Completed Questionnaires</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No users have answered any surveys yet.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.completedQuestionnaires}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/dashboard/${user.username}`)}
                        className="border border-black text-black bg-white hover:bg-black hover:text-white"
                      >
                        See
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
