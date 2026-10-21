# Privacy, data-protection and IT-law obligations for a small Indian e-commerce website (status as of 21 Oct 2026)

Method note: roughly 10 web searches/fetches. Almost all sources are secondary (law-firm and compliance-vendor pages); I did not reach the Gazette text, meity.gov.in, cert-in.org.in or indiacode.nic.in directly. Items without a link are from my own background knowledge and are listed under Gaps or Inferences, not as cited fact.

## 1. DPDP Act 2023 and DPDP Rules 2025: commencement and what applies now vs later

### Takeaway
As of October 2026 the DPDP Act's core duties for an ordinary shop are NOT yet in force. The Rules were notified 13/14 Nov 2025; consent-manager rules start about 13/14 Nov 2026 (about 3 weeks away); the duties that matter to a shop (notice, consent, security, breach reporting, erasure, children, data-principal rights) start about 13/14 May 2027. A MeitY proposal (Jan 2026) to shorten 18 months to 12 for large players had not been gazetted per the latest source (20 Sep 2026). Plan to May 2027, build early.

### Cited Findings
- Immediate (13/14 Nov 2025): commencement provisions, Data Protection Board (DPB) establishment, RTI/TRAI amendments. Consent Manager registration plus DPB power over Consent Managers: 12 months (14 Nov 2026). Notice and consent, breach reporting, security safeguards, verifiable consent for children and persons with disabilities, SDF obligations, data principal rights, cross-border transfer, DPB powers, and repeal of IT Act s.43A: 18 months (14 May 2027). — [Shardul Amarchand Mangaldas](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/)
- Gazette wording as quoted by Mondaq: Rule 4 in force 1 year after publication; Rules 3, 5 to 16, 22, 23 in force 18 months after (about 13 May 2027); Rules 1, 2, 17-21 immediate. Sources differ by one day (13 vs 14 Nov / May) — [Mondaq](https://www.mondaq.com/dpdp-act-compliance-mandate) via search summary; [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)
- Jan 2026: MeitY sought feedback (by 4 Feb 2026) on cutting the 18-month window to 12 months (final date would become 13 Nov 2026), reportedly aimed at significant data fiduciaries/large firms; also considering bringing Rules 15 and 23 into effect immediately. — [Storyboard18](https://www.storyboard18.com/digital/meity-seeks-industry-views-on-fast-tracking-dpdp-act-rollout-proposes-12-month-compliance-timeline-88332.htm); [SS Rana via Chambers](https://chambers.com/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs)
- Status as at 20 Sep 2026: no amending notification found; no DPB Chairperson/Members reported appointed; MeitY invited applications 6 May 2026. Advice: "Plan to the May 2027 date, but prepare as if it could move earlier." — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)
- Until the 18-month phase, s.43A and SPDI Rules 2011 remain the applicable framework; s.43A is omitted by DPDP s.44(2) from May 2027. One page (KSK) phrases it as already omitted, which conflicts with phased commencement — [KSK](https://ksandk.com/md/data-protection-and-data-privacy/what-happens-spdi-rules-after-dpdp-enforcement/)
- Constitutional challenges to the Act are reported pending before the Supreme Court (status not verified) — [Mondaq via search summary](https://www.mondaq.com/dpdp-act-compliance-mandate)

### Inferences
- Today (Oct 2026) the shop is legally bound by IT Act s.43A/SPDI, not DPDP duties. Consent Manager rules do not affect a small shop (it is an optional ecosystem; a fiduciary need not use one).
- Because the May 2027 date could be advanced and DPB is not yet staffed, enforcement before mid-2027 is very unlikely, but building compliance now avoids rework.

### Gaps
- Did not confirm via Gazette/MeitY that no amendment was notified between 20 Sep and 21 Oct 2026. Check meity.gov.in before relying.
- Status of Supreme Court challenges not verified.

## 2. Data Fiduciary duties under DPDP (notice, consent, retention, breach, rights, grievance, children), small-business relief, penalties

### Takeaway
A web shop is a Data Fiduciary with full duties from May 2027: standalone plain-language notice, specific consent, reasonable security, erasure when purpose ends, 72-hour detailed breach report to the DPB plus notice to every affected user, grievance redress within 90 days, and verifiable parental consent for under-18s. There is no blanket small-business/MSME exemption.

### Cited Findings
- Notice (Rule 3): standalone, plain language, itemised data and purposes; available in Eighth Schedule languages on request; commentary adds links to withdraw consent and complain to the DPB. — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/); [Protiviti/Seqrite summaries](https://www.seqrite.com/blog/dpdp-rules-are-here-what-changed-from-the-draft/)
- Security (Rule 6): encryption/masking/tokenisation, access control, activity logs, backups; processor contracts should carry security terms. — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)
- Breach (Rule 7): inform the DPB without delay, full details within 72 hours (extendable by the Board); all affected data principals told regardless of materiality, in plain language (breach location need not be disclosed to them). — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/); [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/)
- Retention/erasure: erase data once the purpose is served; all fiduciaries must retain personal data, traffic data and processing logs for at least 1 year (new vs draft). Third Schedule time-limit erasure applies only to large e-commerce/social/gaming intermediaries above user thresholds, with 48 hours' warning before deletion. — [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/); [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)
- Grievances: fiduciaries and Consent Managers must resolve within reasonable time, max 90 days. The article found no stated response period for rights requests. — [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/)
- Children: under 18 is a child; verifiable parental consent required (parent verified as identifiable adult, possibly via virtual token from an authorised entity); s.9(3) bars tracking, behavioural monitoring and targeted ads to children; narrow exemptions (e.g. safety location tracking, age verification) not usable for analytics/profiling/monetisation. — [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/); [KSK commentary via search](https://ksandk.com/md/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/)
- Small business: s.17(3) lets the Central Government notify startups/classes of fiduciaries as exempt from specified provisions; it is an enabling power, not a blanket exemption; MSME status alone gives no exemption; no notified carve-out found; relief would not cover security or breach reporting. — [KSK on startups/MSMEs](https://ksandk.com/data-protection-and-data-privacy/dpdp-compliance-for-startups-msmes/)
- Penalty ceilings reported: up to Rs 250 crore (security failures), Rs 200 crore (breach notification / children's data), Rs 150 crore (SDF duties). — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/); conflicting vendor claims of Rs 50 crore for consent failures are unverified.

### Inferences
- Rs 250 crore is a ceiling; the DPB weighs gravity, repetition, mitigation and ability to pay (background knowledge of s.33, not verified here). A tiny shop faces practical risk mainly from a breach plus no safeguards.
- A shop with under-18 shoppers (e.g. selling fashion/toys) should either gate sign-up with an age declaration, or avoid trackers and collect minimal data.

### Gaps
- Exact Schedule penalty table (including residual Rs 50 crore tier) not confirmed from the Act text. Per my recollection the Act's Schedule also lists Rs 10,000 for data-principal duty breaches and Rs 200 crore for children-related breaches; verify on indiacode.nic.in.
- Rights-request response period and the Rule 14 detail not confirmed. Fuller content of consent request (itemised, specific, withdrawal as easy as giving) is from the Act itself (s.5-6) and was not re-verified.
- Whether the Third Schedule thresholds (reported as large user counts) exclude a small shop: not verified numerically.

## 3. IT Act 2000: s.43A and SPDI Rules, s.72A, s.79 and Intermediary Rules 2021, grievance officer; Consumer Protection (E-Commerce) Rules 2020

### Takeaway
Right now SPDI Rules 2011 still apply (reasonable security practices e.g. ISO 27001-type, privacy policy, written consent for sensitive data, grievance officer). s.43A goes away in May 2027 when DPDP duties start. The e-commerce rules separately require a grievance officer with a 48-hour acknowledgement and one-month resolution.

### Cited Findings
- s.43A and SPDI Rules remain applicable until the 18-month phase; omission via DPDP s.44(2) from 14 May 2027. — [KSK](https://ksandk.com/md/data-protection-and-data-privacy/what-happens-spdi-rules-after-dpdp-enforcement/); [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/)
- Consumer Protection (E-Commerce) Rules 2020: grievance officer must acknowledge within 48 hours and redress within one month; sellers must disclose legal name, address, contact, GSTIN/PAN as applicable; returns/refunds for defective or misrepresented goods; importer details for imported goods; no cancellation fees unless the seller bears similar charges. — [Mondaq summary](https://mondaq.com/india/dodd-frank-consumer-protection-act/985606/the-consumer-protection-e-commerce-rules-2020); [indialaw.in](https://www.indialaw.in/guides/civil/consumer-protection-e-commerce-rules/)

### Inferences (background knowledge, not verified in this session)
- SPDI Rules: sensitive personal data includes passwords, financial/payment details; need a published privacy policy, written consent, grievance officer (name and contact published; resolve within one month). Names, phones, addresses and emails are generally NOT "sensitive" under SPDI, so SPDI bites mainly on payment/password data.
- s.72A: punishes disclosure of personal information in breach of lawful contract with intent/knowledge of causing wrongful loss/gain (up to 3 years / Rs 5 lakh). Remains after DPDP (DPDP s.44 amends only 43A and rule powers).
- s.79 safe harbour and IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 apply if the site hosts third-party content (product reviews): publish rules/user agreement, appoint a Grievance Officer (acknowledge in 24 hours, resolve in 15 days per 2021 Rules), remove unlawful content on notice. A shop with moderated, not user-posted, reviews is lighter; due-diligence loss of safe harbour is the risk. Additional duties are for "significant social media intermediaries" only.

### Gaps
- s.72A, s.79 and IT Rules 2021 specifics were not covered by any search result; confirm on indiacode.nic.in / meity.gov.in.
- Whether a marketplace vs own-inventory shop is treated differently under the E-Commerce Rules: summaries mention both types; thresholds/exemptions not verified.

## 4. CERT-In Directions (28 Apr 2022)

### Takeaway
Applies to service providers, intermediaries, body corporates etc.: report listed cyber incidents within 6 hours, keep ICT logs 180 days within India, sync clocks to NIC/NPL NTP, and register a point of contact. In force since 27 June 2022.

### Cited Findings
- Six-hour reporting of listed incidents; ICT clocks synced to NIC/NPL NTP; logs kept rolling 180 days in Indian jurisdiction; point of contact appointed and registered; effective 27 Jun 2022 (Directions No. 20(3)/2022-CERT-In under s.70B(6)). — [Ankura](https://ankura.com/insights/everything-you-need-to-know-about-indias-new-guidelines-related-to-cyber-incident-reporting-by-cert-in); [Treelife](https://treelife.in/compliance/navigating-the-cert-in-directions-implications-and-challenges-for-indian-businesses)
- Scope is broad (service provider, intermediary, data centre, body corporate, government); some sources say individuals and enterprises are excluded — conflict, check primary text. — [Ankura](https://ankura.com/insights/everything-you-need-to-know-about-indias-new-guidelines-related-to-cyber-incident-reporting-by-cert-in)

### Inferences
- A small shop on Shopify/Vercel/Cloudflare-type hosting realistically relies on the host for logs and NTP, but still should report a hack (e.g. website defacement, data breach) to incident@cert-in.org.in within 6 hours of noticing. Log 180-day retention is hard on managed hosts; keep what the platform offers and note it.

### Gaps
- Official primary text not read; incident-type annexure not itemised.

## 5. Cookies, analytics and tracking (Google Analytics, Meta Pixel); WhatsApp; GDPR

### Takeaway
No Indian law names "cookie banners". But from May 2027, trackers that identify people are personal-data processing needing free, specific, informed, unambiguous consent for a stated purpose. Practitioners recommend a consent banner that blocks analytics/ad pixels until opt-in, with separate choices. GDPR/UK GDPR/ePrivacy apply independently if you target EU/UK visitors.

### Cited Findings
- Cookies fall within DPDP scope where they relate to an identifiable person even though the Act does not name them; practitioners advise loading analytics/ad/third-party SDKs only after affirmative consent and not bundling ads, analytics and personalisation in one consent. — [CookieChimp](https://cookiechimp.com/guides/regulations/in_dpdpa); [Flexy Consent](https://flexyconsent.com/blog/dpdp-act-india-cookie-consent-guide/) (vendor sources)
- Argument that s.6(1) restricts cookie walls is from a single student paper; contested. — [CLT NLIU](https://clt.nliu.ac.in/2024/03/19/navigating-the-legal-landscape-of-cookies-privacy-concerns-and-dark-patterns/)
- Children: no tracking, behavioural monitoring or targeted ads aimed at under-18s (see section 2).

### Inferences (background knowledge)
- Legal basis for consent in DPDP includes "legitimate uses" (s.7), e.g. voluntarily provided data for the purpose requested (a customer giving address to get an order delivered). So order fulfilment needs a notice but not a separate consent tick; marketing, WhatsApp promotions, analytics and Meta Pixel need opt-in consent.
- WhatsApp: order updates are service messages tied to the order; promotional broadcasts require opt-in (also WhatsApp Business policy). Keep a record of opt-ins and honour withdrawal. WhatsApp/Meta, Google and payment gateways are Data Processors; need contracts.
- GDPR: applies if you offer goods to people in EU/UK or monitor them; then you need lawful basis, cookie consent (ePrivacy), data-subject rights, possibly an EU representative. Simplest: do not target EU/UK and say so, or comply with a consent banner.

### Gaps
- No primary-source guidance (DPB/MeitY) on cookies exists yet; DPB not operational. GDPR points not sourced here.

## 6. Required legal pages: Privacy Policy and Terms and Conditions

### Takeaway
SPDI Rules (now) require a published privacy policy; DPDP (May 2027) requires a notice at collection. E-Commerce Rules require specific disclosures on the site. Terms are not statutorily scripted but should cover the items below.

### Cited Findings
- DPDP notice must list the data collected, purposes, and how to withdraw consent and complain to the DPB, in plain language and as a standalone notice. — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/); [Seqrite](https://www.seqrite.com/blog/dpdp-rules-are-here-what-changed-from-the-draft/)
- E-Commerce Rules require visible seller details (legal name, address, contact, GSTIN/PAN where applicable), grievance officer details, return/refund terms. — [Mondaq](https://mondaq.com/india/dodd-frank-consumer-protection-act/985606/the-consumer-protection-e-commerce-rules-2020)

### Inferences (practical contents, background knowledge)
- Privacy Policy: who you are and contact; data collected (name, phone, address, email, order data, device/cookie data); purposes; legal basis/consent; sharing with processors (courier, payment gateway, WhatsApp, analytics) and no sale of data; retention periods; user rights (access, correction, erasure, nominate, grievance); how to withdraw consent; security measures; children; cookies; grievance officer name/email; DPB complaint route; policy-change date.
- Terms and Conditions: seller identity; pricing/GST; order acceptance; payment; shipping/delivery; returns/refunds/cancellation; warranties and liability limits; IP; user conduct and review rules; governing law/jurisdiction (India); dispute contact.
- Also commonly published: Return/Refund policy, Shipping policy, Contact page with grievance officer.

### Gaps
- No single authoritative checklist found; items above are practice-based.

## 7. Security minimums, vendor agreements, data localisation

### Takeaway
Use HTTPS, hashed passwords, least-privilege access, logs, backups, and contracts with processors. No general data-localisation rule for ordinary personal data; RBI requires payment-system data stored in India.

### Cited Findings
- DPDP Rule 6 safeguards: encryption/masking/tokenisation, access control, logs, backups; processor contracts with security terms. — [MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)
- Cross-border transfer: permitted subject to restrictions the Government may notify (negative-list approach); special restrictions contemplated for SDFs. — [Shardul Amarchand](https://www.amsshardul.com/insight/enforcement-of-the-dpdp-act-and-notification-of-the-dpdp-rules/); [SS Rana](https://chambers.com/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs)

### Inferences (background knowledge)
- Use a PCI-compliant gateway (Razorpay etc.) so card data never touches your servers; RBI's 2018 circular requires payment system providers to store payment data only in India — that duty falls on the gateway, not the shop.
- Passwords: bcrypt/argon2, never plain text. Admin panel: strong passwords, MFA, separate staff access.
- Fiduciary stays liable for its processors' failures under the Act.

### Gaps
- RBI localisation and PCI-DSS points not sourced in this session.

## 8. Practical minimum compliance checklist for a small shop

### Takeaway
Do now: privacy policy, T&Cs, grievance officer, HTTPS, hashed passwords, consent-gated trackers, incident plan. Do before May 2027: DPDP notice and consent flow, rights/grievance process, breach plan, erasure and one-year log schedule.

### Cited Findings
- Dates driving the checklist: s.43A/SPDI until May 2027; DPDP core duties from 13/14 May 2027; CERT-In 6-hour reporting in force since Jun 2022; E-Commerce Rules grievance timelines (48 hours / 1 month) in force. — sources in sections 1, 3, 4

### Inferences (checklist; practice-based)
1. Now: publish Privacy Policy, T&Cs, Returns/Shipping policies; seller details and a named grievance officer (email and phone) in the footer; reply to complaints in 48 hours, resolve in a month.
2. Now: HTTPS everywhere, hashed passwords, no card data stored, MFA on admin/hosting/Google/Meta/WhatsApp accounts, regular backups, least-privilege staff access.
3. Now: cookie banner with opt-in for GA and Meta Pixel (not legally spelled out in India but cheap and GDPR-ready); collect only needed fields; separate unticked WhatsApp-marketing opt-in with record.
4. Now: written incident plan; know CERT-In email incident@cert-in.org.in and 6-hour clock; keep platform logs.
5. By May 2027: standalone DPDP notice at checkout; consent records and withdrawal; age gate or avoid under-18 profiling; data inventory; processor contracts (courier, payments, WhatsApp, analytics, hosting); 90-day grievance and rights process; 72-hour DPB and user breach drill; retention rules (erase when no longer needed; retain logs one year); update privacy policy to reference DPDP and DPB.
6. Watch: gazette for an advanced deadline; any DPB guidance; s.17(3) startup exemption notification.

### Gaps
- None beyond earlier sections; not legal advice. A lawyer should review the final policies.
