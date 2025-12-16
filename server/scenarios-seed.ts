import type { InsertScenario } from "@shared/schema";
import { calculateNISTDifficulty } from "@shared/nist-phish-scale";

// Helper type for scenarios without calculated difficulty
type ScenarioWithoutDifficulty = Omit<InsertScenario, 'difficultyScore'>;

// Raw scenarios before difficulty calculation
const rawScenarios: ScenarioWithoutDifficulty[] = [
  // Classic credential phishing (easy)
  {
    channel: "email",
    senderName: "IT Security Team",
    senderEmail: "security@company-support.net",
    replyTo: "security@company-support.net",
    subject: "URGENT: Your account will be suspended in 24 hours",
    body: `Dear Employee,

We have detected unusual activity on your corporate account. Your access will be suspended within 24 hours unless you verify your identity immediately.

Click here to verify your account: https://company-login.secure-verify.com/auth

This is an automated security measure. Failure to comply will result in permanent account suspension.

Thank you for your prompt attention to this matter.

IT Security Team`,
    timestamp: "2 hours ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["urgent language", "threat of suspension", "suspicious domain", "generic greeting"],
    correctAction: "report",
    explanation: "This is a classic phishing email using urgency and fear to pressure you into clicking. The domain 'company-support.net' is not your actual company domain, and the link goes to 'secure-verify.com' which is a common phishing pattern. Legitimate IT security teams will never threaten immediate account suspension via email.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://company-login.secure-verify.com/auth",
    linkText: "Click here to verify your account",
  },

  // BEC gift card scam (harder, no link)
  {
    channel: "email",
    senderName: "Dr. Amanda Peterson (CEO)",
    senderEmail: "amanda.peterson@company-mail.org",
    replyTo: "amandap.ceo@gmail.com",
    subject: "Quick favor needed - confidential",
    body: `Hi,

I need your help with something urgent and confidential. I'm stuck in back-to-back meetings all day and can't make a call right now.

I need you to purchase 10 Amazon gift cards ($100 each) for a client appreciation surprise. This needs to happen today before 5pm.

Please buy them, scratch off the back to reveal the codes, and text me photos of the codes at 555-0199. I'll reimburse you from petty cash tomorrow.

Keep this between us - it's a surprise!

Thanks,
Amanda

Sent from my iPhone`,
    timestamp: "45 minutes ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "payment_fraud",
    cues: ["unusual request", "urgency", "gift cards", "text codes to personal number", "keep it secret", "reply-to mismatch", "fake CEO"],
    correctAction: "verify",
    explanation: "This is a Business Email Compromise (BEC) attack. The CEO would never ask for gift cards via email, especially to be texted to a personal number. The reply-to address goes to a personal Gmail account, not the corporate domain. Always verify unusual financial requests through a known channel - call the person's office number directly.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Legitimate IT notification
  {
    channel: "email",
    senderName: "IT Department",
    senderEmail: "it-notifications@yourcompany.com",
    subject: "Scheduled system maintenance - Saturday 2am-6am",
    body: `Hello,

This is a reminder that scheduled system maintenance will occur this Saturday from 2:00 AM to 6:00 AM EST.

During this time, the following systems will be unavailable:
- Email (Outlook/Exchange)
- VPN access
- Internal file shares

No action is required on your part. Systems will be restored by 6:00 AM.

If you have questions, please contact the IT Help Desk at extension 4357 or visit the IT portal at https://intranet.yourcompany.com/it-support.

Thank you for your patience.

IT Operations Team`,
    timestamp: "Yesterday",
    legitimacy: "legitimate",
    riskType: "none",
    cues: [],
    correctAction: "delete",
    explanation: "This is a legitimate system maintenance notification from IT. The sender email matches your company domain, there's no urgent action required, no suspicious links (the intranet link is internal), and it provides a known contact method (extension 4357) for questions. Safe to delete or archive.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://intranet.yourcompany.com/it-support",
    linkText: "IT portal",
  },

  // Spoofing attack - domain lookalike
  {
    channel: "email",
    senderName: "Accounts Payable",
    senderEmail: "invoices@yourcompany-billing.com",
    subject: "Invoice #INV-2024-8847 - Payment Required",
    body: `Dear Finance Team,

Please find attached the invoice for consulting services rendered in November.

Amount Due: $12,450.00
Due Date: December 20, 2024

Wire transfer details have been updated. Please use the following new banking information:

Bank: First National Trust
Account: 847291038
Routing: 021000089

Please process payment by end of business today to avoid late fees.

Best regards,
Accounts Payable Department`,
    timestamp: "3 hours ago",
    legitimacy: "malicious",
    attackFamily: "spoofing",
    riskType: "payment_fraud",
    cues: ["lookalike domain", "updated banking info", "wire transfer urgency", "end of day deadline"],
    correctAction: "verify",
    explanation: "This is a spoofing attack using a lookalike domain. 'yourcompany-billing.com' is NOT the same as 'yourcompany.com'. The request to update banking information for wire transfers is a major red flag. Attackers often intercept legitimate invoice conversations and insert new banking details. Always verify banking changes through a known phone number, never through email.",
    userRole: "finance",
    hasAttachment: true,
    attachmentName: "Invoice_INV-2024-8847.pdf",
  },

  // Smishing - package delivery
  {
    channel: "sms",
    senderName: "Unknown",
    senderPhone: "+1-555-0147",
    body: `UPS: Your package is waiting for delivery. There's a $2.99 redelivery fee due to address issues. Pay now to schedule: bit.ly/ups-redeliver-fee`,
    timestamp: "1 hour ago",
    legitimacy: "malicious",
    attackFamily: "smishing",
    riskType: "credential_theft",
    cues: ["unsolicited text", "small fee request", "shortened URL", "urgency"],
    correctAction: "delete",
    explanation: "This is a smishing (SMS phishing) attack. UPS does not send texts requesting small fees via shortened URLs. The small amount ($2.99) is designed to seem harmless, but the link will steal your payment information. Legitimate delivery companies contact you through their official apps or your account on their website.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://bit.ly/ups-redeliver-fee",
    linkText: "bit.ly/ups-redeliver-fee",
  },

  // Wrong number scam - start
  {
    channel: "sms",
    senderName: "Unknown",
    senderPhone: "+1-555-0198",
    body: `Hey! It's Sarah from the conference last week. Did you get home okay? Let me know if you want to grab coffee sometime and catch up!`,
    timestamp: "30 minutes ago",
    legitimacy: "malicious",
    attackFamily: "wrong_number",
    riskType: "data_leakage",
    cues: ["wrong number pretense", "overly familiar", "vague reference"],
    correctAction: "delete",
    explanation: "This is the beginning of a 'wrong number' scam. The attacker pretends to have the wrong number, but if you respond, they'll engage in friendly conversation before eventually pivoting to investment scams (often cryptocurrency) or romance fraud. Never engage with unsolicited messages from unknown numbers, even if they seem friendly.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Legitimate vendor invoice
  {
    channel: "email",
    senderName: "QuickBooks Payments",
    senderEmail: "noreply@intuit.com",
    subject: "Invoice from ABC Consulting Services",
    body: `You've received an invoice from ABC Consulting Services.

Invoice #: 1847
Amount due: $3,200.00
Due date: December 28, 2024

View and pay this invoice: https://app.qbo.intuit.com/invoice/v4/123456789

This invoice was sent from ABC Consulting Services using QuickBooks.

Questions about this invoice? Contact ABC Consulting directly.

Intuit QuickBooks
Menlo Park, CA`,
    timestamp: "Yesterday",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "verify",
    explanation: "This appears to be a legitimate QuickBooks invoice notification. However, invoice emails are commonly spoofed. The best practice is to verify: Do you have an active relationship with ABC Consulting? Was this invoice expected? If unsure, log into QuickBooks directly (not through the email link) or contact your accounts payable team to confirm.",
    userRole: "finance",
    hasAttachment: false,
    linkUrl: "https://app.qbo.intuit.com/invoice/v4/123456789",
    linkText: "View and pay this invoice",
  },

  // Tech support vishing
  {
    channel: "call",
    senderName: "Microsoft Support",
    senderPhone: "+1-800-555-0123",
    body: `[CALL TRANSCRIPT]

Caller: "Hello, this is Mike from Microsoft Technical Support. We've detected critical security threats on your computer that need immediate attention. Our security monitoring system shows your device has been compromised by malware."

"I need you to go to your computer right now. Don't worry, I'll walk you through fixing this. First, press the Windows key and R at the same time..."

"Now type in 'eventvwr' and tell me what errors you see. Those red warnings are the malware infections I was telling you about."

"To remove these threats, I'll need you to download our support tool from TeamViewer.com so I can access your computer remotely and clean it up for you."`,
    timestamp: "10 minutes ago",
    legitimacy: "malicious",
    attackFamily: "vishing",
    riskType: "account_takeover",
    cues: ["unsolicited tech support call", "claims of detected threats", "requests remote access", "urgency and fear", "Microsoft doesn't call you"],
    correctAction: "report",
    explanation: "This is a tech support scam (vishing). Microsoft never makes unsolicited calls about computer problems. The 'errors' in Event Viewer are normal system logs, not malware. The goal is to get remote access to your computer to install actual malware or steal information. Hang up immediately and report the number.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Password reset phishing (well-crafted)
  {
    channel: "email",
    senderName: "Microsoft 365",
    senderEmail: "no-reply@microsoft365.net",
    subject: "Action required: Unusual sign-in activity",
    body: `Microsoft 365

Unusual sign-in activity

We detected something unusual about a recent sign-in to your Microsoft account.

Sign-in details:
Country/region: Russia
IP address: 185.159.82.xxx
Date: December 15, 2024 3:47 AM
Platform: Windows
Browser: Chrome

If this was you, you can ignore this message.

If this wasn't you, please secure your account:

[Secure my account]

Thanks,
The Microsoft account team

This is an automated message. Please do not reply.`,
    timestamp: "4 hours ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["suspicious domain microsoft365.net", "foreign sign-in claim", "fear of account compromise", "secure account button"],
    correctAction: "report",
    explanation: "This is a sophisticated phishing email. While it looks professional, the sender domain 'microsoft365.net' is NOT owned by Microsoft (they use 'microsoft.com'). The email creates fear about a Russian sign-in to pressure you into clicking. If you're concerned about your account, go directly to account.microsoft.com - never click email links.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://microsoft365-security.com/verify",
    linkText: "Secure my account",
  },

  // Legitimate HR communication
  {
    channel: "email",
    senderName: "HR Benefits Team",
    senderEmail: "benefits@yourcompany.com",
    subject: "Open Enrollment Reminder - Deadline Friday",
    body: `Dear Team Member,

This is a friendly reminder that open enrollment for 2025 benefits ends this Friday, December 20th at 11:59 PM.

If you haven't made your selections yet, please log into the benefits portal to review your options:
- Medical, dental, and vision plans
- Life insurance
- 401(k) contribution changes
- FSA/HSA elections

To make changes: Log into Workday > Benefits > Open Enrollment

If you have questions, please contact the Benefits team:
- Email: benefits@yourcompany.com
- Phone: ext. 2847
- Office hours: Mon-Fri 9am-5pm in Building A, Room 204

If you don't make any changes, your current elections will roll over (except FSA, which requires annual re-enrollment).

Best regards,
HR Benefits Team`,
    timestamp: "1 day ago",
    legitimacy: "legitimate",
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate HR communication about open enrollment. The sender email matches your company domain, it references internal systems (Workday) correctly, provides multiple verified contact methods (extension number, physical office location), and the request aligns with normal annual HR processes. Safe to proceed with accessing Workday directly.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Urgent wire transfer BEC
  {
    channel: "email",
    senderName: "Robert Chen - CFO",
    senderEmail: "r.chen@yourcompany.com",
    replyTo: "robert.chen.cfo@outlook.com",
    subject: "Confidential - Urgent wire needed",
    body: `I need you to process an urgent wire transfer for an acquisition we're closing today. This is highly confidential - do not discuss with anyone else on the team.

Amount: $47,500
Beneficiary: Atlas Consulting Group
Bank: Chase Bank
Account: 829174650
Routing: 021000021

The deal must close by 4pm EST or we lose the opportunity. Please confirm once sent.

I'm in meetings all afternoon so email is best.

Robert Chen
Chief Financial Officer`,
    timestamp: "1 hour ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "payment_fraud",
    cues: ["urgent wire request", "confidential pressure", "reply-to mismatch", "unavailable for calls", "acquisition pretext"],
    correctAction: "verify",
    explanation: "This is a Business Email Compromise (BEC) attack targeting wire fraud. Red flags: The reply-to address goes to a personal Outlook account, not the corporate email. The 'confidential' framing prevents you from checking with others. The CFO being unavailable for calls is suspicious. Always verify large wire transfers by calling the executive's known office number, never by replying to the email.",
    userRole: "finance",
    hasAttachment: false,
  },

  // QR code phishing
  {
    channel: "email",
    senderName: "Parking Services",
    senderEmail: "parking@campus-services.org",
    subject: "Updated Parking Registration Required",
    body: `CAMPUS PARKING NOTICE

All employees must re-register their vehicles by December 31, 2024 using our new digital system.

Scan the QR code below with your phone to complete registration:

[QR CODE IMAGE]

Registration takes only 2 minutes and requires:
- Vehicle information
- License plate number
- Payment method for 2025 permit

Failure to register may result in parking citations starting January 1, 2025.

Campus Parking Services`,
    timestamp: "2 days ago",
    legitimacy: "malicious",
    attackFamily: "qr_phishing",
    riskType: "credential_theft",
    cues: ["unfamiliar sender domain", "QR code", "deadline pressure", "requests payment info"],
    correctAction: "report",
    explanation: "This is QR code phishing ('quishing'). QR codes are essentially links you cannot preview before scanning. The sender domain 'campus-services.org' is suspicious - verify your actual campus parking contact. The QR code likely leads to a fake payment page. For any parking registration, go directly to your company's known parking portal or contact the facilities team.",
    userRole: "staff",
    hasAttachment: false,
    qrCodeUrl: "https://parking-registration-update.com/scan",
  },

  // OAuth consent phishing
  {
    channel: "email",
    senderName: "Google Workspace",
    senderEmail: "notifications@google-workspace-apps.net",
    subject: "Action Required: Approve New App Integration",
    body: `Your organization has enabled a new productivity app that requires your authorization.

App: DocuSign Integration Pro
Publisher: Verified Business Partner
Permissions requested:
- Read and compose emails
- Access Google Drive files
- View and manage calendar events

This integration will enhance your workflow by connecting DocuSign with your Google Workspace.

[AUTHORIZE APP]

If you did not request this integration, please contact your IT administrator.

This notification was sent by Google Workspace.`,
    timestamp: "3 hours ago",
    legitimacy: "malicious",
    attackFamily: "oauth_phishing",
    riskType: "credential_theft",
    cues: ["OAuth consent request", "broad permissions", "fake Google domain", "third-party sender"],
    correctAction: "report",
    explanation: "This is OAuth consent phishing. Attackers create malicious apps that request permission to access your email and files. The sender domain 'google-workspace-apps.net' is NOT Google. Legitimate Google OAuth prompts appear directly in your browser, not via email links. The broad permissions (email, drive, calendar) would give attackers complete account access. Never authorize apps through email links.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://oauth-consent.google-workspace-apps.net/authorize",
    linkText: "AUTHORIZE APP",
  },

  // OAuth consent - legitimate
  {
    channel: "email",
    senderName: "Slack",
    senderEmail: "feedback@slack.com",
    subject: "Your team admin installed Zoom for Slack",
    body: `Hi there,

Your workspace admin has installed the Zoom app for your Slack workspace.

What this means for you:
- You can start Zoom meetings directly from Slack channels
- Meeting links will be automatically shared in conversations
- No additional action required from you

If you have questions about this installation, please contact your workspace administrator.

The Slack Team`,
    timestamp: "1 week ago",
    legitimacy: "legitimate",
    riskType: "none",
    cues: [],
    correctAction: "delete",
    explanation: "This is a legitimate notification from Slack about an admin-installed integration. The sender domain 'slack.com' is correct, it requires no action from you, and it directs questions to your admin rather than asking you to click suspicious links. This is simply an informational notice about a workspace change.",
    userRole: "staff",
    hasAttachment: false,
  },

  // AI-generated sophisticated spear phishing
  {
    channel: "email",
    senderName: "LinkedIn",
    senderEmail: "messages-noreply@linkedin-mail.net",
    subject: "Sarah Mitchell wants to connect - 12 mutual connections",
    body: `Hi there,

Sarah Mitchell, VP of Business Development at Horizon Partners, would like to connect with you on LinkedIn.

Sarah's note: "Hi! I noticed we both attended the Digital Transformation Summit last month. I really enjoyed the panel discussion on AI in enterprise - would love to continue the conversation!"

12 mutual connections including:
- James Rodriguez (Your colleague)
- Michelle Thompson 
- David Kim

[Accept Invitation]  [View Profile]

You're receiving connection invitations at this email address. Unsubscribe from these emails.

LinkedIn Corporation, 1000 W Maude Ave, Sunnyvale, CA 94085`,
    timestamp: "4 hours ago",
    legitimacy: "malicious",
    attackFamily: "ai_phishing",
    riskType: "credential_theft",
    cues: ["fake LinkedIn domain", "personalized context", "urgency through social proof", "AI-generated personal note"],
    correctAction: "report",
    explanation: "This is AI-generated spear phishing that uses personal context to seem legitimate. The domain 'linkedin-mail.net' is NOT LinkedIn (real domain: linkedin.com). Attackers use AI to research targets and craft personalized messages mentioning real events you attended and colleagues. Always check sender domains carefully and access LinkedIn directly through linkedin.com, not email links.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://linkedin-verification.com/accept-connection",
    linkText: "Accept Invitation",
  },

  // AI-generated vendor impersonation
  {
    channel: "email",
    senderName: "Adobe Document Cloud",
    senderEmail: "noreply@adobesign-documents.com",
    subject: "Contract Amendment - Your signature needed",
    body: `Hello,

A document requires your electronic signature.

Document: Q4 2024 Service Agreement Amendment
From: Patterson & Associates Legal
Pages: 3
Expires: December 18, 2024

This amendment updates the renewal terms per our discussion last Thursday. Key changes include the extended payment terms you requested.

[Review and Sign Document]

Document ID: ASG-2024-8847291
Sent via Adobe Sign - the trusted e-signature solution

This message was sent to you because you are listed as a signer on this document.`,
    timestamp: "6 hours ago",
    legitimacy: "malicious",
    attackFamily: "ai_phishing",
    riskType: "credential_theft",
    cues: ["fake Adobe domain", "deadline pressure", "reference to prior conversation", "sophisticated formatting"],
    correctAction: "report",
    explanation: "This is sophisticated AI-generated phishing impersonating Adobe Sign. The domain 'adobesign-documents.com' is NOT Adobe (real domain: adobe.com or adobesign.com). The message references a fake prior conversation to build trust. Real Adobe Sign emails come from '@adobesign.com' and you can verify documents by logging into your Adobe account directly.",
    userRole: "manager",
    hasAttachment: false,
    linkUrl: "https://adobesign-documents.com/sign/doc/ASG-2024-8847291",
    linkText: "Review and Sign Document",
  },

  // Deepfake voice phishing (vishing)
  {
    channel: "call",
    senderName: "Unknown Caller",
    senderPhone: "+1 (555) 892-4103",
    subject: "Voicemail from your bank's fraud department",
    body: `[VOICEMAIL TRANSCRIPT]

"Hi, this is Michael from Chase Bank's fraud prevention team. We've detected some unusual activity on your business account ending in 4872. 

There were three transactions totaling $12,847 that we need to verify with you immediately. These charges appear to be from an overseas merchant.

Please call us back at 1-888-555-0142 within the next 2 hours to prevent your account from being frozen. Have your account number and the last 4 of your social ready for verification.

This is an urgent security matter. Thank you."

[END VOICEMAIL]`,
    timestamp: "25 minutes ago",
    legitimacy: "malicious",
    attackFamily: "ai_phishing",
    riskType: "credential_theft",
    cues: ["AI-generated voice clone", "urgency", "callback to unknown number", "requests sensitive info"],
    correctAction: "verify",
    explanation: "This voicemail shows signs of AI-generated voice phishing (vishing). Fraudsters use AI to clone voices and create convincing bank representative calls. Red flags: They provide a callback number (not the number on your card), create urgency, and request sensitive information. Never call back numbers from voicemails - use the number on your bank card or statement instead.",
    userRole: "finance",
    hasAttachment: false,
  },

  // Legitimate OAuth notification
  {
    channel: "email",
    senderName: "Microsoft",
    senderEmail: "account-security-noreply@microsoft.com",
    subject: "New sign-in to your Microsoft account",
    body: `Microsoft account
Unusual sign-in activity

We noticed a new sign-in to your Microsoft account.

Details:
Country/region: United States
IP address: 192.168.1.xxx
Platform: Windows 11
Browser: Microsoft Edge

If this was you, you can ignore this message.

If this wasn't you, please secure your account:
1. Sign in to your Microsoft account at account.microsoft.com
2. Go to Security > Sign-in activity
3. Review and revoke any suspicious sessions

If you need help, visit support.microsoft.com.

The Microsoft account team`,
    timestamp: "Yesterday",
    legitimacy: "legitimate",
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate security notification from Microsoft. The sender domain '@microsoft.com' is correct. The email provides information without demanding urgent action, tells you to go directly to account.microsoft.com (not through a link), and provides official support channels. This is a helpful security notification to review if you don't recognize the sign-in.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://account.microsoft.com",
    linkText: "account.microsoft.com",
  },

  // SMS QR code phishing
  {
    channel: "sms",
    senderName: "USPS",
    senderPhone: "+1 (855) 478-7235",
    subject: "Package delivery notification",
    body: `USPS: Your package cannot be delivered due to incomplete address information. 

To reschedule delivery, scan the QR code or visit: usps-redelivery.info/track

Your tracking: 9400111899223847562

Reply STOP to opt out`,
    timestamp: "1 hour ago",
    legitimacy: "malicious",
    attackFamily: "qr_phishing",
    riskType: "credential_theft",
    cues: ["fake USPS domain", "QR code in SMS", "address problem pretext", "short URL"],
    correctAction: "report",
    explanation: "This is SMS phishing (smishing) with a QR code. The domain 'usps-redelivery.info' is NOT USPS (real domain: usps.com). USPS does not send QR codes via SMS for redelivery. The tracking number format looks legitimate but is randomly generated. Always track packages directly at usps.com using tracking numbers from your original order confirmation.",
    userRole: "staff",
    hasAttachment: false,
    qrCodeUrl: "https://usps-redelivery.info/track/9400111899223847562",
  },

  // Multi-factor authentication (MFA) phishing
  {
    channel: "sms",
    senderName: "Microsoft",
    senderPhone: "+1 (800) 642-7676",
    subject: "Security verification code",
    body: `Your Microsoft verification code is: 847291

If you didn't request this code, someone may be trying to access your account. 

Reply HELP for assistance or visit microsoft-security-alert.com to secure your account.

This code expires in 10 minutes.`,
    timestamp: "2 minutes ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["MFA interception attempt", "fake Microsoft domain", "real-time attack indicator"],
    correctAction: "report",
    explanation: "This is an MFA interception attack. While the code may be real (an attacker triggered it), the link to 'microsoft-security-alert.com' is malicious. Real Microsoft MFA codes never include links. If you receive an unexpected MFA code, someone is attempting to access your account RIGHT NOW. Change your password immediately through the official Microsoft website and enable additional security measures.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://microsoft-security-alert.com/secure",
    linkText: "microsoft-security-alert.com",
  },

  // Cryptocurrency/NFT phishing
  {
    channel: "email",
    senderName: "OpenSea",
    senderEmail: "noreply@opensea-nft.io",
    subject: "You received an offer for your NFT collection!",
    body: `Great news!

A buyer has made an offer on your NFT collection.

Collection: Bored Ape Yacht Club #8847
Offer: 12.5 ETH (approximately $28,750)
Buyer: CryptoWhale.eth (Verified Collector)
Expires: 24 hours

[Accept Offer]  [Counter Offer]

This offer is significantly above floor price. Act fast to secure this deal!

Log in with your wallet to review the offer details.

OpenSea - The largest NFT marketplace`,
    timestamp: "30 minutes ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "financial_theft",
    cues: ["fake OpenSea domain", "wallet connection request", "high-value lure", "urgency"],
    correctAction: "report",
    explanation: "This is cryptocurrency/NFT phishing. The domain 'opensea-nft.io' is NOT OpenSea (real domain: opensea.io). Clicking 'Accept Offer' leads to a fake wallet connection that steals your cryptocurrency. The 'above floor price' language creates FOMO. Never connect your wallet through email links - always access OpenSea directly by typing the URL.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://opensea-nft.io/accept-offer",
    linkText: "Accept Offer",
  },

  // ============================================
  // MULTI-TURN SCENARIO CHAINS
  // ============================================

  // Wrong Number Scam - Message 1 (Initial contact)
  {
    channel: "sms",
    senderName: "Unknown",
    senderPhone: "+1 (555) 829-4172",
    subject: "Wrong number text",
    body: `Hey Jennifer! Are we still on for coffee tomorrow at 3pm? I found that cafe you mentioned downtown.`,
    timestamp: "2 hours ago",
    legitimacy: "malicious",
    attackFamily: "wrong_number",
    riskType: "none",
    cues: ["unsolicited message", "wrong name", "pig butchering initial contact"],
    correctAction: "delete",
    explanation: "This is the first stage of a 'pig butchering' scam. Scammers send 'wrong number' texts to initiate conversation. If you reply, even to correct them, they'll apologize and try to befriend you. The goal is building a relationship before introducing investment fraud. Best action: don't engage, just delete.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "wrong_number_scam_1",
    chainOrder: 1,
    chainName: "Wrong Number Investment Scam",
  },

  // Wrong Number Scam - Message 2 (After user replied)
  {
    channel: "sms",
    senderName: "Unknown",
    senderPhone: "+1 (555) 829-4172",
    subject: "Follow-up after wrong number",
    body: `Oh sorry! Wrong number lol. But you seem friendly! I'm Amy from San Diego. Since we're texting anyway, what do you do for work? I'm in crypto trading and just made $15K this month!`,
    timestamp: "1 hour ago",
    legitimacy: "malicious",
    attackFamily: "wrong_number",
    riskType: "payment_fraud",
    cues: ["unsolicited financial advice", "mentions crypto gains", "building rapport", "too friendly stranger"],
    correctAction: "report",
    explanation: "Classic escalation in a pig butchering scam. After the 'wrong number' hook, they pivot to mentioning impressive financial gains to spark interest. This is social engineering - they're profiling you for investment fraud. The extraordinary gains mentioned are bait. Report and block this number.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "wrong_number_scam_1",
    chainOrder: 2,
    chainName: "Wrong Number Investment Scam",
    previousAction: "proceed",
  },

  // Wrong Number Scam - Message 3 (Full investment pitch)
  {
    channel: "sms",
    senderName: "Amy",
    senderPhone: "+1 (555) 829-4172",
    subject: "Investment opportunity",
    body: `I hope you don't mind me texting again! I was thinking about our chat and wanted to share something special.

My uncle in Hong Kong taught me his trading system. I've tripled my savings in 6 months! I've never shared this with strangers but you seem really genuine.

Would you be interested in learning? I can guide you. Start with just $500 on this platform: crypto-elite-trading.com

Let me know! -Amy`,
    timestamp: "30 minutes ago",
    legitimacy: "malicious",
    attackFamily: "wrong_number",
    riskType: "financial_theft",
    cues: ["unsolicited investment advice", "guaranteed returns", "foreign connection story", "unknown trading platform", "pressure to invest"],
    correctAction: "report",
    explanation: "Final stage of pig butchering - the investment pitch. Red flags: Stranger offering 'secret' trading knowledge, unrealistic returns (tripled savings), unknown platform, and emotional manipulation ('you seem genuine'). This platform will steal your money. These scams have cost victims billions globally. Report immediately.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "wrong_number_scam_1",
    chainOrder: 3,
    chainName: "Wrong Number Investment Scam",
    previousAction: "proceed",
  },

  // CEO Impersonation Chain - Message 1 (Initial contact)
  {
    channel: "email",
    senderName: "Mark Thompson (CEO)",
    senderEmail: "mark.thompson@company-exec.net",
    replyTo: "m.thompson.ceo@gmail.com",
    subject: "Quick question",
    body: `Hi,

Are you at your desk? I need to ask you something but I'm about to go into a board meeting.

Mark
Sent from my iPhone`,
    timestamp: "15 minutes ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "none",
    cues: ["executive impersonation", "reply-to mismatch", "vague urgent request", "fake CEO email"],
    correctAction: "verify",
    explanation: "This is the opening of a BEC (Business Email Compromise) attack. The message is intentionally vague to get you to respond. Notice the reply-to goes to a Gmail account. Before responding, verify through a known channel like calling the CEO's assistant or office number directly.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "ceo_fraud_chain_1",
    chainOrder: 1,
    chainName: "CEO Wire Fraud Attempt",
  },

  // CEO Impersonation Chain - Message 2 (Gift card request)
  {
    channel: "email",
    senderName: "Mark Thompson (CEO)",
    senderEmail: "m.thompson.ceo@gmail.com",
    subject: "Re: Quick question",
    body: `Perfect, you're there.

I need you to pick up some gift cards as thank-you gifts for our key clients. Get 5 Amazon cards at $200 each ($1000 total).

This is time-sensitive - I need the card numbers texted to me at 555-0147 before 5pm. I'll reimburse you from the exec budget tomorrow.

Can you handle this? I'm counting on you.

Mark`,
    timestamp: "10 minutes ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "payment_fraud",
    cues: ["gift card request", "text card numbers", "time pressure", "skip normal processes", "personal reimbursement promise"],
    correctAction: "report",
    explanation: "Classic BEC gift card scam. The attacker establishes contact, then requests untraceable gift cards. Major red flags: CEOs don't buy gift cards this way, the request bypasses normal procurement, card numbers texted to a personal phone are unrecoverable, and the 'trust' language ('counting on you') is manipulation. Report immediately.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "ceo_fraud_chain_1",
    chainOrder: 2,
    chainName: "CEO Wire Fraud Attempt",
    previousAction: "proceed",
  },

  // CEO Impersonation Chain - Alternative path (Wire transfer)
  {
    channel: "email",
    senderName: "Mark Thompson (CEO)",
    senderEmail: "m.thompson.ceo@gmail.com",
    subject: "Re: Quick question - URGENT",
    body: `I'm glad you're being cautious, but this is really me and I need this handled immediately.

Actually, forget the gift cards. I need you to process a wire transfer instead - $47,500 to finalize an acquisition before market close.

Wire to:
Meridian Consulting Group
Chase Bank
Routing: 021000021
Account: 847291650

Do NOT discuss this with anyone - it's confidential until announced. Send me confirmation when done.

Mark`,
    timestamp: "5 minutes ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "payment_fraud",
    cues: ["escalated urgency", "wire transfer request", "confidentiality demand", "pressure after pushback", "new banking details"],
    correctAction: "report",
    explanation: "Escalation after encountering resistance. The attacker pivoted from gift cards to wire fraud - a more lucrative target. The 'confidential' framing isolates you from verification. The urgency around 'market close' is manufactured pressure. This follows the pattern of real attacks that have cost companies millions. Report to security immediately.",
    userRole: "finance",
    hasAttachment: false,
    chainId: "ceo_fraud_chain_1",
    chainOrder: 3,
    chainName: "CEO Wire Fraud Attempt",
    previousAction: "verify",
  },

  // Tech Support Scam Chain - Message 1 (Pop-up alert)
  {
    channel: "call",
    senderName: "Microsoft Security Alert",
    senderPhone: "+1 (888) 555-0199",
    subject: "Voicemail: Computer security warning",
    body: `[AUTOMATED VOICE MESSAGE]

CRITICAL SECURITY ALERT. This is Microsoft Windows. Your computer has been compromised. Viruses have been detected that are stealing your banking information and personal files.

DO NOT SHUT DOWN YOUR COMPUTER. This may cause permanent data loss.

Call Microsoft Support immediately at 1-888-555-0199 to speak with a certified technician. Failure to call within 30 minutes will result in your computer being permanently disabled.

Your case number is: MS-8847291

This is an urgent security matter requiring immediate attention.`,
    timestamp: "5 minutes ago",
    legitimacy: "malicious",
    attackFamily: "vishing",
    riskType: "credential_theft",
    cues: ["unsolicited security warning", "Microsoft impersonation", "fake case number", "threat of data loss", "callback number"],
    correctAction: "report",
    explanation: "This is a tech support scam. Microsoft never calls users about viruses. Red flags: Automated fear-based message, threats of 'permanent' damage, urgent callback request, and a fake case number. If you call, scammers will try to get remote access to your computer and your payment info. Report and ignore.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "tech_support_scam_1",
    chainOrder: 1,
    chainName: "Tech Support Scam",
  },

  // Tech Support Scam Chain - Message 2 (After calling)
  {
    channel: "call",
    senderName: "Microsoft Support (James)",
    senderPhone: "+1 (888) 555-0199",
    subject: "Tech support call transcript",
    body: `[CALL TRANSCRIPT]

"Thank you for calling Microsoft Support, this is James, case number MS-8847291. I see here your computer has been flagged for a critical security breach.

I'll need you to download our remote support tool so I can assess the damage. Go to anydesk-support.com and click 'Connect with Technician.'

While that downloads, I'll need to verify your identity. Can you confirm your full name, date of birth, and the last four digits of your Social Security number?

Don't worry, this is standard Microsoft verification procedure. I'm here to help protect your computer."`,
    timestamp: "Just now",
    legitimacy: "malicious",
    attackFamily: "vishing",
    riskType: "account_takeover",
    cues: ["remote access request", "fake support domain", "requests personal information", "fake verification procedure"],
    correctAction: "report",
    explanation: "The scam continues with remote access and identity theft. 'AnyDesk' is real software, but the domain is fake. Once connected, they can install malware, steal files, and drain accounts. Microsoft never asks for SSN or uses third-party sites for support. Hang up immediately and report. If you gave any info, change passwords and monitor accounts.",
    userRole: "staff",
    hasAttachment: false,
    chainId: "tech_support_scam_1",
    chainOrder: 2,
    chainName: "Tech Support Scam",
    previousAction: "proceed",
  },

  // ============================================
  // SUSPICIOUS-BUT-LEGITIMATE SCENARIOS
  // These train discrimination - not everything urgent is malicious
  // ============================================

  // Legitimate urgent request from real executive
  {
    channel: "email",
    senderName: "Sarah Martinez (VP Operations)",
    senderEmail: "s.martinez@yourcompany.com",
    replyTo: "s.martinez@yourcompany.com",
    subject: "URGENT: Need signature before board meeting at 2pm",
    body: `Hi,

I know this is last minute, but I need your approval signature on the Q4 budget reforecast before the board meeting at 2pm today.

The document is in the shared Finance folder: S:\\Finance\\2024\\Q4 Budget Reforecast Final.xlsx

Please review and sign using DocuSign (you should have received a separate notification from our official DocuSign account).

If you have questions, I'm at my desk - call me at ext. 3847.

Thanks for understanding the rush!

Sarah`,
    timestamp: "45 minutes ago",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate urgent request. Key indicators: The sender email matches the company domain with correct reply-to, references internal systems (S: drive, DocuSign), provides a verifiable contact method (internal extension), and the urgency is proportionate to a real business need (board meeting). Real deadlines exist - the goal is recognizing legitimate urgency vs manufactured pressure.",
    userRole: "finance",
    hasAttachment: false,
  },

  // Legitimate password expiry notification (looks like phishing)
  {
    channel: "email",
    senderName: "IT Security",
    senderEmail: "security@yourcompany.com",
    subject: "Action Required: Password expires in 3 days",
    body: `Dear Employee,

Your network password will expire in 3 days.

To change your password:
1. Press Ctrl+Alt+Delete on your computer
2. Select "Change a password"
3. Enter your current password, then your new password twice

Password requirements:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Cannot reuse last 10 passwords

If you need assistance, contact the IT Help Desk at helpdesk@yourcompany.com or ext. 4357.

Do NOT reply to this email with your password.

IT Security Team`,
    timestamp: "This morning",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate IT notification. Key indicators: Correct company domain, instructs you to change password locally (Ctrl+Alt+Delete) rather than through a link, explicitly says NOT to share your password, and provides known internal contacts. Compare this to phishing which asks you to click links or enter credentials on a webpage.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Legitimate vendor payment request (looks like BEC)
  {
    channel: "email",
    senderName: "Apex Software Solutions",
    senderEmail: "billing@apexsoftware.com",
    replyTo: "ar@apexsoftware.com",
    subject: "Past due invoice - Account #AC-7841",
    body: `Dear Accounts Payable,

This is a friendly reminder that invoice #INV-2024-1156 for $8,750.00 is now 15 days past due.

Invoice details:
- Invoice #: INV-2024-1156
- Invoice date: November 15, 2024
- Due date: November 30, 2024
- Amount: $8,750.00
- Service: Annual software license renewal

Please process payment at your earliest convenience to avoid service interruption on December 31, 2024.

Payment can be made via:
- ACH transfer (details on file)
- Check payable to Apex Software Solutions
- Credit card via our secure portal at https://pay.apexsoftware.com

If you have questions, contact our AR team at ar@apexsoftware.com or (555) 847-2910.

Thank you for your business.

Jennifer Walsh
Accounts Receivable
Apex Software Solutions`,
    timestamp: "Yesterday",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "verify",
    explanation: "This appears to be a legitimate past-due notice but warrants verification. Best practice: Check if Apex Software is a known vendor in your system, verify the invoice number matches your records, and confirm payment details haven't changed. The request itself isn't suspicious, but vendor invoices are commonly spoofed. A quick verification call protects against invoice fraud.",
    userRole: "finance",
    hasAttachment: false,
    linkUrl: "https://pay.apexsoftware.com",
    linkText: "our secure portal",
  },

  // Legitimate bank fraud alert (looks like vishing)
  {
    channel: "sms",
    senderName: "Chase Bank",
    senderPhone: "+1 (800) 935-9935",
    subject: "Fraud alert",
    body: `Chase Fraud: Did you attempt a $847.00 purchase at AMAZON.COM on 12/15? Reply YES or NO. If not you, we'll block your card. Msg&data rates may apply.`,
    timestamp: "10 minutes ago",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "verify",
    explanation: "This is a legitimate fraud alert format from Chase. Key indicators: The number matches Chase's known fraud line, it asks for simple YES/NO (no links or personal info), and describes a specific transaction. However, it's always safer to verify: Call the number on the back of your card rather than replying to the text. This protects against sophisticated spoofing.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Legitimate HR policy update (urgent but real)
  {
    channel: "email",
    senderName: "Human Resources",
    senderEmail: "hr@yourcompany.com",
    subject: "IMPORTANT: New expense policy effective immediately",
    body: `All Employees,

Effective immediately, please note the following changes to our travel and expense policy:

KEY CHANGES:
1. All travel bookings must use our new portal: Concur (travel.yourcompany.com)
2. Expense reports over $500 require manager + VP approval
3. Personal credit cards are no longer reimbursable for travel

WHY NOW:
Due to recent audit findings, we must implement these controls immediately to maintain compliance with our SOX obligations.

WHAT YOU NEED TO DO:
- Complete the Concur training by Friday (link in Workday Learning)
- Submit any outstanding expense reports under the old policy by December 20

Questions? Contact hr@yourcompany.com or attend Friday's town hall at 3pm.

Thank you for your understanding.

HR Team`,
    timestamp: "2 hours ago",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate policy update, despite the urgent tone. Key indicators: Correct company domain, references internal systems (Workday, known portal), provides context (audit findings), offers multiple verification channels (email, town hall), and doesn't ask for credentials or payments. Organizations do have legitimate urgent policy changes.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://travel.yourcompany.com",
    linkText: "Concur",
  },

  // Legitimate calendar invite from new contact
  {
    channel: "email",
    senderName: "Microsoft Outlook",
    senderEmail: "noreply@outlook.com",
    subject: "Meeting Request: Q1 Planning Discussion",
    body: `You've been invited to a meeting:

Q1 Planning Discussion

When: Tuesday, December 17, 2024 2:00 PM - 3:00 PM
Where: Microsoft Teams meeting

Organizer: Tom Richards (t.richards@clientcompany.com)
Attendees: You, Sarah Martinez, Finance Team

Note from organizer:
"Hi team - as discussed in last week's call, let's align on Q1 priorities and budget allocation. I've attached the draft planning template for review beforehand."

[Accept]  [Tentative]  [Decline]

Join Microsoft Teams Meeting
Meeting ID: 284 847 291#
Passcode: Q1Plan`,
    timestamp: "3 hours ago",
    legitimacy: "suspicious_legitimate",
    riskType: "none",
    cues: [],
    correctAction: "verify",
    explanation: "This calendar invite is likely legitimate but worth verifying since it's from an external contact. Check: Do you have a relationship with ClientCompany? Does this align with a discussion from last week? When uncertain about external meeting requests, confirm with your internal colleague (Sarah Martinez) that this meeting was expected. Calendar invites can be used for phishing.",
    userRole: "staff",
    hasAttachment: true,
    attachmentName: "Q1_Planning_Template.xlsx",
  },

  // ============================================
  // REPLY-CHAIN HIJACK SCENARIO
  // ============================================

  // Reply-chain hijack - vendor payment redirect
  {
    channel: "email",
    senderName: "David Chen - ABC Supplies",
    senderEmail: "dchen@abc-suppIies.com",
    replyTo: "dchen@abc-suppIies.com",
    subject: "Re: PO #4847 - Invoice and updated payment info",
    body: `Hi,

Following up on our conversation about PO #4847. I've attached the invoice as requested.

IMPORTANT: Please note our banking information has changed. Our old bank (First National) was acquired, so please use these new details for all future payments:

New Bank: Horizon Trust
Account Name: ABC Supplies LLC
Account: 847291650
Routing: 021000089

Please update your records and process this invoice to the new account. Let me know if you have any questions!

Thanks,
David Chen
ABC Supplies

---
On Dec 10, David Chen wrote:
> Great talking with you about the Q4 order. I'll send over the invoice
> by end of week. Thanks for your continued business!

On Dec 10, you wrote:
> Hi David, can you send the invoice for PO #4847? We're processing
> December payments this week.`,
    timestamp: "1 hour ago",
    legitimacy: "malicious",
    attackFamily: "bec",
    riskType: "payment_fraud",
    cues: ["look-alike domain", "banking info change", "fake reply chain", "domain uses capital I instead of lowercase l"],
    correctAction: "verify",
    explanation: "This is a reply-chain hijack attack. The email appears to be a continued conversation, but look carefully at the domain: 'abc-suppIies.com' uses a capital I instead of lowercase L. Attackers monitor vendor relationships, then insert themselves with spoofed domains and fake banking changes. ALWAYS verify banking changes by calling the vendor's known phone number from your records, never from the email.",
    userRole: "finance",
    hasAttachment: true,
    attachmentName: "Invoice_PO4847.pdf",
  },

  // ============================================
  // HIGH-DIFFICULTY PHISHING (PERFECT GRAMMAR)
  // ============================================

  // Perfectly written credential phishing
  {
    channel: "email",
    senderName: "DocuSign",
    senderEmail: "dse_na4@docusign.net",
    subject: "Document Ready for Signature: NDA - Confidential Agreement",
    body: `DocuSign

Hello,

Marcus Chen has sent you a document to review and sign.

Document: NDA - Confidential Agreement
Sent by: Marcus Chen (m.chen@horizonventures.com)
Expires: December 20, 2024

This NDA is required before our meeting next Tuesday to discuss the potential partnership opportunity. Please review and sign at your earliest convenience.

REVIEW DOCUMENT

This email was sent to you by Marcus Chen through DocuSign Electronic Signature Service.

Questions? Contact the sender directly.

DocuSign, Inc. | 221 Main Street, Suite 1550 | San Francisco, CA 94105`,
    timestamp: "2 hours ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["unexpected document", "suspicious sender domain", "no prior context"],
    correctAction: "verify",
    explanation: "This is a highly sophisticated phishing email with perfect grammar and formatting. While docusign.net is a legitimate DocuSign domain, the red flags are contextual: Do you know Marcus Chen? Are you expecting this NDA? Do you have a meeting scheduled? Attackers use real DocuSign formatting to steal credentials. When in doubt, contact the supposed sender through a known channel before signing anything.",
    userRole: "manager",
    hasAttachment: false,
    linkUrl: "https://docusign-view.com/envelope/3f7a8b9c",
    linkText: "REVIEW DOCUMENT",
  },

  // Perfectly crafted internal IT request
  {
    channel: "email",
    senderName: "IT Service Desk",
    senderEmail: "servicedesk@yourcompany-it.net",
    subject: "Scheduled: Multi-Factor Authentication Upgrade",
    body: `IT Service Announcement

Dear Colleague,

As part of our ongoing security improvements, your Multi-Factor Authentication (MFA) enrollment requires an update.

What's happening:
We're migrating to Microsoft Authenticator for enhanced security. Your current MFA method will be deprecated on December 31, 2024.

Action required:
Please complete your MFA migration by visiting our secure portal. The process takes approximately 5 minutes.

Complete MFA Migration

Timeline:
- Now - December 20: Complete migration (recommended)
- December 21 - 30: Migration required
- December 31: Legacy MFA disabled

If you experience issues, contact the IT Service Desk at helpdesk@yourcompany.com or call ext. 4357.

Thank you for your cooperation.

IT Security Team
Your Company`,
    timestamp: "This morning",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["look-alike domain", "MFA phishing", "manufactured deadline"],
    correctAction: "report",
    explanation: "This is sophisticated MFA phishing. The sender domain 'yourcompany-it.net' is NOT your company's domain. Attackers know MFA migrations happen, so they create fake ones. Red flags: External domain, link to complete migration (real IT would use internal systems), and the urgency. Legitimate MFA changes come from your actual IT domain and direct you to internal portals you already use.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://yourcompany-it-mfa.net/enroll",
    linkText: "Complete MFA Migration",
  },

  // Executive travel booking phishing
  {
    channel: "email",
    senderName: "Concur Travel",
    senderEmail: "noreply@us.concur-solutions.com",
    subject: "Flight Confirmation: New York to San Francisco - Dec 18",
    body: `Concur Travel

Your trip has been booked.

Traveler: Jennifer Walsh
Confirmation: ABCD12

OUTBOUND FLIGHT
December 18, 2024
United Airlines UA 847
Depart: JFK 8:00 AM
Arrive: SFO 11:30 AM (local)

RETURN FLIGHT
December 20, 2024
United Airlines UA 1156
Depart: SFO 6:00 PM
Arrive: JFK 2:30 AM +1 (local)

Total Cost: $847.00

View or Modify Booking

Need to make changes? Log in to Concur Travel to update your itinerary.

Concur Travel Services
SAP Concur`,
    timestamp: "4 hours ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["fake Concur domain", "unexpected booking", "credential harvesting"],
    correctAction: "verify",
    explanation: "This is travel-themed phishing. The domain 'concur-solutions.com' is NOT SAP Concur (real domain: concur.com). Even if you do travel, attackers send fake bookings hoping you'll click to 'view' them. Check: Did you book this trip? Is this your correct name? Always access Concur through your company's known travel portal or bookmark, never through email links.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://concur-solutions.com/travel/view",
    linkText: "View or Modify Booking",
  },

  // === TEAMS/SLACK CHANNEL SCENARIOS ===

  // Teams phishing - fake IT support
  {
    channel: "teams",
    senderName: "IT Support - Michael",
    senderEmail: "michael.support@external-ithelp.com",
    subject: "Urgent: Your account needs verification",
    body: `Hi there,

I'm from the IT support team and we've detected some unusual login attempts on your account from an unfamiliar location.

To keep your account secure, I need you to click this link and verify your credentials right away:

https://teams-microsoft-verify.com/auth/login

If you don't verify within the next 30 minutes, your account will be temporarily locked for security reasons.

Please let me know once you've completed the verification!

Thanks,
Michael
IT Support`,
    timestamp: "15 minutes ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["external sender", "urgency", "suspicious link domain", "threat of account lock", "unsolicited request"],
    correctAction: "report",
    explanation: "This is Teams-based phishing. Red flags: The sender email is from an external domain 'external-ithelp.com' not your company. Real IT support would not contact you through Teams with external credentials. The link 'teams-microsoft-verify.com' is NOT Microsoft. Never click verification links sent through chat - go directly to your company's IT portal.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://teams-microsoft-verify.com/auth/login",
    linkText: "Verification Link",
  },

  // Teams legitimate - project update
  {
    channel: "teams",
    senderName: "Sarah Chen",
    senderEmail: "sarah.chen@yourcompany.com",
    subject: "Q4 Project Update",
    body: `Hey team,

Just wanted to give everyone a quick update on the Q4 project timeline.

We're on track to hit our December 20th deadline. I've updated the shared docs with the latest milestones.

A few things to note:
- Design review is scheduled for Thursday 2pm
- Dev freeze starts December 15th
- Please update your status in the project tracker by EOD Friday

Let me know if you have any blockers!

Sarah`,
    timestamp: "1 hour ago",
    legitimacy: "legitimate",
    attackFamily: undefined,
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate internal Teams message. The sender is from your company domain (@yourcompany.com), the content is routine project communication with no unusual requests, no links to click, and references internal processes. This is normal workplace communication.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Slack phishing - fake HR bonus
  {
    channel: "slack",
    senderName: "HR-Payroll-Bot",
    senderEmail: "notifications@slack-hr-integrations.io",
    subject: "Year-End Bonus Approval Required",
    body: `Congratulations!

You've been selected for a year-end performance bonus of $2,500. 

To receive your bonus in the next payroll cycle, you must confirm your direct deposit information within 48 hours.

Click here to verify your banking details:
https://hr-portal-bonuses.com/verify-deposit

This is an automated message from the HR Payroll Integration.

Human Resources`,
    timestamp: "30 minutes ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "financial_theft",
    cues: ["financial lure", "deadline pressure", "external link", "asking for banking details", "automated bot pretense"],
    correctAction: "report",
    explanation: "This is Slack-based phishing using a fake bonus lure. Red flags: The sender is from an external domain 'slack-hr-integrations.io', not your company. Real HR would never ask you to 'verify banking details' through a Slack bot with an external link. Bonus notifications come through official HR channels and payroll systems you already use.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://hr-portal-bonuses.com/verify-deposit",
    linkText: "Verify Banking Details",
  },

  // Slack legitimate - standup reminder
  {
    channel: "slack",
    senderName: "Standup Bot",
    senderEmail: "standupbot@yourcompany.slack.com",
    subject: "Daily Standup Reminder",
    body: `Good morning!

It's time for your daily standup update. Please share:

1. What did you accomplish yesterday?
2. What are you working on today?
3. Any blockers?

Post your update in #dev-standups

Have a great day!`,
    timestamp: "8:00 AM",
    legitimacy: "legitimate",
    attackFamily: undefined,
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate Slack bot reminder. The sender is from your company's Slack workspace (@yourcompany.slack.com), it's a routine standup reminder with no links to click or actions required outside of normal workflow. This is standard automated workplace communication.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Teams sophisticated phishing - document sharing
  {
    channel: "teams",
    senderName: "David Thompson (Finance)",
    senderEmail: "david.thompson@yourcompany-finance.com",
    subject: "Shared Document: Budget Review Q4",
    body: `Hi,

I've shared the Q4 budget review document with you. Please review before our meeting tomorrow.

Document: Q4_Budget_Review_Final.xlsx

Click here to open in SharePoint:
https://yourcompany-sharepoint.com/docs/budget-review

Let me know if you have any questions about the figures.

Best,
David Thompson
Finance Department`,
    timestamp: "2 hours ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["look-alike domain", "spoofed internal name", "external SharePoint link", "manufactured urgency"],
    correctAction: "report",
    explanation: "This is sophisticated Teams phishing using a look-alike domain. The sender appears to be internal but 'yourcompany-finance.com' is NOT 'yourcompany.com' - attackers add words to domains to trick you. The SharePoint link 'yourcompany-sharepoint.com' is also fake (real SharePoint is sharepoint.com or your tenant). Always verify by checking the full sender domain and hovering over links before clicking.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://yourcompany-sharepoint.com/docs/budget-review",
    linkText: "Open in SharePoint",
  },

  // Slack suspicious but legitimate - vendor request
  {
    channel: "slack",
    senderName: "Alex from Vendor Solutions",
    senderEmail: "alex@vendorsolutions.com",
    subject: "Following up on our call",
    body: `Hi there,

Following up on our call from last week about the software renewal.

I know the deadline is coming up on Friday, so I wanted to make sure we're on track to get the PO processed.

Can you confirm whether your procurement team has approved the renewal? Happy to jump on a quick call if that would help move things along.

Thanks,
Alex
Vendor Solutions
Account Manager`,
    timestamp: "Yesterday",
    legitimacy: "suspicious_legitimate",
    attackFamily: undefined,
    riskType: "none",
    cues: ["external sender", "deadline mention", "procurement request"],
    correctAction: "verify",
    explanation: "This appears to be a legitimate vendor follow-up but contains some elements that could be concerning (external sender, deadline pressure, procurement mention). The appropriate action is to verify - check your calendar for the referenced call, or contact your procurement team to confirm this is an active vendor relationship. Not every external contact is malicious, but verification is prudent.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Teams legitimate - meeting reschedule
  {
    channel: "teams",
    senderName: "Jennifer Walsh",
    senderEmail: "jennifer.walsh@yourcompany.com",
    subject: "Need to reschedule our 1:1",
    body: `Hey,

Something came up and I need to reschedule our 1:1 that was set for Thursday at 3pm.

Would Friday morning work for you instead? I'm free between 9-11am.

Let me know what works best!

Jen`,
    timestamp: "3 hours ago",
    legitimacy: "legitimate",
    attackFamily: undefined,
    riskType: "none",
    cues: [],
    correctAction: "proceed",
    explanation: "This is a legitimate Teams message from a colleague. The sender is from your company domain (@yourcompany.com), the request is routine (rescheduling a meeting), there are no links or unusual requests. This is normal workplace communication.",
    userRole: "staff",
    hasAttachment: false,
  },

  // Slack phishing - fake security alert
  {
    channel: "slack",
    senderName: "Slack Security",
    senderEmail: "security-alerts@slack-workspace-security.net",
    subject: "Unusual Sign-in Activity Detected",
    body: `SECURITY ALERT

We detected a sign-in to your Slack account from an unrecognized device:

Location: Moscow, Russia
Device: Windows PC
Time: 2:47 AM (your time)

If this wasn't you, your account may be compromised.

Secure your account immediately:
https://slack-security-center.net/secure-account

If this was you, you can ignore this message.

Slack Security Team`,
    timestamp: "5 minutes ago",
    legitimacy: "malicious",
    attackFamily: "phishing",
    riskType: "credential_theft",
    cues: ["fear-based urgency", "fake security alert", "suspicious domain", "external sender", "foreign location scare"],
    correctAction: "report",
    explanation: "This is a fear-based phishing attack using a fake security alert. Red flags: The sender domain 'slack-workspace-security.net' is NOT Slack (real Slack is slack.com). The 'Moscow, Russia' location is designed to scare you into clicking without thinking. Real Slack security alerts come from slack.com and direct you to your actual Slack settings, not external websites.",
    userRole: "staff",
    hasAttachment: false,
    linkUrl: "https://slack-security-center.net/secure-account",
    linkText: "Secure Your Account",
  },
];

// Calculate difficulty scores dynamically using NIST Phish Scale
export const scenariosSeed: InsertScenario[] = rawScenarios.map(scenario => ({
  ...scenario,
  difficultyScore: calculateNISTDifficulty(scenario.cues),
}));
