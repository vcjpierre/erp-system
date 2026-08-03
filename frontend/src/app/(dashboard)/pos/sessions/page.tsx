"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Play, Square, Clock, DollarSign, History, User } from "lucide-react";

type SessionStatus = "active" | "closed";

type Session = {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt: string | null;
  status: SessionStatus;
  initialCash: number;
  totalSales: number;
  totalTransactions: number;
};

const MOCK_SESSIONS: Session[] = [
  {
    id: "SES-001",
    cashier: "Juan Pérez",
    openedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    closedAt: null,
    status: "active",
    initialCash: 500,
    totalSales: 3842.5,
    totalTransactions: 23,
  },
  {
    id: "SES-002",
    cashier: "María García",
    openedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    closedAt: new Date(Date.now() - 86400000 * 1 + 3600000 * 8).toISOString(),
    status: "closed",
    initialCash: 500,
    totalSales: 12560.0,
    totalTransactions: 67,
  },
  {
    id: "SES-003",
    cashier: "Carlos López",
    openedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    closedAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 7.5).toISOString(),
    status: "closed",
    initialCash: 500,
    totalSales: 8930.75,
    totalTransactions: 45,
  },
  {
    id: "SES-004",
    cashier: "Ana Martínez",
    openedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    closedAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 8).toISOString(),
    status: "closed",
    initialCash: 500,
    totalSales: 15230.25,
    totalTransactions: 81,
  },
];

export default function POSSessionsPage() {
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);

  const activeSessions = sessions.filter((s) => s.status === "active");
  const pastSessions = sessions.filter((s) => s.status === "closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">POS Sessions</h1>
          <p className="text-muted-foreground">Point of sale session management</p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          New Session
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Clock className="h-4 w-4" />
            Active
            {activeSessions.length > 0 && (
              <Badge variant="success" className="ml-1 px-1.5 text-[10px]">
                {activeSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <History className="h-4 w-4" />
            Past Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">No active sessions</p>
                <p className="text-xs">Open a new session to start selling</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <History className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">No past sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{pastSessions.length} session{pastSessions.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-4">
                {pastSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const isActive = session.status === "active";
  const duration = session.closedAt
    ? Math.round(
        (new Date(session.closedAt).getTime() - new Date(session.openedAt).getTime()) /
          3600000 *
          10,
      ) / 10
    : null;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{session.id}</h3>
              <Badge variant={isActive ? "success" : "secondary"}>
                <span
                  className={`mr-1 h-1.5 w-1.5 rounded-full ${
                    isActive ? "animate-pulse bg-green-500" : "bg-gray-400"
                  }`}
                />
                {isActive ? "Active" : "Closed"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {session.cashier}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Opened {formatDate(session.openedAt, "relative")}
              </div>
              {duration && (
                <div className="text-muted-foreground">
                  Duration: {duration}h
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums">
              {formatCurrency(session.totalSales)}
            </div>
            <div className="text-xs text-muted-foreground">
              {session.totalTransactions} transaction
              {session.totalTransactions !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>
              Initial cash: <span className="font-medium">{formatCurrency(session.initialCash)}</span>
            </span>
            {session.closedAt && (
              <span>
                Closed: {formatDate(session.closedAt, "short")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isActive ? (
              <>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Square className="h-3.5 w-3.5" />
                  Close
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm">
                View Report
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
