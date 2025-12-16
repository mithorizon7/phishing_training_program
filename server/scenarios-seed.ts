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
];
