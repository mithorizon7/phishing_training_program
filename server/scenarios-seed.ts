import type { InsertScenario } from "@shared/schema";

export const scenariosSeed: InsertScenario[] = [
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
    difficultyScore: 1,
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
    difficultyScore: 3,
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
    difficultyScore: 1,
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
    difficultyScore: 3,
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
    difficultyScore: 2,
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
    difficultyScore: 2,
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
    difficultyScore: 2,
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
    difficultyScore: 2,
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
    difficultyScore: 3,
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
    difficultyScore: 1,
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
    difficultyScore: 4,
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
    difficultyScore: 3,
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
    difficultyScore: 4,
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
    difficultyScore: 2,
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
    difficultyScore: 5,
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
    difficultyScore: 5,
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
    difficultyScore: 4,
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
    difficultyScore: 2,
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
    difficultyScore: 3,
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
    difficultyScore: 5,
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
    difficultyScore: 4,
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
    difficultyScore: 2,
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
    difficultyScore: 3,
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
    difficultyScore: 4,
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
    difficultyScore: 3,
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
    difficultyScore: 4,
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
    difficultyScore: 5,
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
    difficultyScore: 2,
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
    difficultyScore: 3,
    userRole: "staff",
    hasAttachment: false,
    chainId: "tech_support_scam_1",
    chainOrder: 2,
    chainName: "Tech Support Scam",
    previousAction: "proceed",
  },
];
