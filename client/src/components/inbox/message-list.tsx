import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare, Phone, Paperclip, Clock, Users, Hash } from "lucide-react";
import type { Scenario, MessageChannel } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface MessageListProps {
  scenarios: Scenario[];
  currentIndex: number;
  completedIds: string[];
  onSelectMessage: (index: number) => void;
  isLoading?: boolean;
  guidedMode?: boolean;
  recommendedIndex?: number;
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
  isLocked,
  isRecommended,
  onClick 
}: { 
  scenario: Scenario; 
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const Icon = getChannelIcon(scenario.channel as MessageChannel);
  
  return (
    <button
      type="button"
      className={`relative w-full p-4 border-b border-black/5 dark:border-white/10 last:border-b-0 text-left transition-all ${
        isActive 
          ? "bg-primary/10 before:content-[''] before:absolute before:left-2 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-primary/70"
          : isLocked
            ? "bg-background/30"
            : "hover:bg-background/60"
      } ${isCompleted ? 'opacity-60' : ''} ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      onClick={onClick}
      disabled={isLocked}
      data-testid={`row-message-${scenario.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
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
              <Badge variant="secondary" className="text-xs flex-shrink-0">{t("training.inbox.done")}</Badge>
            )}
            {!isCompleted && isRecommended && (
              <Badge variant="default" className="text-xs flex-shrink-0">{t("training.inbox.currentTask")}</Badge>
            )}
            {!isCompleted && !isRecommended && isLocked && (
              <Badge variant="outline" className="text-xs flex-shrink-0">{t("training.inbox.upNext")}</Badge>
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
    </button>
  );
}

export function MessageList({ 
  scenarios, 
  currentIndex, 
  completedIds,
  onSelectMessage,
  isLoading,
  guidedMode = false,
  recommendedIndex = 0,
}: MessageListProps) {
  const { t } = useTranslation();
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
    <Card className="flex flex-col h-full border border-black/5 dark:border-white/10 bg-card/60 overflow-hidden">
      <Tabs defaultValue="all" className="flex flex-col h-full">
        <div className="border-b border-black/5 dark:border-white/10 px-2 sm:px-4 pt-4">
          <TabsList className="w-full flex flex-wrap gap-1 rounded-full border border-black/5 dark:border-white/10 bg-background/60 p-1 h-auto">
            <TabsTrigger value="all" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-all">
              {t("training.inbox.all")} ({scenarios.length})
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-email">
              <Mail className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{emailScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-sms">
              <MessageSquare className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{smsScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="call" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-call">
              <Phone className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{callScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-teams">
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{teamsScenarios.length}</span>
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex-1 min-w-fit rounded-full text-xs font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-[0_10px_20px_-16px_hsl(var(--primary)/0.6)]" data-testid="tab-slack">
              <Hash className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{slackScenarios.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {guidedMode && (
          <div className="border-b border-black/5 dark:border-white/10 bg-primary/5 px-4 py-3">
            <p className="text-sm font-medium">{t("training.inbox.guidedTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("training.inbox.guidedSubtitle")}</p>
          </div>
        )}
        
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
                  isLocked={guidedMode && index !== recommendedIndex}
                  isRecommended={guidedMode && index === recommendedIndex}
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
                    isLocked={guidedMode && index !== recommendedIndex}
                    isRecommended={guidedMode && index === recommendedIndex}
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
                    isLocked={guidedMode && index !== recommendedIndex}
                    isRecommended={guidedMode && index === recommendedIndex}
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
                    isLocked={guidedMode && index !== recommendedIndex}
                    isRecommended={guidedMode && index === recommendedIndex}
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
                    isLocked={guidedMode && index !== recommendedIndex}
                    isRecommended={guidedMode && index === recommendedIndex}
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
                    isLocked={guidedMode && index !== recommendedIndex}
                    isRecommended={guidedMode && index === recommendedIndex}
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

function EmptyState({ channel }: { channel?: MessageChannel }) {
  const { t } = useTranslation();
  const channelLabel = channel ? t(`channels.${channel}`) : "";
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Mail className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">
        {channel 
          ? t("training.inbox.emptyChannel", { channel: channelLabel })
          : t("training.inbox.emptyAll")
        }
      </p>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <Card className="h-full border border-black/5 dark:border-white/10 bg-card/60 overflow-hidden">
      <div className="border-b border-black/5 dark:border-white/10 p-4">
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
