import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Mail,
  MessageSquare,
  Phone,
  Paperclip,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  AlertTriangle,
  Trash2,
  CheckCircle,
  ArrowRight,
  QrCode,
  User,
  Hash,
  Users,
  MessageCircle,
  Search,
  Clock,
  Target
} from "lucide-react";
import type { Scenario, ActionType, MessageChannel } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface LensCheck {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}

const LENS_CHECKS: LensCheck[] = [
  { id: "sender", labelKey: "training.lensTool.checks.sender.label", descriptionKey: "training.lensTool.checks.sender.description", icon: User },
  { id: "links", labelKey: "training.lensTool.checks.links.label", descriptionKey: "training.lensTool.checks.links.description", icon: LinkIcon },
  { id: "urgency", labelKey: "training.lensTool.checks.urgency.label", descriptionKey: "training.lensTool.checks.urgency.description", icon: Clock },
  { id: "request", labelKey: "training.lensTool.checks.request.label", descriptionKey: "training.lensTool.checks.request.description", icon: Target },
  { id: "context", labelKey: "training.lensTool.checks.context.label", descriptionKey: "training.lensTool.checks.context.description", icon: Search },
];

interface MessageDetailProps {
  scenario: Scenario | null;
  verificationsRemaining: number;
  onAction: (action: ActionType) => void;
  disabled?: boolean;
  lensChecks?: Set<string>;
  onLensCheck?: (checkId: string, checked: boolean) => void;
  requiredLensChecks?: number;
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

function getChannelLabel(channel: MessageChannel, t: (key: string) => string) {
  switch (channel) {
    case "email": return t("training.message.channelLabel.email");
    case "sms": return t("training.message.channelLabel.sms");
    case "call": return t("training.message.channelLabel.call");
    case "teams": return t("training.message.channelLabel.teams");
    case "slack": return t("training.message.channelLabel.slack");
    default: return t("training.message.channelLabel.default");
  }
}

export function MessageDetail({ 
  scenario, 
  verificationsRemaining,
  onAction,
  disabled,
  lensChecks = new Set(),
  onLensCheck,
  requiredLensChecks = 0,
}: MessageDetailProps) {
  const { t } = useTranslation();
  const [showRealSender, setShowRealSender] = useState(false);
  const [showLinkTarget, setShowLinkTarget] = useState(false);

  const handleToggleSenderReveal = () => {
    setShowRealSender((previous) => {
      const next = !previous;
      if (next && onLensCheck) {
        onLensCheck("sender", true);
      }
      return next;
    });
  };

  const handleToggleLinkReveal = () => {
    setShowLinkTarget((previous) => {
      const next = !previous;
      if (next && onLensCheck) {
        onLensCheck("links", true);
      }
      return next;
    });
  };

  useEffect(() => {
    setShowRealSender(false);
    setShowLinkTarget(false);
  }, [scenario?.id]);
  
  const lensProgress = (lensChecks.size / LENS_CHECKS.length) * 100;
  const lensComplete = lensChecks.size >= 3;
  const actionLockedByChecklist = requiredLensChecks > 0 && lensChecks.size < requiredLensChecks;
  const actionDisabled = Boolean(disabled) || actionLockedByChecklist;

  if (!scenario) {
    return (
      <Card className="flex flex-col h-full border border-black/5 dark:border-white/10 bg-card/60">
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <Mail className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">{t("training.message.selectTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("training.message.selectSubtitle")}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const senderIdentifierLabel = scenario.senderEmail?.includes("@")
    ? t("training.message.senderIdentifier.email")
    : t("training.message.senderIdentifier.generic");

  const Icon = getChannelIcon(scenario.channel as MessageChannel);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <Card className="flex flex-col min-h-0 border border-black/5 dark:border-white/10 bg-card/70 overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              scenario.channel === 'email' ? 'bg-primary/10 text-primary' :
              scenario.channel === 'sms' ? 'bg-chart-2/10 text-chart-2' :
              scenario.channel === 'call' ? 'bg-chart-3/10 text-chart-3' :
              scenario.channel === 'teams' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
              scenario.channel === 'slack' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
              'bg-chart-3/10 text-chart-3'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[0.65rem]">
                  {getChannelLabel(scenario.channel as MessageChannel, t)}
                </Badge>
                <span className="text-xs text-muted-foreground">{scenario.timestamp}</span>
              </div>
              <h2 className="font-semibold text-lg" data-testid="text-sender-name">
                {scenario.senderName}
              </h2>
              {scenario.subject && (
                <p className="text-muted-foreground" data-testid="text-subject">
                  {scenario.subject}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="py-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap"
            data-testid="text-message-body"
          >
            {scenario.body}
          </div>
          
              {scenario.hasAttachment && scenario.attachmentName && (
            <div className="mt-6 p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-background/60 flex items-center gap-3">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{scenario.attachmentName}</p>
                <p className="text-xs text-muted-foreground">{t("training.message.attachment")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-black/5 dark:border-white/10 bg-card/60">
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {t("training.message.inspectionPanel")}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion type="multiple" className="w-full">
            {(scenario.senderEmail || scenario.senderPhone) && (
              <AccordionItem value="sender">
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("training.message.senderDetails")}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{t("training.message.displayName")}:</span>
                      <span className="font-medium">{scenario.senderName}</span>
                    </div>
                    {scenario.senderEmail && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{senderIdentifierLabel}:</span>
                        <div className="flex items-center gap-2">
                          {showRealSender ? (
                            <code className="text-xs bg-background/60 border border-black/5 dark:border-white/10 px-2 py-1 rounded font-mono">
                              {scenario.senderEmail}
                            </code>
                          ) : (
                            <span className="text-muted-foreground italic">{t("training.message.hidden")}</span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleToggleSenderReveal}
                            data-testid="button-reveal-sender"
                          >
                            {showRealSender ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {scenario.senderPhone && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{t("training.message.phoneNumber")}:</span>
                        <code className="text-xs bg-background/60 border border-black/5 dark:border-white/10 px-2 py-1 rounded font-mono">
                          {scenario.senderPhone}
                        </code>
                      </div>
                    )}
                    {scenario.replyTo && scenario.replyTo !== scenario.senderEmail && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{t("training.message.replyTo")}:</span>
                        <code className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded font-mono">
                          {scenario.replyTo}
                        </code>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {scenario.linkUrl && (
              <AccordionItem value="links">
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    {t("training.message.linkAnalysis")}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    {scenario.linkText && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{t("training.message.linkText")}:</span>
                        <span className="text-primary underline">{scenario.linkText}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{t("training.message.actualUrl")}:</span>
                      <div className="flex items-center gap-2">
                        {showLinkTarget ? (
                          <code className="text-xs bg-background/60 border border-black/5 dark:border-white/10 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                            {scenario.linkUrl}
                          </code>
                        ) : (
                          <span className="text-muted-foreground italic">{t("training.message.hidden")}</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleToggleLinkReveal}
                          data-testid="button-reveal-link"
                        >
                          {showLinkTarget ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {scenario.qrCodeUrl && (
              <AccordionItem value="qr">
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    {t("training.message.qrAnalysis")}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive mb-2 font-medium">
                        {t("training.message.qrWarning")}
                      </p>
                      <code className="text-xs font-mono break-all">
                        {scenario.qrCodeUrl}
                      </code>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {onLensCheck && (
        <Card className={`flex-shrink-0 transition-colors bg-card/60 ${lensComplete ? 'border-chart-2/50' : 'border-amber-500/50'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t("training.lensTool.title")}
                <Badge variant={lensComplete ? "default" : "secondary"} className="text-xs">
                  {lensChecks.size}/{LENS_CHECKS.length}
                </Badge>
              </h3>
              {!lensComplete && (
                <span className="text-xs text-amber-600 dark:text-amber-400">{t("training.lensTool.subtitle")}</span>
              )}
            </div>
            <Progress value={lensProgress} className="h-1.5 mt-2" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {LENS_CHECKS.map((check) => {
                const Icon = check.icon;
                const isChecked = lensChecks.has(check.id);
                return (
                  <div 
                    key={check.id}
                    className={`flex items-start gap-2 p-3 rounded-xl border border-black/5 dark:border-white/10 cursor-pointer transition-all ${
                      isChecked ? 'bg-chart-2/10 border-chart-2/40' : 'bg-background/60 hover:bg-background/80'
                    }`}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onClick={() => onLensCheck(check.id, !isChecked)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onLensCheck(check.id, !isChecked);
                      }
                    }}
                    data-testid={`lens-check-${check.id}`}
                  >
                    <Checkbox 
                      checked={isChecked}
                      className="mt-0.5 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{t(check.labelKey)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t(check.descriptionKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-shrink-0 border border-black/5 dark:border-white/10 bg-card/60">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-sm text-muted-foreground">{t("training.actions.prompt")}</p>
            <Badge variant="outline" className="text-xs">
              {t("training.actions.verificationsLeft", { count: verificationsRemaining })}
            </Badge>
          </div>
          {actionLockedByChecklist && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
              {t("training.actions.unlockHint", { count: requiredLensChecks })}
            </p>
          )}
          {requiredLensChecks > 0 && (
            <div className="grid sm:grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{t("training.actions.report")}:</span>{" "}
                {t("training.actions.reportDescription")}
              </p>
              <p>
                <span className="font-medium text-foreground">{t("training.actions.verify")}:</span>{" "}
                {t("training.actions.verifyDescription")}
              </p>
              <p>
                <span className="font-medium text-foreground">{t("training.actions.delete")}:</span>{" "}
                {t("training.actions.deleteDescription")}
              </p>
              <p>
                <span className="font-medium text-foreground">{t("training.actions.proceed")}:</span>{" "}
                {t("training.actions.proceedDescription")}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={() => onAction("report")}
              disabled={actionDisabled}
              data-testid="button-action-report"
            >
              <Shield className="w-4 h-4 mr-2" />
              {t("training.actions.report")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onAction("delete")}
              disabled={actionDisabled}
              data-testid="button-action-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("training.actions.delete")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onAction("verify")}
              disabled={actionDisabled || verificationsRemaining <= 0}
              data-testid="button-action-verify"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("training.actions.verify")}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => onAction("proceed")}
              disabled={actionDisabled}
              data-testid="button-action-proceed"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {t("training.actions.proceed")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
