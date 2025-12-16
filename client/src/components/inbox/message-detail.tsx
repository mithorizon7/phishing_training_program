import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  User
} from "lucide-react";
import type { Scenario, ActionType, MessageChannel } from "@shared/schema";

interface MessageDetailProps {
  scenario: Scenario | null;
  verificationsRemaining: number;
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

function getChannelIcon(channel: MessageChannel) {
  switch (channel) {
    case "email": return Mail;
    case "sms": return MessageSquare;
    case "call": return Phone;
  }
}

function getChannelLabel(channel: MessageChannel) {
  switch (channel) {
    case "email": return "Email";
    case "sms": return "SMS Message";
    case "call": return "Call Transcript";
  }
}

export function MessageDetail({ 
  scenario, 
  verificationsRemaining,
  onAction,
  disabled 
}: MessageDetailProps) {
  const [showRealSender, setShowRealSender] = useState(false);
  const [showLinkTarget, setShowLinkTarget] = useState(false);

  if (!scenario) {
    return (
      <Card className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <Mail className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">Select a Message</h3>
            <p className="text-sm text-muted-foreground">
              Choose a message from the inbox to review
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const Icon = getChannelIcon(scenario.channel as MessageChannel);

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              scenario.channel === 'email' ? 'bg-primary/10 text-primary' :
              scenario.channel === 'sms' ? 'bg-chart-2/10 text-chart-2' :
              'bg-chart-3/10 text-chart-3'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {getChannelLabel(scenario.channel as MessageChannel)}
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
        
        <CardContent className="flex-1 overflow-auto py-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap"
            data-testid="text-message-body"
          >
            {scenario.body}
          </div>
          
          {scenario.hasAttachment && scenario.attachmentName && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 flex items-center gap-3">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{scenario.attachmentName}</p>
                <p className="text-xs text-muted-foreground">Attachment</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Inspection Panel
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion type="multiple" className="w-full">
            {scenario.senderEmail && (
              <AccordionItem value="sender">
                <AccordionTrigger className="text-sm py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sender Details
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Display Name:</span>
                      <span className="font-medium">{scenario.senderName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Email Address:</span>
                      <div className="flex items-center gap-2">
                        {showRealSender ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {scenario.senderEmail}
                          </code>
                        ) : (
                          <span className="text-muted-foreground italic">Hidden</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowRealSender(!showRealSender)}
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
                    {scenario.replyTo && scenario.replyTo !== scenario.senderEmail && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Reply-To:</span>
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
                    Link Analysis
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    {scenario.linkText && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Link Text:</span>
                        <span className="text-primary underline">{scenario.linkText}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Actual URL:</span>
                      <div className="flex items-center gap-2">
                        {showLinkTarget ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono max-w-[200px] truncate">
                            {scenario.linkUrl}
                          </code>
                        ) : (
                          <span className="text-muted-foreground italic">Hidden</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowLinkTarget(!showLinkTarget)}
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
                    QR Code Analysis
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive mb-2 font-medium">
                        QR codes are links you cannot easily preview
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

      <Card className="flex-shrink-0">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-sm text-muted-foreground">What action will you take?</p>
            <Badge variant="outline" className="text-xs">
              {verificationsRemaining} verifications left
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="default"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => onAction("report")}
              disabled={disabled}
              data-testid="button-action-report"
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Report</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => onAction("delete")}
              disabled={disabled}
              data-testid="button-action-delete"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-xs">Delete</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => onAction("verify")}
              disabled={disabled || verificationsRemaining <= 0}
              data-testid="button-action-verify"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-xs">Verify</span>
            </Button>
            <Button
              variant="destructive"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => onAction("proceed")}
              disabled={disabled}
              data-testid="button-action-proceed"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-xs">Proceed</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
