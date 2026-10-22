# JEV Privacy Gateway — 2-Minute Demo Voice-Over Script

**Framework**: Context-Aware Data Privacy (PS 2.2)  
**Total Duration**: Exactly 120 Seconds (2 Minutes)  
**Target Speech Pace**: ~135 words per minute (confident, technical, deliberate)  
**Core Thesis**: *"JEV judges, code decides. The model supplies facts about the text; the final action always comes from the policy table."*

---

## Scene 1: The Problem & The Core Principle
- **Timecode**: `0:00 – 0:20` (20 Seconds)
- **On Screen Action**: Start on the clean, Claude-styled **Login Screen**. Point cursor to subtitle *"Context-Aware Data Privacy"*.
- **Voice-Over Audio**:
  > *"Whether data is private depends fundamentally on context—who is asking, for what task, and where the output goes. A treating physician needs a patient's diagnosis; a billing clerk does not. But traditional tools either block everything or rely on prompt rules that leak before they even run.*  
  >  
  > *This is JEV—a two-gate privacy firewall built on one core rule: **JEV judges, code decides**."*
- **Key Takeaway**: Keyword filters and prompt guardrails fail because identical words require different handling based on context.

---

## Scene 2: Trusted Context (The Login Screen)
- **Timecode**: `0:20 – 0:45` (25 Seconds)
- **On Screen Action**: 
  - Fill **Field 1** (*Healthcare Facility*): *"Metro Health Memorial Hospital"*.
  - Fill **Field 2** (*Requester Role*): Select **Billing Clerk (Revenue & Claims)**.
  - Point to the **Zero-Trust callout** at the bottom.
  - Click **"Authenticate & Enter JEV Gateway"**.
- **Voice-Over Audio**:
  > *"Notice our login screen: it binds two vital fields—our **Hospital Facility** and our **Authorized Role**.*  
  >  
  > *In JEV, trusted context arrives exclusively from signed application session metadata—never parsed from the prompt. An attacker who writes 'I am the chief doctor' inside the chat cannot bypass this bound identity.*  
  >  
  > *Let's log in as a Billing Clerk."*
- **Key Takeaway**: Prompt injection cannot alter access privileges because role permissions are bound to the session token.

---

## Scene 3: Gate 1 & The Ephemeral In-Memory Vault
- **Timecode**: `0:45 – 1:15` (30 Seconds)
- **On Screen Action**: 
  - Select preset **HC-014 (Billing Clerk Claim Letter)**.
  - Show the note: *"Rahul Mehta, 42, MRN 4471920, diagnosed with HIV..."*
  - Click **"Run Gate 1 & 2"**.
  - Show detected risk chips: `Rahul Mehta` and `MRN 4471920` are **ALLOW**; `HIV` and `14 MG Road` are **MASK**.
  - Click the **"In-Memory Vault"** tab: show volatile RAM addresses (`0x7FFEE4B20038`) and tokens (`[CONDITION_1]`).
- **Voice-Over Audio**:
  > *"Here's a hospital note with patient Rahul Mehta, diagnosed with HIV, living on MG Road. In Gate 1, fast detectors flag sensitive spans. Then, our JEV judge model analyzes each span in context.*  
  >  
  > *Code evaluates the policy table: for a billing clerk, patient name and MRN are allowed, but the HIV diagnosis and residential address are strictly masked.*  
  >  
  > *Look at the In-Memory Vault: raw secrets are quarantined in volatile RAM and replaced with safe tokens before transmission. The main AI model only ever sees `[CONDITION_1]` and `[ADDRESS_1]`. And the vault lives only in memory—it is never written to disk, database, or logs."*
- **Key Takeaway**: The primary AI model never receives raw secrets. Quarantining happens in volatile RAM before network transmission.

---

## Scene 4: "The Demo Moment" (Context, Not Keywords)
- **Timecode**: `1:15 – 1:35` (20 Seconds)
- **On Screen Action**: 
  - Switch back to the **Two-Gate Pipeline** tab.
  - Leave the input note completely untouched.
  - Change the **Role dropdown in the Context Bar** from **Billing Clerk** to **Doctor (Care)**.
  - Watch the actions recalculate: the HIV diagnosis flips from `MASK` to `ALLOW`.
- **Voice-Over Audio**:
  > *"Now for the demo moment. Watch what happens when I switch the role dropdown to **Doctor** on the exact same clinical note.*  
  >  
  > *Instantly, the HIV diagnosis flips from MASK to **ALLOW**.*  
  >  
  > *Why? Because the treating doctor requires clinical history for rounds. The words didn't change at all—only the context changed."*
- **Key Takeaway**: Visually proves the core thesis: identical words yield completely different, appropriate privacy decisions based on authenticated context.

---

## Scene 5: Gate 2 Output Inspection & Paraphrase Catch
- **Timecode**: `1:35 – 1:55` (20 Seconds)
- **On Screen Action**: 
  - Switch role back to **Billing Clerk**.
  - Click the button: **"Test Paraphrase Leak"**.
  - Show the amber Gate 2 alert banner: *"Gate 2 Leak Intercepted & Auto-Redacted"*.
  - Point to the output where *"the patient's immune condition"* was intercepted and replaced with `[REDACTED_PARAPHRASE]`.
- **Voice-Over Audio**:
  > *"Leaks also happen on the way out. What if the model tries to evade filters by using subtle paraphrases like 'the patient's immune condition'?*  
  >  
  > *Gate 2 runs a two-step check: Step A searches for vault values in code; Step B uses JEV to catch semantic paraphrases and inferences.*  
  >  
  > *As you can see, Gate 2 caught the phrase and auto-redacted it before delivery."*
- **Key Takeaway**: Gate 2 intercepts semantic paraphrases and indirect side-channels before output reaches the viewer.

---

## Scene 6: Zero-Leak Audit Log & Wrap-Up
- **Timecode**: `1:55 – 2:00` (5 Seconds)
- **On Screen Action**: 
  - Click the **"Audit Log"** tab in top navigation.
  - Show the clean JSON entry displaying masked tokens (`[CONDITION_1]`), reasons, and stage latencies.
- **Voice-Over Audio**:
  > *"Finally, our Audit Log records every decision with masked tokens and latencies, because storing raw secrets in logs creates a new leak.*  
  >  
  > *JEV: deterministic, context-aware privacy that protects sensitive data end-to-end."*
- **Key Takeaway**: Compliance logs record masked tokens only, preventing the audit trail itself from creating leaks.

---

## Quick Recording Checklist
1. Start at Login Screen.
2. Select **Billing Clerk** → Click **"Authenticate"**.
3. Select **HC-014** preset → Run Gate 1 & 2 → Show masked `[CONDITION_1]`.
4. Click **In-Memory Vault** tab → Show volatile RAM memory pointers.
5. Return to Workspace → Switch role dropdown to **Doctor** (observe instant flip to `ALLOW`).
6. Switch back to Billing Clerk → Click **"Test Paraphrase Leak"** (observe Gate 2 intercepting *"immune condition"*).
7. Click **Audit Log** tab → Conclude on zero-leak compliance records.
