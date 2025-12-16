/**
 * NIST Phish Scale Implementation
 * 
 * Based on NIST methodology for assessing phishing email difficulty.
 * The scale considers two main factors:
 * 1. Observable Cue Presence - phishing indicators visible to users
 * 2. Premise Alignment - how well the email fits the target's context
 * 
 * Lower difficulty = easier to detect (many obvious red flags)
 * Higher difficulty = harder to detect (fewer/subtle red flags, high premise alignment)
 */

// Cue categories and their weights
// Lower weight = more obvious (easier to detect), Higher weight = more subtle

export type CueWeight = {
  cue: string;
  weight: number; // 1 = very obvious, 2 = moderate, 3 = subtle
  category: 'sender' | 'content' | 'link' | 'emotional' | 'context';
  description: string;
};

export const CUE_WEIGHTS: CueWeight[] = [
  // Sender-related cues (easy to spot if you check)
  { cue: "suspicious domain", weight: 1, category: "sender", description: "Domain doesn't match claimed sender" },
  { cue: "external sender", weight: 1, category: "sender", description: "Message from outside organization" },
  { cue: "reply-to mismatch", weight: 2, category: "sender", description: "Reply-to differs from sender address" },
  { cue: "look-alike domain", weight: 3, category: "sender", description: "Domain is similar but not identical" },
  { cue: "spoofed internal name", weight: 3, category: "sender", description: "Name appears internal but isn't" },
  { cue: "fake sender display name", weight: 2, category: "sender", description: "Display name doesn't match email" },
  
  // Content-related cues (visible in message body)
  { cue: "generic greeting", weight: 1, category: "content", description: "Uses 'Dear Customer' instead of name" },
  { cue: "spelling errors", weight: 1, category: "content", description: "Contains misspellings/grammar errors" },
  { cue: "unusual request", weight: 2, category: "content", description: "Request that's not part of normal business" },
  { cue: "gift cards", weight: 1, category: "content", description: "Requests gift card purchase" },
  { cue: "asking for banking details", weight: 1, category: "content", description: "Requests financial information" },
  { cue: "wire transfer request", weight: 1, category: "content", description: "Requests wire/ACH transfer" },
  { cue: "password request", weight: 1, category: "content", description: "Asks for password or credentials" },
  { cue: "keep it secret", weight: 2, category: "content", description: "Asks to keep communication confidential" },
  { cue: "unexpected booking", weight: 2, category: "content", description: "Booking/reservation not made by user" },
  { cue: "too good to be true", weight: 1, category: "content", description: "Offers unrealistic rewards/prizes" },
  { cue: "financial lure", weight: 2, category: "content", description: "Promises money/bonus as incentive" },
  
  // Link-related cues
  { cue: "suspicious link domain", weight: 1, category: "link", description: "Link URL doesn't match claimed destination" },
  { cue: "external link", weight: 2, category: "link", description: "Link goes to external site" },
  { cue: "external SharePoint link", weight: 3, category: "link", description: "SharePoint URL isn't official" },
  { cue: "qr code", weight: 2, category: "link", description: "Contains QR code to scan" },
  { cue: "url shortener", weight: 2, category: "link", description: "Uses URL shortening service" },
  { cue: "credential harvesting", weight: 2, category: "link", description: "Link leads to fake login page" },
  
  // Emotional manipulation cues
  { cue: "urgency", weight: 1, category: "emotional", description: "Creates sense of immediate action needed" },
  { cue: "urgent language", weight: 1, category: "emotional", description: "Uses urgent/alarming words" },
  { cue: "threat of suspension", weight: 1, category: "emotional", description: "Threatens account will be suspended" },
  { cue: "threat of account lock", weight: 1, category: "emotional", description: "Threatens account will be locked" },
  { cue: "fear-based urgency", weight: 1, category: "emotional", description: "Uses fear to prompt action" },
  { cue: "deadline pressure", weight: 2, category: "emotional", description: "Imposes tight deadline" },
  { cue: "manufactured urgency", weight: 2, category: "emotional", description: "Creates false sense of urgency" },
  { cue: "manufactured deadline", weight: 2, category: "emotional", description: "Creates artificial deadline" },
  { cue: "foreign location scare", weight: 1, category: "emotional", description: "Claims activity from suspicious location" },
  { cue: "callback pressure", weight: 2, category: "emotional", description: "Pressures immediate callback" },
  { cue: "authority pressure", weight: 3, category: "emotional", description: "Claims to be from authority figure" },
  
  // Context-related cues (requires understanding of normal business)
  { cue: "unsolicited request", weight: 2, category: "context", description: "Request not initiated by recipient" },
  { cue: "text codes to personal number", weight: 1, category: "context", description: "Asks to text info to personal phone" },
  { cue: "fake CEO", weight: 2, category: "context", description: "Impersonates executive" },
  { cue: "fake Concur domain", weight: 2, category: "context", description: "Uses fake travel/expense domain" },
  { cue: "fake vendor", weight: 2, category: "context", description: "Impersonates known vendor" },
  { cue: "invoice without context", weight: 2, category: "context", description: "Invoice with no prior transaction" },
  { cue: "automated bot pretense", weight: 2, category: "context", description: "Claims to be automated system" },
  { cue: "fake security alert", weight: 2, category: "context", description: "Fake security notification" },
  { cue: "MFA phishing", weight: 3, category: "context", description: "Attempts to capture MFA codes" },
  { cue: "procurement request", weight: 2, category: "context", description: "Request related to purchasing" },
  { cue: "deadline mention", weight: 2, category: "context", description: "Mentions upcoming deadline" },
];

/**
 * Premise alignment factors that make phishing harder to detect.
 * High premise alignment = email fits the target's expected context
 */
export type PremiseAlignmentFactor = {
  factor: string;
  weight: number; // Adds to difficulty
  description: string;
};

export const PREMISE_ALIGNMENT_FACTORS: PremiseAlignmentFactor[] = [
  { factor: "expected_communication", weight: 1, description: "Type of message recipient normally receives" },
  { factor: "recent_event_tie_in", weight: 1, description: "References recent real event" },
  { factor: "internal_process_knowledge", weight: 2, description: "Shows knowledge of internal processes" },
  { factor: "correct_branding", weight: 1, description: "Uses accurate logos/formatting" },
  { factor: "personalization", weight: 1, description: "Uses recipient's actual name/details" },
  { factor: "role_appropriate", weight: 1, description: "Request matches recipient's job role" },
];

/**
 * Calculate NIST Phish Scale difficulty score based on cues present
 * 
 * @param cues - Array of cue strings present in the scenario
 * @param premiseFactors - Optional array of premise alignment factors
 * @returns Difficulty score 1-5 (1 = easiest to detect, 5 = hardest)
 */
export function calculateNISTDifficulty(
  cues: string[], 
  premiseFactors: string[] = []
): number {
  // Calculate cue-based difficulty
  // More obvious cues = lower difficulty
  // Fewer cues or subtle cues = higher difficulty
  
  let totalCueWeight = 0;
  let obviousCueCount = 0;
  let subtleCueCount = 0;
  
  for (const cue of cues) {
    const cueConfig = CUE_WEIGHTS.find(
      c => c.cue.toLowerCase() === cue.toLowerCase()
    );
    
    if (cueConfig) {
      totalCueWeight += cueConfig.weight;
      if (cueConfig.weight === 1) obviousCueCount++;
      if (cueConfig.weight === 3) subtleCueCount++;
    } else {
      // Unknown cue, treat as moderate
      totalCueWeight += 2;
    }
  }
  
  // Calculate premise alignment bonus
  let premiseBonus = 0;
  for (const factor of premiseFactors) {
    const factorConfig = PREMISE_ALIGNMENT_FACTORS.find(
      f => f.factor === factor
    );
    if (factorConfig) {
      premiseBonus += factorConfig.weight;
    }
  }
  
  // Scoring logic:
  // - Many obvious cues (weight 1) = lower difficulty
  // - Few cues or subtle cues = higher difficulty
  // - High premise alignment = higher difficulty
  
  let baseDifficulty: number;
  
  if (cues.length === 0) {
    // No cues = legitimate message, difficulty 1
    baseDifficulty = 1;
  } else if (obviousCueCount >= 3) {
    // Many obvious red flags = very easy
    baseDifficulty = 1;
  } else if (obviousCueCount >= 2 && subtleCueCount === 0) {
    // Some obvious cues, no subtle = easy
    baseDifficulty = 2;
  } else if (subtleCueCount >= 2) {
    // Multiple subtle cues = hard
    baseDifficulty = 4;
  } else if (obviousCueCount === 0 && subtleCueCount > 0) {
    // Only subtle cues = very hard
    baseDifficulty = 5;
  } else {
    // Mixed cues
    const avgWeight = totalCueWeight / cues.length;
    if (avgWeight <= 1.5) {
      baseDifficulty = 2;
    } else if (avgWeight <= 2) {
      baseDifficulty = 3;
    } else {
      baseDifficulty = 4;
    }
  }
  
  // Add premise alignment bonus (caps at 5)
  const finalDifficulty = Math.min(5, baseDifficulty + Math.floor(premiseBonus / 2));
  
  return finalDifficulty;
}

/**
 * Get a human-readable difficulty label
 */
export function getDifficultyLabel(score: number): string {
  switch (score) {
    case 1: return "Very Easy";
    case 2: return "Easy";
    case 3: return "Moderate";
    case 4: return "Hard";
    case 5: return "Very Hard";
    default: return "Unknown";
  }
}

/**
 * Analyze cues and return categorized breakdown
 */
export function analyzeCues(cues: string[]): {
  obvious: CueWeight[];
  moderate: CueWeight[];
  subtle: CueWeight[];
  unknown: string[];
} {
  const result = {
    obvious: [] as CueWeight[],
    moderate: [] as CueWeight[],
    subtle: [] as CueWeight[],
    unknown: [] as string[],
  };
  
  for (const cue of cues) {
    const cueConfig = CUE_WEIGHTS.find(
      c => c.cue.toLowerCase() === cue.toLowerCase()
    );
    
    if (cueConfig) {
      if (cueConfig.weight === 1) {
        result.obvious.push(cueConfig);
      } else if (cueConfig.weight === 2) {
        result.moderate.push(cueConfig);
      } else {
        result.subtle.push(cueConfig);
      }
    } else {
      result.unknown.push(cue);
    }
  }
  
  return result;
}
