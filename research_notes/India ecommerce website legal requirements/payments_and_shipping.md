# Payments, Checkout and Shipping Rules for a Small Indian E-commerce Site (physical goods), as of October 2026

Method note: about 17 tool calls. One primary RBI source was fetched (PA Master Direction); most other findings come from law-firm, vendor and news explainers surfaced in search snippets. Items from a single secondary source are flagged. Anything not sourced is in Gaps, not Cited Findings.

## 1. RBI Payment Aggregator rules: why use a licensed PA, merchant KYC, card data, PCI DSS, UPI, settlement

### Takeaway
Under RBI's 2025 PA Master Direction, a non-bank PA must be RBI-authorised and hold merchant money in a bank escrow account. The PA does the merchant KYC and security checks. The merchant should therefore use a licensed PA hosted checkout, never store card details, and keep PCI scope minimal. Settlement time is set by the PA-merchant contract; the RBI text does not fix T+1.

### Cited Findings
- RBI's PA Master Direction (RBI id 12896) is effective immediately unless a provision says otherwise. Non-bank PAs must keep merchant funds in a separate escrow account at a scheduled commercial bank, usable only for PA business (para 16(a)). — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- Settlement timelines are set by the PA-merchant agreement, which must be "fair, equitable" and state the timelines transparently. — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896); Vinod Kothari's analysis says the old suggested T+1 was removed from the 2025 text. Some news and vendor summaries still say T+1 is a maximum — [Mondaq](https://www.mondaq.com/india/financial-services/1681402/rbi-rewrites-the-payment-aggregator-rulebook); [Outlook Business](https://www.outlookbusiness.com/news/rbi-issues-new-master-directions-for-payment-aggregators-rules-take-effect-immediately). The primary text matches the "contract decides" reading. In practice, gateways typically offer T+1 to T+3 by contract.
- Merchant KYC: from 1 January 2026 merchants must be onboarded under the Direction's due diligence (para 13(j)). Merchants with annual turnover up to Rs 40 lakh (or export turnover up to Rs 5 lakh) get a simplified process: PAN verification, contact point verification and a certified officially valid document of the proprietor. Larger merchants need full KYC. — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- A secondary source says CKYCR is the preferred KYC route with Video KYC as a fallback, and that existing merchants had to complete KYC by 15 September 2026. I could not confirm that date in the RBI text. — [Mondaq](https://www.mondaq.com/india/financial-services/1681402/rbi-rewrites-the-payment-aggregator-rulebook); [Lexplosion](https://lexplosion.in/rbi-master-direction-2025-compliance-mandate-for-payment-aggregators-and-pa-p-deadline/)
- PAs must run comprehensive security assessment at onboarding and ensure merchant infrastructure complies with standards like PCI-DSS (para 9(a); Annexure 1 paras 1.4, 1.18). — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- Card data: "customer card credentials shall not be stored within the database or the server accessed by the merchant" (Annex 1, para 2.1). — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- Card-on-file tokenisation: RBI barred entities other than card networks and issuers from storing card data; merchants may keep only tokens plus limited details (last four digits, card scheme, issuer name). RBI's press release says the deadline moved to 30 June 2022; other sources say 30 Sept or 1 Oct 2022. — [RBI press release](https://website.rbi.org.in/web/rbi/-/press-releases/reserve-bank-of-india-encourages-cardholders-to-tokenise-their-cards-53920); [HDFC Bank](https://www.hdfc.bank.in/blogs/credit-cards/what-are-the-rbi-guidelines-on-tokenisation-in-india); [Outlook Money](https://www.outlookmoney.com/banking/why-rbi-implemented-card-tokenisation-and-how-it-makes-online-payments-safer); [Cashfree FAQ](https://www.cashfree.com/docs/help/token-vault/faqs)
- Neither PAs nor their merchants may store CoF data; tokenised payments still need AFA. — [Inc42](https://inc42.com/?p=262759)
- Non-bank PAs needed RBI authorisation by 31 Dec 2025 (net worth Rs 15 crore at application, Rs 25 crore by year 3). — [Mondaq](https://www.mondaq.com/india/financial-services/1681402/rbi-rewrites-the-payment-aggregator-rulebook); the Dec 2025 date is consistent with RBI para 5(d)(iii) in [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- PCI DSS: with a fully redirected hosted payment page, the merchant is typically in the lightest self-assessment (SAQ A). PCI SSC removed 6.4.3 and 11.6.1 (payment-page script controls) from SAQ A, effective 31 March 2025, and replaced them with an eligibility criterion that the site is not susceptible to script attacks. This matters mainly for iframe embeds; full redirects are not caught. Sources conflict on details and are vendor blogs. — [Compass IT](https://www.compassitc.com/blog/saq-a-requirements-6.4.3-11.6.1-what-the-eligibility-change-means); [Hyperproof](https://hyperproof.io/resource/pci-dss-4-0-update-new-saq-a-eligibility-criteria/); [TrustedSec](https://trustedsec.com/blog/the-hidden-trap-in-the-pci-dss-saq-a-changes)

### Inferences
- A small seller should pick redirect or the gateway's hosted/standard checkout and never put card fields on its own server. That keeps PCI to a yearly SAQ A, usually handled via the gateway.
- The reason to use a licensed PA: it holds funds in escrow, does KYC, settles under a regulated contract and takes on card-security duties. Note that the RBI list of authorised PAs should be checked before signing up.

### Gaps
- Exact current RBI-published settlement rule beyond "per agreement"; whether the 15 Sept 2026 existing-merchant KYC deadline is in RBI text.
- Specific document lists per gateway (Razorpay, Cashfree, PayU). Typical expectation (not sourced): PAN, ID/address proof, bank account proof, GST certificate if registered, business proof, website with policies.
- UPI Intent vs Collect rules: no source found.

## 2. Additional factor authentication, refunds and failed-transaction TAT, chargebacks

### Takeaway
Since 1 April 2026 all domestic digital payments need two-factor authentication, with a dynamic factor for card-not-present. Refunds go back to the original payment method. Failed-transaction timelines and compensation are set by RBI's 2019 TAT circular; UPI chargebacks follow NPCI rules.

### Cited Findings
- RBI's Authentication Mechanisms for Digital Payment Transactions Directions, 2025 were issued 25 Sept 2025 and took effect 1 April 2026. They require two factors for domestic digital payments, one unique per transaction for card-not-present; SMS OTP remains acceptable, and issuers may add risk-based checks. — [Business Today](https://www.businesstoday.in/amp/personal-finance/news/story/rbi-issues-new-guidelines-on-digital-payment-authentication-effective-april-2026-495758-2025-09-25); [Business Standard](https://www.business-standard.com/amp/finance/news/rbi-two-factor-authentication-digital-payments-guidelines-2026-125092501154_1.html); [RBI notification](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12898)
- Cross-border card-not-present transactions: issuers must validate the additional factor when the overseas merchant or acquirer requests it. — [Business Today](https://www.businesstoday.in/amp/personal-finance/news/story/rbi-issues-new-guidelines-on-digital-payment-authentication-effective-april-2026-495758-2025-09-25)
- Refunds must go to the original payment method unless the payer instructs otherwise (para 10(f)). — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- RBI TAT harmonisation (circular DPSS.CO.PD No.629, 20 Sept 2019, effective 15 Oct 2019): examples include auto-reversal within T+5 for card POS failures, T+5 for ATM cash-not-dispensed, T+1 for card-to-card; Rs 100 per day compensation after the deadline; escalation to the RBI Integrated Ombudsman. — [TaxGuru](https://taxguru.in/rbi/banks-pay-compensation-customer-failed-transactions.html); [NPCI circular](https://www.npci.org.in/PDF/npci/imps/circular/2019/IMPS-UPI-I-OC-93-I-FY-19-20-I-Harmonisation-of-Turn-Around-Time(TAT)-and-customer-compensation-for-failed-transaction.pdf)
- Secondary sources report T+5 for UPI merchant payment failures and T+1 for P2P; these are blog-level and unverified. — [PhonePe Business](https://business.phonepe.com/articles/upi-transaction-failed-but-money-deducted-complete-resolution-guide)
- UPI chargebacks: NPCI circular 213 (effective 15 Feb 2025) changed auto-accept/reject to follow the beneficiary bank's TCC/return in the next settlement cycle (bulk upload and UDIR only). An older 2019 NPCI circular gave acquirers a T+4 window for reason code 1065; whether that still holds is unconfirmed. — [NPCI circular 213](https://npci.org.in/PDF/npci/upi/circular/2025/UPI-OC-No-213-FY-2024-25-Auto-Acceptance-Rejection-of-Chargeback.pdf); [Angel One](https://www.angelone.in/news/npci-introduces-new-chargeback-rule-for-upi-transactions)

### Inferences
- A merchant should refund within a few days via the gateway dashboard and expect the bank to credit in about 5 to 7 working days. This 5 to 7 day figure is common practice, not sourced here.
- Keep order records, delivery proof and communication to contest card and UPI chargebacks.

### Gaps
- Card chargeback timelines (Visa/Mastercard rules, typically 120 days) not sourced.
- Whether the 2019 TAT circular has been superseded for PA refunds.

## 3. Cash on Delivery, GST and fraud/RTO

### Takeaway
I found no India-specific law that bans or regulates COD for a small seller. Treat COD as a normal sale, with the same GST invoice and price disclosure; RTO and fraud risk is a commercial issue.

### Cited Findings
- GST registration: threshold Rs 40 lakh for goods; Section 24 requires compulsory registration for persons supplying through e-commerce operators regardless of turnover. A June 2022 GST Council decision waived registration for small marketplace sellers with no inter-state supply, effective 1 Jan 2023. — [Echai](https://echai.ventures/d2c/d2c-gst-multistate/do-i-need-gst-to-sell-online); [Inc42](https://inc42.com/?p=318536); [Business Today](https://www.businesstoday.in/industry/story/gst-councils-decision-to-help-small-e-commerce-sellers-nasscom-339909-2022-06-30)
- Composition taxpayers (up to Rs 1.5 crore) can make only local sales; normal taxpayers can sell inter-state. — [DMI Finance](https://www.dmifinance.in/gst-for-e-commerce-sellers-in-india/)
- Consumer Protection (E-Commerce) Rules require sellers to disclose modes of payment, delivery, returns and refunds, and not to impose cancellation charges unless they would bear similar ones. — [Khaitan](https://khaitanco.com/sites/default/files/2020-08/Stricter%20Regulations%20on%20E-Commerce%20%E2%80%93%20The%20Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf); [The Week](https://www.theweek.in/news/biz-tech/2020/07/25/govt-notifies-new-rules-for-e-commerce-entities.html)

### Inferences
- An own-website seller shipping to other states likely needs regular GST registration once any inter-state sale occurs (the waiver excludes inter-state supply). The sources do not address own-website sellers directly, so confirm with a CA.
- A COD fee shown at checkout should be disclosed up front as part of the price breakdown; GST treatment of the fee is not sourced (probably part of the taxable value of the supply, verify).

### Gaps
- GST treatment of a COD handling fee; legal cash-handling limits (Income Tax Act s.269ST caps cash receipts at Rs 2 lakh per transaction, from general knowledge, not verified here).
- RTO rates and COD fraud statistics; no sourced figures. Common mitigation (unsourced): phone/OTP confirmation, prepaid incentives, pincode serviceability checks.

## 4. Personal UPI/bank account vs gateway: legal and tax risk

### Takeaway
Receiving business payments on a personal UPI ID is not the same as being unregistered for GST, but UPI data is used by tax authorities, and unregistered sellers have received notices. A gateway or business account gives clean records.

### Cited Findings
- Karnataka's Commercial Tax Department used UPI records to identify about 14,000 unregistered businesses, and some traders got notices from 2021-22; the government said liability depends on annual turnover, not payment mode. — [Gulf News](https://gulfnews.com/business/banking/is-upi-in-india-at-risk-cash-only-signs-return-as-some-shops-reject-e-payments-1.500212724); [Outlook Business](https://www.outlookbusiness.com/amp/story/ampstories/news/no-upi-only-cash-gst-notices-prompt-vendors-to-reject-digital-payments-heres-what-led-to-it)
- Digital payment data is cross-checked against income tax filings; business receipts are taxable. — [Kanakku Pillai](https://www.kanakkupillai.com/learn/gst-notice-for-upi-transaction-without-gst-registration/); [Razorpay](https://razorpay.com/learn/gst-on-upi-payments/)
- Advice: separate personal and business receipts, ideally with a dedicated merchant account. — [Legal Raasta](https://www.legalraasta.com/blog/gst-on-upi-payments/) (low-authority blog)

### Inferences
- The RBI PA framework is designed so that e-commerce collections run through a regulated PA with escrow; collecting a website's payments straight into a personal account bypasses KYC, refund and dispute protections and can look like unreported turnover.

### Gaps
- No source on NPCI rules about business use of personal UPI IDs or on penalties.

## 5. Invoices, GST and price display

### Takeaway
Registered sellers issue a GST tax invoice (composition dealers and exempt sellers issue a bill of supply). Show MRP/price inclusive of taxes, with shipping and other charges itemised up front.

### Cited Findings
- E-invoicing threshold is Rs 5 crore aggregate turnover (since 1 Aug 2023, Notification 10/2023); a July 2026 guide says no newer notification has lowered it. Small sellers below this do not need e-invoicing. — [Fonoa](https://fonoa.com/blog/india-lowers-e-invoicing-threshold-to-inr-50-million); [Patron Accounting](https://www.patronaccounting.com/blog/eway-bill-einvoicing-traders)
- Bill of supply: issued by composition dealers and for exempt supplies; must carry the line "composition taxable person, not eligible to collect tax on supplies"; fields include supplier details, unique serial number, date, HSN/accounting code and value. — [ClearTax](https://cleartax.in/s/gst-bill-of-supply); [Teachoo](https://www.teachoo.com/6008/1958/Invoice-to-be-issued-by-Composition-Dealer-in-GST/category/Composition-Scheme-in-GST/)
- Price: platforms must show the total price with a breakup of other charges; sellers must give details including pricing, expiry, country of origin, returns, refunds, delivery to the platform. — [Khaitan summary via The Week](https://www.theweek.in/news/biz-tech/2020/07/25/govt-notifies-new-rules-for-e-commerce-entities.html); [IndiaCorpLaw](https://indiacorplaw.in/?p=10190)
- Legal Metrology (Packaged Commodities) Rules: MRP must be inclusive of all taxes; dual MRP prohibited; e-commerce must show MRP, expiry and country of origin online (effective Jan 2018). Enforced by state Legal Metrology controllers. — [S.S. Rana](https://ssrana.in/corporate-laws/legal-metrology-and-packaging/); [Medianama](https://www.medianama.com/2017/07/223-ecommerce-marketplace-mrp-expiry-date-january-2018/); [India Briefing](https://www.india-briefing.com/news/consumer-protection-india-lm-rules-now-apply-e-commerce-notified-medical-devices-16587.html)

### Gaps
- HSN digit requirement for small B2C sellers: sources conflicted (one says none up to Rs 1.5 crore, 2 digits to Rs 5 crore, 4 digits above); verify against the CBIC notification.
- Composition limit for 2026 (sources say Rs 1.5 crore; not confirmed for 2026).

## 6. Shipping, delivery obligations, transit damage, e-way bill

### Takeaway
The E-commerce Rules require seller disclosures and refunds for late or defective goods, plus a grievance officer. Specific delivery deadlines and a 14-day refund rule were not found in the sources. E-way bill applies above Rs 50,000 consignment value.

### Cited Findings
- Sellers must not refuse return or refund where goods are defective, deficient, spurious, or delivered late against the stated schedule, except for unavoidable causes. Grievance officer must acknowledge within 48 hours and resolve within one month. — [Mondaq](https://mondaq.com/india/dodd-frank-consumer-protection-act/985606/the-consumer-protection-e-commerce-rules-2020); [Legal500](https://legal500.com/developments/?p=26777)
- Rules apply to e-retailers in India or abroad serving Indian consumers; violations are penalised under the Consumer Protection Act 2019. — [The Week](https://www.theweek.in/news/biz-tech/2020/07/25/govt-notifies-new-rules-for-e-commerce-entities.html)
- E-way bill: needed for consignments above Rs 50,000; from March 2024 businesses above Rs 5 crore cannot generate a B2B e-way bill without e-invoice details. — [VATcalc](https://www.vatcalc.com/india/india-lowers-e-invoice-threshold-to-20-cores-april-2022/); [Deccan Herald](https://www.deccanherald.com/business/e-way-bill-generation-without-b2b-e-invoice-details-to-be-blocked-from-march-1-2837978)
- Carriers Act 1865 reportedly makes a common carrier liable for loss or damage caused by its negligence; single weak source. — [righttoinformation.wiki](https://righttoinformation.wiki/cod-fraud-parcel-complaint-india)

### Inferences
- The seller is the contracting party to the consumer, so for transit damage the buyer's remedy is against the seller, who then claims from the courier. Courier aggregators (Shiprocket, Delhivery etc.) and optional shipping insurance help; this is practical advice, not sourced.

### Gaps
- The 14-day refund figure, any mandatory delivery period, and rules on disclosing shipping charges beyond the price breakup: not confirmed; need the Gazette text.
- Courier aggregator comparison and Carriers Act applicability to couriers: not researched.

## 7. International shipping (brief)

### Cited Findings
- IEC is mandatory for commercial exports, not for bona fide personal shipments; authorised couriers file the shipping bill (CSB-V). DHL says the Rs 10 lakh courier export cap was removed in early 2026 (single vendor source, verify). IEC is described as lifetime and PAN-linked by most sources; one says annual renewal. — [DHL India](https://www.dhl.com/discover/en-in/ship-with-dhl/export-with-dhl/required-export-documents); [Shiprocket](https://www.shiprocket.in/blog/import-export-code-iec-india/); [Winvesta](https://www.winvesta.in/blog/businesses/what-is-an-iec-code-how-do-exporters-benefit-from-it)
- Cross-border card-not-present payments require AFA when the overseas merchant requests it. — [Business Today](https://www.businesstoday.in/amp/personal-finance/news/story/rbi-issues-new-guidelines-on-digital-payment-authentication-effective-april-2026-495758-2025-09-25)

### Gaps
- Foreign currency receipts: PA-CB rules, AD bank codes, FIRC and GST zero-rating (LUT) were not sourced. Customs duty of the destination country not covered.

## 8. Fraud and security checklist, and prohibited items (brief)

### Cited Findings
- PAs require merchants to meet PCI-DSS-type standards and never store card credentials. — [RBI Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- Prohibited or licence-restricted categories per one law-firm blog: prescription drugs (licensed pharmacies only), tobacco promotion barred under COTPA 2003, wildlife products banned under the Wildlife Protection Act 1972, firearms under the Arms Act 1959. — [Sansa Legal](https://www.sansalegal.com/post/e-commerce-platform-compliance-restricted-product-guidelines-1)

### Inferences
- Reasonable minimum (general practice, not sourced): HTTPS everywhere, gateway-hosted payment page, 2FA and strong passwords on admin, least-privilege staff access, webhook signature verification, no card data or unnecessary customer data in logs, regular backups. Customer personal data also falls under the DPDP Act 2023, which was not researched here.

### Gaps
- E-cigarettes (banned by the 2019 Act, from general knowledge), counterfeit goods, lottery and other lists were not confirmed by search. DPDP Act obligations and the status of its Rules in Oct 2026 were not researched.
