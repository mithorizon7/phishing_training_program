import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare, Phone, Paperclip, Clock, Users, Hash } from "lucide-react";
import type { Scenario, MessageChannel } from "@shared/schema";

interface MessageListProps {
  scenarios: Scenario[];
  currentIndex: number;
  completedIds: string[];
  onSelectMessage: (index: number) => void;
  isLoading?: boolean;
}

function getChannelIcon(channel: MessageChannel) {
  switch (channel) {
    case "email": return Mail;
    case "sms": return MessageSquare;
    case "call": return Phone;
    case "teams": return Users;
    case "slack": return Hash;
    default: return Mail;
  }
}

function MessageRow({ 
  scenario, 
  isActive, 
  isCompleted,
  onClick 
}: { 
  scenario: Scenario; 
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const Icon = getChannelIcon(scenario.channel as MessageChannel);
  
  return (
    <div
      className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
        isActive 
          ? 'bg-primary/5 border-l-2 border-l-primary' 
          : 'hover-elevate'
      } ${isCompleted ? 'opacity-60' : ''}`}
      onClick={onClick}
      data-testid={`row-message-${scenario.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          scenario.channel === 'email' ? 'bg-primary/10 text-primary' :
          scenario.channel === 'sms' ? 'bg-chart-2/10 text-chart-2' :
          scenario.channel === 'call' ? 'bg-chart-3/10 text-chart-3' :
          scenario.channel === 'teams' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
          scenario.channel === 'slack' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
          'bg-chart-3/10 text-chart-3'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-sm truncate ${isCompleted ? '' : 'font-semibold'}`}>
              {scenario.senderName}
            </span>
            {scenario.hasAttachment && (
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">Done</Badge>
            )}
          </div>
          {scenario.subject && (
            <p className={`text-sm truncate ${isCompleted ? 'text-muted-foreground' : ''}`}>
              {scenario.subject}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {scenario.body.substring(0, 100)}...
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Clock className="w-3 h-3" />
          <span>{scenario.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ 
  scenarios, 
  currentIndex, 
  completedIds,
  onSelectMessage,
  isLoading 
}: MessageListProps) {
  const emailScenarios = scenarios.filter(s => s.channel === 'email');
  const smsScenarios = scenarios.filter(s => s.channel === 'sms');
  const callScenarios = scenarios.filter(s => s.channel === 'call');
  const teamsScenarios = scenarios.filter(s => s.channel === 'teams');
  const slackScenarios = scenarios.filter(s => s.channel === 'slack');

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  const currentScenario = scenarios[currentIndex];

  return (
    <Card className="flex flex-col h-full">
      <Tabs defaultValue="all" className="flex flex-col h-full">
        <div className="border-b px-2 sm:px-4 pt-4">
          <TabsList className="w-full flex flex-wrap gap-1">
            <TabsTrigger value="all" className="flex-1 min-w-fit" data-testid="tab-all">
              All ({scenarios.length})
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1 min-w-fit" data-testid="tab-email">
              <Mail className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{emailScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex-1 min-w-fit" data-testid="tab-sms">
              <MessageSquare className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{smsScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="call" className="flex-1 min-w-fit" data-testid="tab-call">
              <Phone className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{callScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 min-w-fit" data-testid="tab-teams">
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{teamsScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex-1 min-w-fit" data-testid="tab-slack">
              <Hash className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{slackScenarios.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto">
          <TabsContent value="all" className="m-0">
            {scenarios.length === 0 ? (
              <EmptyState />
            ) : (
              scenarios.map((scenario, index) => (
                <MessageRow
                  key={scenario.id}
                  scenario={scenario}
                  isActive={currentScenario?.id === scenario.id}
                  isCompleted={completedIds.includes(scenario.id)}
                  onClick={() => onSelectMessage(index)}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="email" className="m-0">
            {emailScenarios.length === 0 ? (
              <EmptyState channel="email" />
            ) : (
              emailScenarios.map((scenario) => {
                const index = scenarios.findIndex(s => s.id === scenario.id);
                return (
                  <MessageRow
                    key={scenario.id}
                    scenario={scenario}
                    isActive={currentScenario?.id === scenario.id}
                    isCompleted={completedIds.includes(scenario.id)}
                    onClick={() => onSelectMessage(index)}
                  />
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="sms" className="m-0">
            {smsScenarios.length === 0 ? (
              <EmptyState channel="sms" />
            ) : (
              smsScenarios.map((scenario) => {
                const index = scenarios.findIndex(s => s.id === scenario.id);
                return (
                  <MessageRow
                    key={scenario.id}
                    scenario={scenario}
                    isActive={currentScenario?.id === scenario.id}
                    isCompleted={completedIds.includes(scenario.id)}
                    onClick={() => onSelectMessage(index)}
                  />
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="call" className="m-0">
            {callScenarios.length === 0 ? (
              <EmptyState channel="call" />
            ) : (
              callScenarios.map((scenario) => {
                const index = scenarios.findIndex(s => s.id === scenario.id);
                return (
                  <MessageRow
                    key={scenario.id}
                    scenario={scenario}
                    isActive={currentScenario?.id === scenario.id}
                    isCompleted={completedIds.includes(scenario.id)}
                    onClick={() => onSelectMessage(index)}
                  />
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="teams" className="m-0">
            {teamsScenarios.length === 0 ? (
              <EmptyState channel="teams" />
            ) : (
              teamsScenarios.map((scenario) => {
                const index = scenarios.findIndex(s => s.id === scenario.id);
                return (
                  <MessageRow
                    key={scenario.id}
                    scenario={scenario}
                    isActive={currentScenario?.id === scenario.id}
                    isCompleted={completedIds.includes(scenario.id)}
                    onClick={() => onSelectMessage(index)}
                  />
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="slack" className="m-0">
            {slackScenarios.length === 0 ? (
              <EmptyState channel="slack" />
            ) : (
              slackScenarios.map((scenario) => {
                const index = scenarios.findIndex(s => s.id === scenario.id);
                return (
                  <MessageRow
                    key={scenario.id}
                    scenario={scenario}
                    isActive={currentScenario?.id === scenario.id}
                    isCompleted={completedIds.includes(scenario.id)}
                    onClick={() => onSelectMessage(index)}
                  />
                );
              })
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

function EmptyState({ channel }: { channel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Mail className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">
        {channel 
          ? `No ${channel} messages in this shift`
          : "No messages to process"
        }
      </p>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <Card className="h-full">
      <div className="border-b p-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
