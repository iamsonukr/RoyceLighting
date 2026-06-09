import { LEGAL_CONTACT, LegalPolicy } from '@/components/legal/PolicyPage';

const LAST_UPDATED = '9 June 2026';

export const privacyPolicy: LegalPolicy = {
  title: 'Privacy Policy',
  description:
    'This Privacy Policy explains how Royce Lighting collects, uses, protects, and shares customer information when you browse, enquire, purchase, or request custom decorative lighting products from us.',
  effectiveDate: LAST_UPDATED,
  lastUpdated: LAST_UPDATED,
  summary: [
    'We collect customer, order, payment status, delivery, and communication information needed to operate an online lighting business.',
    'Card, UPI, net banking, and wallet details are processed by authorised payment gateways and are not stored by us.',
    'We use information to process orders, create GST invoices, arrange shipping, provide customer support, prevent fraud, and comply with Indian law.',
    'Customers may contact us to request access, correction, withdrawal of consent, or grievance support, subject to legal and order-processing requirements.',
  ],
  sections: [
    {
      id: 'scope',
      title: 'Scope and Applicability',
      blocks: [
        {
          type: 'paragraph',
          text: `This Privacy Policy applies to ${LEGAL_CONTACT.brandName}, an online premium decorative lighting brand operated by ${LEGAL_CONTACT.companyName}. It covers information collected through our website, online store, payment links, marketplaces or social commerce channels controlled by us, customer support channels, design consultations, order forms, invoices, delivery partners, and related communications.`,
        },
        {
          type: 'paragraph',
          text: 'By using our website, submitting an enquiry, creating an account, placing an order, making a payment, or communicating with our team, you agree to the collection and use of information in accordance with this Privacy Policy. If you provide information on behalf of another person, business, architect, designer, contractor, or client, you confirm that you are authorised to do so.',
        },
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      blocks: [
        {
          type: 'subsection',
          title: 'Customer and Contact Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'We may collect your name, company name, billing name, shipping name, email address, mobile number, alternate phone number, billing address, shipping address, city, state, PIN code, GST number where provided, and any details needed to identify and contact you regarding an order or enquiry.',
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Order, Product, and Project Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'We collect order details such as selected chandeliers, pendant lights, wall lights, table lamps, custom finishes, sizes, quantities, project requirements, installation location, site constraints, delivery instructions, invoice preferences, and product customisation requests.',
            },
            {
              type: 'paragraph',
              text: 'For bespoke or made-to-order lighting, you may voluntarily share room photographs, ceiling height, electrical points, drawings, mood boards, finish references, project timelines, or other information required to understand the design and production brief.',
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Payment and Transaction Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'When you pay online, authorised payment gateways such as Razorpay, Cashfree, PayU, banks, card networks, UPI service providers, wallet providers, or similar regulated service providers process the payment information. We may receive and store payment confirmation status, transaction ID, order ID, payment mode, invoice amount, refund reference, tax information, and fraud-risk flags where shared by the payment provider.',
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Technical and Usage Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'We may collect IP address, device type, browser type, operating system, pages viewed, search terms, referral source, cookie identifiers, approximate location based on IP address, and website interaction data to maintain security, improve performance, understand shopping behaviour, and prevent misuse.',
            },
          ],
        },
      ],
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Customer Information',
      blocks: [
        {
          type: 'list',
          items: [
            'To register enquiries, create customer accounts, confirm orders, and provide order updates.',
            'To process payments, verify transaction status, generate invoices, and manage refunds or chargeback responses.',
            'To procure, manufacture, customise, inspect, pack, dispatch, deliver, repair, replace, or service lighting products.',
            'To coordinate with logistics providers, installers, vendors, artisans, suppliers, warehouses, customer support teams, and payment gateway partners.',
            'To respond to complaints, warranty claims, damaged-product reports, return requests, and post-delivery support requests.',
            'To comply with GST, accounting, audit, tax, consumer protection, payment gateway, fraud-prevention, and other legal obligations in India.',
            'To send important transactional communications by email, SMS, WhatsApp, phone, or courier, including order confirmations, payment reminders, delivery notifications, and service updates.',
            'To send marketing or promotional communication only where permitted by law or where you have opted in or have an existing customer relationship, subject to your right to opt out.',
          ],
        },
      ],
    },
    {
      id: 'payment-security',
      title: 'Payment Gateway and Financial Data Security',
      blocks: [
        {
          type: 'paragraph',
          text: 'We do not store full credit card numbers, debit card numbers, CVV, UPI PIN, net banking passwords, wallet passwords, or other sensitive authentication credentials on our servers. Such information is entered directly into secure payment gateway or banking interfaces.',
        },
        {
          type: 'paragraph',
          text: 'Payment gateways may process data according to their own terms, privacy policies, RBI guidelines, NPCI rules, card-network requirements, and applicable Indian law. We recommend reviewing the relevant payment provider policies before completing a transaction.',
        },
        {
          type: 'note',
          text: 'Refunds, where approved, are normally issued to the original payment method or to another legally permitted channel where required by the payment provider, bank, or applicable law.',
        },
      ],
    },
    {
      id: 'sharing-disclosure',
      title: 'Sharing and Disclosure of Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We share customer information only to the extent required to operate the business, complete transactions, protect our rights, and comply with legal duties. We do not sell customer personal information.',
        },
        {
          type: 'list',
          items: [
            'Payment gateways, banks, UPI providers, fraud-prevention partners, and refund processors for payment verification and settlement.',
            'Courier companies, surface cargo carriers, warehouse teams, packaging vendors, installation partners, and service technicians for order fulfilment.',
            'Manufacturers, artisans, finish vendors, component suppliers, and quality-control teams for made-to-order or custom lighting products.',
            'Technology, analytics, hosting, CRM, email, SMS, WhatsApp, and customer support providers who help us operate the website and customer communications.',
            'Professional advisers, auditors, accountants, insurers, dispute-resolution forums, regulators, courts, law-enforcement agencies, or government authorities where required.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies, Analytics, and Communication Preferences',
      blocks: [
        {
          type: 'paragraph',
          text: 'Our website may use cookies, pixels, tags, and analytics tools to remember cart details, maintain sessions, measure website performance, understand product interest, and improve browsing experience. You can control cookies through your browser settings, but some features may not work correctly if cookies are disabled.',
        },
        {
          type: 'paragraph',
          text: 'You may unsubscribe from promotional emails or request that we stop non-essential marketing communication. Transactional messages relating to payments, invoices, shipping, delivery, service, warranty, or legal notices may still be sent where necessary.',
        },
      ],
    },
    {
      id: 'retention-security',
      title: 'Data Retention and Security',
      blocks: [
        {
          type: 'paragraph',
          text: 'We retain customer information for as long as necessary to fulfil orders, provide support, comply with GST and tax record requirements, resolve disputes, prevent fraud, enforce agreements, and meet payment gateway or legal retention requirements.',
        },
        {
          type: 'paragraph',
          text: 'We use reasonable administrative, technical, and organisational measures to protect information against unauthorised access, loss, misuse, alteration, and disclosure. No online transmission or storage system can be guaranteed to be completely secure, and customers should use secure devices, passwords, and networks when transacting online.',
        },
      ],
    },
    {
      id: 'customer-rights',
      title: 'Customer Rights and Grievance Support',
      blocks: [
        {
          type: 'paragraph',
          text: 'Subject to applicable Indian law, including the Digital Personal Data Protection Act, 2023 as and when operational rules apply, you may request access, correction, update, deletion, withdrawal of consent, or grievance support regarding your personal data.',
        },
        {
          type: 'paragraph',
          text: `Requests may be sent to ${LEGAL_CONTACT.email} with your name, contact number, order ID where applicable, and a clear description of the request. We may verify your identity before acting on a request. Withdrawal or deletion requests may affect our ability to process pending orders, invoices, warranty support, refunds, legal claims, or statutory records.`,
        },
      ],
    },
    {
      id: 'children',
      title: 'Children and Minor Users',
      blocks: [
        {
          type: 'paragraph',
          text: 'Our products and services are intended for adults and businesses capable of entering legally binding contracts. We do not knowingly collect personal information from children. If you believe a minor has provided information without appropriate consent, please contact us for review.',
        },
      ],
    },
    {
      id: 'updates-contact',
      title: 'Policy Updates and Contact Details',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time to reflect changes in our business, website features, payment partners, legal obligations, or operational practices. The updated version will be posted on this page with a revised last updated date.',
        },
        {
          type: 'paragraph',
          text: `For privacy questions, data requests, or grievances, contact ${LEGAL_CONTACT.brandName} at ${LEGAL_CONTACT.email}, ${LEGAL_CONTACT.phone}, or ${LEGAL_CONTACT.registeredAddress}. Support timings: ${LEGAL_CONTACT.supportTimings}.`,
        },
      ],
    },
  ],
};

export const termsPolicy: LegalPolicy = {
  title: 'Terms & Conditions',
  description:
    'These Terms & Conditions govern browsing, enquiries, purchases, payments, shipping, custom orders, installation support, and use of the Royce Lighting website and services.',
  effectiveDate: LAST_UPDATED,
  lastUpdated: LAST_UPDATED,
  summary: [
    'Orders are accepted only after payment verification, stock confirmation, and our written order confirmation.',
    'Ready-stock items and made-to-order or custom lighting products may follow different timelines, cancellation rights, and refund rules.',
    'Product images, finishes, dimensions, and colours are represented as accurately as possible, but handcrafted lighting may have reasonable variations.',
    'Indian law governs these Terms, with dispute resolution and jurisdiction linked to the registered office or the court location stated by the company.',
  ],
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      blocks: [
        {
          type: 'paragraph',
          text: `These Terms & Conditions are a binding agreement between you and ${LEGAL_CONTACT.companyName}, operating the brand ${LEGAL_CONTACT.brandName}. By accessing the website, submitting an enquiry, creating an account, placing an order, making a payment, accepting delivery, or using our services, you agree to these Terms, our Privacy Policy, Refund & Cancellation Policy, Shipping & Delivery Policy, and any product-specific terms communicated to you.`,
        },
        {
          type: 'paragraph',
          text: 'If you do not agree with these Terms, you should not use the website or place an order. These Terms apply to retail customers, trade customers, interior designers, architects, contractors, procurement teams, businesses, and any person buying on behalf of another person or organisation.',
        },
      ],
    },
    {
      id: 'business-details',
      title: 'Business and Legal Details',
      blocks: [
        {
          type: 'table',
          headers: ['Particular', 'Details'],
          rows: [
            ['Brand', LEGAL_CONTACT.brandName],
            ['Operating Entity', LEGAL_CONTACT.companyName],
            ['GSTIN', LEGAL_CONTACT.gstNumber],
            ['Registered Address', LEGAL_CONTACT.registeredAddress],
            ['Email', LEGAL_CONTACT.email],
            ['Phone', LEGAL_CONTACT.phone],
            ['Support Timings', LEGAL_CONTACT.supportTimings],
          ],
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'Eligibility, Accounts, and Customer Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must be at least 18 years old and legally competent to enter into a contract under Indian law. If you place an order for a company, project, client, family member, or third party, you represent that you have authority to do so.',
        },
        {
          type: 'paragraph',
          text: 'You are responsible for providing accurate account, billing, GST, shipping, phone, email, project, and payment information. We are not responsible for delays, failed deliveries, incorrect invoices, or additional costs caused by inaccurate or incomplete information provided by you.',
        },
      ],
    },
    {
      id: 'products',
      title: 'Products, Descriptions, and Availability',
      blocks: [
        {
          type: 'paragraph',
          text: 'Royce Lighting sells decorative lighting products including chandeliers, pendant lights, wall lights, table lamps, ceiling lights, bespoke lighting, and related accessories. Products may be ready-stock, pre-order, made-to-order, customised, imported, vendor-supplied, or project-specific depending on the listing and written confirmation.',
        },
        {
          type: 'list',
          items: [
            'Product images are for representation and may vary due to screen settings, photography lighting, natural material differences, hand finishing, glass shade variations, crystal arrangement, or production batches.',
            'Dimensions, weight, wattage, colour temperature, finish, cord length, chain length, canopy details, and installation recommendations are provided in good faith and may have reasonable tolerances.',
            'Stock availability may change due to showroom sale, vendor availability, quality inspection failure, production constraints, or payment verification delay.',
            'We may correct product information, pricing, availability, or typographical errors before accepting an order.',
          ],
        },
      ],
    },
    {
      id: 'custom-orders',
      title: 'Ready-Stock, Made-to-Order, and Custom Products',
      blocks: [
        {
          type: 'paragraph',
          text: 'Ready-stock products are products currently available for dispatch after order verification and quality check. Made-to-order and custom products are produced, modified, finished, imported, configured, or reserved specifically for your order.',
        },
        {
          type: 'paragraph',
          text: 'Custom lighting may include changes to size, finish, height, colour, glass, crystal pattern, wiring, dimming compatibility, design proportion, site measurements, project schedule, or other specifications. Such orders may require an advance, milestone payment, written approval, design confirmation, or additional production time.',
        },
        {
          type: 'note',
          text: 'Cancellation, return, and refund rules for made-to-order and custom products are stricter because materials, labour, procurement, finishing, and production slots may be committed specifically for your order.',
        },
      ],
    },
    {
      id: 'pricing-payments',
      title: 'Pricing, GST, Invoices, and Payments',
      blocks: [
        {
          type: 'paragraph',
          text: 'Prices are listed in Indian Rupees unless stated otherwise. Prices may include or exclude GST, shipping, installation, packing, insurance, handling, or project service charges depending on the product page, quotation, invoice, or checkout summary.',
        },
        {
          type: 'list',
          items: [
            'Online payments may be processed through authorised payment gateways such as Razorpay, Cashfree, PayU, UPI, net banking, cards, wallets, EMI providers, or bank transfers, subject to gateway availability.',
            'An order is not confirmed merely because a customer has added a product to cart or initiated payment. Confirmation is subject to successful payment, stock or production feasibility, fraud checks, and written order acceptance.',
            'For custom, made-to-order, high-value, or project orders, we may require partial advance payment, balance payment before dispatch, or milestone payments as communicated in writing.',
            'GST invoices will be issued based on the billing details shared by you. Changes to GST details after invoice generation may not be possible if restricted by law or accounting rules.',
            'Payment gateway fees, bank charges, convenience fees, EMI interest, currency conversion charges, or failed transaction charges may be governed by the relevant provider.',
          ],
        },
      ],
    },
    {
      id: 'order-processing',
      title: 'Order Processing and Company Cancellation Rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'After receiving an order, we may verify payment, confirm customer details, review inventory, conduct quality checks, confirm production feasibility, and contact you for missing information. We may refuse or cancel an order before dispatch or production if payment is not verified, stock is unavailable, the product is mispriced, the order appears fraudulent, delivery is not serviceable, or fulfilment is commercially or legally impracticable.',
        },
        {
          type: 'paragraph',
          text: 'If we cancel an order after receiving payment and no product has been delivered, we will initiate an eligible refund according to our Refund & Cancellation Policy and payment provider timelines.',
        },
      ],
    },
    {
      id: 'shipping-delivery',
      title: 'Shipping, Delivery, and Inspection',
      blocks: [
        {
          type: 'paragraph',
          text: 'Shipping timelines depend on order type, payment verification, product availability, production time, quality inspection, packaging requirements, courier serviceability, and destination. Large chandeliers, fragile glass items, or project shipments may require specialised surface logistics and may take longer than standard parcels.',
        },
        {
          type: 'paragraph',
          text: 'Customers must inspect packaging at delivery and report visible damage, shortage, wrong item, or transit breakage within the timelines stated in our Refund & Cancellation Policy and Shipping & Delivery Policy. Installation or use of a product may affect return or replacement eligibility.',
        },
      ],
    },
    {
      id: 'installation',
      title: 'Installation, Electrical Safety, and Site Readiness',
      blocks: [
        {
          type: 'paragraph',
          text: 'Unless expressly included in writing, installation, civil work, ceiling reinforcement, electrical wiring, scaffolding, ladders, lift access, electrician charges, and site modifications are not included in product prices. Lighting products must be installed by qualified electricians or trained technicians according to applicable safety standards.',
        },
        {
          type: 'list',
          items: [
            'Customers are responsible for ensuring ceiling strength, electrical compatibility, driver placement, dimmer compatibility, voltage suitability, and site access before installation.',
            'Damage caused by incorrect installation, improper wiring, voltage fluctuation, unauthorised repair, misuse, water ingress, poor maintenance, or site conditions is not treated as a product defect.',
            'Where installation support is arranged by us, it may be subject to separate service charges, appointment availability, city serviceability, and site-readiness requirements.',
          ],
        },
      ],
    },
    {
      id: 'returns-warranty',
      title: 'Returns, Refunds, and Warranty',
      blocks: [
        {
          type: 'paragraph',
          text: 'Returns, cancellations, replacements, and refunds are governed by our Refund & Cancellation Policy. Shipping timelines and delivery issues are governed by our Shipping & Delivery Policy. Warranty, if any, is product-specific and limited to manufacturing defects expressly covered by the product page, invoice, warranty card, or written confirmation.',
        },
        {
          type: 'paragraph',
          text: 'Warranty does not cover normal wear and tear, bulbs or consumables unless specifically stated, finish ageing, minor handcrafted variations, glass shade differences, damage during installation, incorrect use, voltage surge, unauthorised modification, accidental breakage, cleaning damage, water damage, or damage caused by third-party electricians or installers.',
        },
      ],
    },
    {
      id: 'user-obligations',
      title: 'User Obligations and Prohibited Conduct',
      blocks: [
        {
          type: 'list',
          items: [
            'Do not use the website for fraudulent, unlawful, abusive, misleading, or harmful activity.',
            'Do not upload or share false payment screenshots, incorrect tax details, unauthorised design files, infringing images, malware, or abusive content.',
            'Do not copy, scrape, reproduce, or commercially exploit website content, product images, catalogue data, pricing, design concepts, or brand assets without written permission.',
            'Do not interfere with website security, payment systems, order processing, or other users.',
          ],
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      blocks: [
        {
          type: 'paragraph',
          text: 'All website content, brand names, logos, product photographs, catalogue descriptions, design concepts, layouts, graphics, videos, text, and other materials are owned by or licensed to Royce Lighting. No intellectual property rights are transferred to you except the limited right to view and use the website for personal or authorised business purchasing purposes.',
        },
        {
          type: 'paragraph',
          text: 'Custom design discussions, renders, technical suggestions, sketches, product modifications, and project concepts shared by us remain our intellectual property unless a written agreement states otherwise.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, Royce Lighting and its owners, directors, employees, vendors, suppliers, logistics partners, and service providers will not be liable for indirect, incidental, special, punitive, or consequential losses, including loss of profit, project delay, business interruption, interior work delay, or loss of goodwill.',
        },
        {
          type: 'paragraph',
          text: 'Our total liability for any claim relating to a product or order will not exceed the amount actually paid by you for the specific product giving rise to the claim, except where a higher liability cannot be excluded under applicable law.',
        },
      ],
    },
    {
      id: 'force-majeure',
      title: 'Force Majeure',
      blocks: [
        {
          type: 'paragraph',
          text: 'We are not responsible for delay or failure caused by events beyond reasonable control, including natural disasters, fire, flood, pandemic, strikes, labour shortage, transport disruption, port or customs delay, supplier failure, power outage, cyber incident, government restriction, war, civil disturbance, or payment gateway outage.',
        },
      ],
    },
    {
      id: 'dispute-resolution',
      title: 'Governing Law and Dispute Resolution',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms are governed by the laws of India. The parties will first attempt to resolve disputes through good-faith customer support escalation. If unresolved, disputes will be subject to the courts, consumer forums, or arbitration venue having jurisdiction over the registered office city of the operating entity, unless applicable law requires a different forum.',
        },
        {
          type: 'paragraph',
          text: `For escalation, contact ${LEGAL_CONTACT.email} with your order ID, contact details, invoice copy, photographs where relevant, and a clear description of the concern.`,
        },
      ],
    },
  ],
};

export const refundPolicy: LegalPolicy = {
  title: 'Refund & Cancellation Policy',
  description:
    'This Refund & Cancellation Policy explains how cancellations, returns, damaged products, replacements, and refunds are handled for ready-stock, made-to-order, and custom luxury lighting orders.',
  effectiveDate: LAST_UPDATED,
  lastUpdated: LAST_UPDATED,
  summary: [
    'Ready-stock orders may usually be cancelled before dispatch, subject to order status and payment gateway settlement.',
    'Made-to-order and custom products may be cancelled only within a limited window before procurement or production starts, and committed costs may be deducted.',
    'Damaged, wrong, or missing products must be reported promptly with photographs, packaging images, and an unboxing video wherever possible.',
    'Approved refunds are processed after verification and inspection, normally to the original payment method within stated banking and gateway timelines.',
  ],
  sections: [
    {
      id: 'scope',
      title: 'Scope of This Policy',
      blocks: [
        {
          type: 'paragraph',
          text: `This policy applies to products purchased from ${LEGAL_CONTACT.brandName}, including decorative lights, chandeliers, pendant lights, wall lights, table lamps, ceiling lights, custom lighting, spare parts, accessories, and related order services. It should be read together with our Terms & Conditions, Shipping & Delivery Policy, Privacy Policy, invoice, quotation, and product-specific terms.`,
        },
      ],
    },
    {
      id: 'order-categories',
      title: 'Order Categories and General Rules',
      blocks: [
        {
          type: 'table',
          headers: ['Order Type', 'Meaning', 'Cancellation and Refund Position'],
          rows: [
            [
              'Ready-stock products',
              'Products available for quality check and dispatch from our inventory or confirmed vendor inventory.',
              'Cancellation may be accepted before dispatch. Returns may be considered as stated in this policy.',
            ],
            [
              'Made-to-order products',
              'Products manufactured, assembled, finished, imported, or procured after your order confirmation.',
              'Cancellation and refund eligibility is limited once procurement, production, finishing, or reservation begins.',
            ],
            [
              'Custom or bespoke products',
              'Products modified or designed for your specifications, site, finish, size, colour, height, wiring, or project requirement.',
              'Generally non-cancellable and non-returnable after approval, advance payment, procurement, or production commencement.',
            ],
            [
              'Clearance, sale, or final-sale products',
              'Products sold at special pricing, liquidation pricing, display condition, or limited warranty terms.',
              'Return and cancellation may be restricted and will be governed by the product page or written sale terms.',
            ],
          ],
        },
      ],
    },
    {
      id: 'customer-cancellation',
      title: 'Cancellation by Customer',
      blocks: [
        {
          type: 'subsection',
          title: 'Before Order Confirmation',
          blocks: [
            {
              type: 'paragraph',
              text: 'If payment is initiated but order confirmation is not issued because payment failed, stock is unavailable, or fulfilment is not possible, any amount received by us will be refunded after payment gateway reconciliation.',
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Ready-Stock Products',
          blocks: [
            {
              type: 'paragraph',
              text: 'Cancellation requests for ready-stock products should be raised as early as possible and preferably within 24 hours of order placement. If the product has not been packed, handed to a courier, dispatched, or reserved under a special arrangement, we may approve cancellation and initiate a refund after deducting applicable non-refundable charges, if any.',
            },
          ],
        },
        {
          type: 'subsection',
          title: 'Made-to-Order and Custom Products',
          blocks: [
            {
              type: 'paragraph',
              text: 'Made-to-order and custom products may be cancelled only if the request is received before design approval, material procurement, production scheduling, finishing, import booking, vendor confirmation, or any other committed cost. Once work has started, cancellation may be declined or eligible refund may be reduced by committed costs, design charges, labour, material, payment gateway charges, logistics charges, and taxes where applicable.',
            },
            {
              type: 'note',
              text: 'Custom-made lighting products are generally non-returnable and may be partly or fully non-refundable once production or procurement begins.',
            },
          ],
        },
        {
          type: 'paragraph',
          text: `To request cancellation, contact ${LEGAL_CONTACT.email} or ${LEGAL_CONTACT.phone} with your order ID, payment reference, registered phone number, and reason for cancellation.`,
        },
      ],
    },
    {
      id: 'company-cancellation',
      title: 'Cancellation by Royce Lighting',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may cancel an order if payment is not verified, product availability changes, the product fails quality inspection, delivery location is not serviceable, pricing or catalogue information contains an error, customer information is incomplete, suspected fraud or misuse is detected, or fulfilment becomes commercially or legally impracticable.',
        },
        {
          type: 'paragraph',
          text: 'If we cancel an eligible order after receiving payment and before delivery, we will initiate a refund for the amount received, subject to deductions required by law, payment gateway rules, or agreed non-refundable charges.',
        },
      ],
    },
    {
      id: 'returns',
      title: 'Return Eligibility',
      blocks: [
        {
          type: 'paragraph',
          text: 'Lighting products are fragile, installation-sensitive, and often finish-specific. Return eligibility is therefore limited. A return request does not automatically mean the return is accepted. Approval depends on order type, product condition, original packaging, installation status, and verification by our team.',
        },
        {
          type: 'list',
          items: [
            'Ready-stock products may be considered for return within 7 days of delivery only if they are unused, uninstalled, undamaged, complete with all accessories, and packed in original packaging, unless the product page marks them non-returnable.',
            'Wrong product, defective product, shortage, or transit-damaged product must be reported within 48 hours of delivery with supporting evidence.',
            'Made-to-order, custom, bespoke, modified, imported-on-order, clearance, final-sale, installed, assembled, altered, used, or damaged-after-delivery products are not eligible for change-of-mind returns.',
            'Bulbs, LED strips, drivers, consumables, spare crystals, special-order parts, installation services, design consultation charges, shipping charges, packaging charges, and convenience fees may be non-refundable unless required by law or expressly agreed in writing.',
          ],
        },
      ],
    },
    {
      id: 'damaged-products',
      title: 'Damaged, Defective, Wrong, or Missing Products',
      blocks: [
        {
          type: 'paragraph',
          text: 'If a product is received damaged, defective, wrong, or with missing parts, you must notify us within 48 hours of delivery. For fragile products, we strongly recommend recording a continuous unboxing video from sealed package condition until product inspection.',
        },
        {
          type: 'orderedList',
          items: [
            'Do not install, assemble, alter, repair, discard packaging, or use the product until our team has reviewed the issue.',
            'Share order ID, invoice copy, outer packaging photographs, inner packaging photographs, product photographs, close-up damage photographs, and unboxing video where available.',
            'Our team may ask for additional information, remote inspection, courier inspection, reverse pickup, or product return before approving replacement, repair, spare part dispatch, or refund.',
            'Claims reported after installation, use, disposal of packaging, or expiry of the reporting window may be rejected if damage cannot be verified as transit or manufacturing-related.',
          ],
        },
      ],
    },
    {
      id: 'return-process',
      title: 'Return Pickup, Packing, and Inspection',
      blocks: [
        {
          type: 'paragraph',
          text: 'Approved returns must be packed securely in original packaging with all accessories, manuals, screws, brackets, canopies, chains, crystals, drivers, and invoice copy. If original packaging is unavailable or inadequate, we may decline pickup or ask you to arrange safe packing at your cost.',
        },
        {
          type: 'paragraph',
          text: 'Returned products are inspected after receipt. Refund, replacement, or repair may be denied or reduced if the product is found used, installed, incomplete, altered, damaged due to customer handling, damaged due to improper repacking, or different from the product originally supplied.',
        },
      ],
    },
    {
      id: 'refund-timelines',
      title: 'Refund Method and Timelines',
      blocks: [
        {
          type: 'paragraph',
          text: 'Approved refunds are initiated after cancellation approval, return inspection, damage verification, or payment reconciliation, as applicable. Refunds are usually processed to the original payment method used for the transaction unless another legally permitted method is required.',
        },
        {
          type: 'table',
          headers: ['Refund Situation', 'Typical Initiation Timeline', 'Credit Timeline After Initiation'],
          rows: [
            ['Cancelled before dispatch', '3 to 7 business days after approval and payment reconciliation', 'As per bank or payment gateway, usually 5 to 10 business days'],
            ['Returned product after inspection', '3 to 7 business days after product passes inspection', 'As per bank or payment gateway, usually 5 to 10 business days'],
            ['Damaged or wrong product claim', 'After verification, reverse logistics, repair, replacement decision, or inspection', 'As per bank or payment gateway timelines'],
            ['Failed or duplicate payment', 'After gateway confirmation and settlement report', 'As per bank or payment gateway timelines'],
          ],
        },
        {
          type: 'note',
          text: 'Payment gateway fees, COD charges, shipping charges, installation charges, design charges, committed custom costs, and bank charges may be non-refundable unless the refund is due to our confirmed error or applicable law requires otherwise.',
        },
      ],
    },
    {
      id: 'replacement-repair',
      title: 'Replacement, Repair, and Store Credit',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depending on product condition, availability, and nature of the issue, we may offer spare parts, repair support, replacement, equivalent product, store credit, or refund. For custom and made-to-order products, repair or replacement of the affected part may be preferred over full refund where commercially reasonable.',
        },
      ],
    },
    {
      id: 'warranty-limitations',
      title: 'Warranty Limitations',
      blocks: [
        {
          type: 'paragraph',
          text: 'Warranty coverage, if any, is product-specific and applies only to manufacturing defects expressly covered in the invoice, product page, warranty card, or written confirmation. Warranty does not cover bulbs and consumables unless stated, normal wear, finish ageing, handcrafted variations, glass differences, accidental breakage, improper installation, incorrect wiring, voltage fluctuation, water exposure, unauthorised repairs, misuse, or damage caused by third-party handling.',
        },
      ],
    },
    {
      id: 'chargebacks',
      title: 'Chargebacks and Payment Disputes',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you raise a payment dispute or chargeback with your bank or payment provider, we may share order confirmations, invoices, delivery proof, communication records, product images, refund records, and policy terms with the bank, gateway, or dispute-resolution authority. Please contact us first so that we can attempt a faster resolution.',
        },
      ],
    },
  ],
};

export const shippingPolicy: LegalPolicy = {
  title: 'Shipping & Delivery Policy',
  description:
    'This Shipping & Delivery Policy explains order processing, dispatch timelines, delivery timelines, freight handling, inspection, failed delivery, and damaged-in-transit procedures for Royce Lighting orders.',
  effectiveDate: LAST_UPDATED,
  lastUpdated: LAST_UPDATED,
  summary: [
    'Shipping timelines vary for ready-stock, made-to-order, custom, bulky, fragile, and project orders.',
    'Ready-stock orders are typically dispatched after payment verification, quality check, and secure packaging.',
    'Made-to-order and custom lighting products require production and quality-control time before dispatch.',
    'Customers must inspect packages at delivery and report transit damage quickly with photographs and unboxing evidence.',
  ],
  sections: [
    {
      id: 'scope',
      title: 'Scope and Serviceability',
      blocks: [
        {
          type: 'paragraph',
          text: `This Shipping & Delivery Policy applies to orders placed with ${LEGAL_CONTACT.brandName} through our website, payment link, written quotation, or authorised sales channel. We currently deliver to serviceable PIN codes in India through courier, surface cargo, specialist freight, vendor dispatch, or local delivery partners. International shipping, if offered, is subject to written quotation, export documentation, customs duties, and destination-country rules.`,
        },
      ],
    },
    {
      id: 'processing-timelines',
      title: 'Order Processing and Dispatch Timelines',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dispatch starts only after successful payment verification, order acceptance, customer detail confirmation, stock or production confirmation, quality check, and packaging. Timelines are estimates and may vary by product type, destination, and operational conditions.',
        },
        {
          type: 'table',
          headers: ['Order Type', 'Processing Before Dispatch', 'Typical Dispatch Timeline'],
          rows: [
            ['Ready-stock lighting', 'Payment verification, quality check, packing, invoice generation', 'Usually 3 to 7 business days'],
            ['Made-to-order lighting', 'Material procurement, assembly, finishing, curing, testing, quality check, packing', 'Usually 3 to 8 weeks, or as stated in quotation'],
            ['Custom or bespoke lighting', 'Design approval, site-specific specifications, procurement, production, testing, packing', 'As agreed in writing based on project scope'],
            ['Spare parts and small accessories', 'Availability check, packing, invoice generation', 'Usually 2 to 5 business days where available'],
            ['Bulk, project, or multi-piece orders', 'Batch planning, inspection, freight coordination, insurance or special packing where applicable', 'As communicated by our team'],
          ],
        },
      ],
    },
    {
      id: 'delivery-timelines',
      title: 'Delivery Timelines After Dispatch',
      blocks: [
        {
          type: 'table',
          headers: ['Destination Type', 'Typical Delivery Timeline After Dispatch'],
          rows: [
            ['Metro and major cities', 'Usually 3 to 7 business days'],
            ['Other serviceable cities and towns', 'Usually 5 to 12 business days'],
            ['Remote, ODA, hill, island, or limited-service locations', 'Usually 10 to 21 business days or more'],
            ['Large chandeliers, fragile freight, or surface cargo', 'Timeline depends on route, handling, cargo schedule, and site access'],
          ],
        },
        {
          type: 'note',
          text: 'Delivery timelines are estimates, not guaranteed delivery dates. Weather, traffic, strikes, festivals, public holidays, cargo limitations, courier delays, inspections, or force majeure events may affect delivery.',
        },
      ],
    },
    {
      id: 'shipping-charges',
      title: 'Shipping Charges, Taxes, and Additional Costs',
      blocks: [
        {
          type: 'paragraph',
          text: 'Shipping charges may be included, shown at checkout, added to quotation, or charged separately depending on product size, weight, destination, packing requirements, insurance, installation support, or delivery mode. GST and other applicable taxes will be handled as per law and invoice terms.',
        },
        {
          type: 'paragraph',
          text: 'Additional charges may apply for remote delivery, re-delivery, address change after dispatch, special packing, wooden crating, stair carry, difficult access, special vehicle, warehousing delay, installation visit, or delivery attempts outside standard service terms.',
        },
      ],
    },
    {
      id: 'tracking',
      title: 'Tracking and Delivery Communication',
      blocks: [
        {
          type: 'paragraph',
          text: 'Once an order is dispatched, we may share tracking details by email, SMS, WhatsApp, customer account, or phone. Tracking updates are dependent on the logistics partner and may not always update in real time, especially for surface cargo or specialist freight.',
        },
        {
          type: 'paragraph',
          text: 'Customers must remain reachable on the registered phone number. Delivery partners may contact you for address confirmation, OTP, delivery scheduling, or location assistance.',
        },
      ],
    },
    {
      id: 'delivery-inspection',
      title: 'Delivery Inspection and Proof of Delivery',
      blocks: [
        {
          type: 'orderedList',
          items: [
            'Check the outer packaging condition before accepting delivery.',
            'If visible damage, tampering, wetness, crushing, or shortage is noticed, mention it on the courier proof of delivery where possible and take photographs before opening.',
            'Open fragile lighting packages carefully and record a continuous unboxing video where possible.',
            'Report transit damage, wrong product, missing parts, or shortage within 48 hours of delivery with order ID, photographs, packaging images, and video evidence.',
          ],
        },
        {
          type: 'paragraph',
          text: 'If delivery is accepted without remarks and the issue is reported after installation or disposal of packaging, claim approval may be difficult and may depend on available evidence.',
        },
      ],
    },
    {
      id: 'failed-delivery',
      title: 'Failed Delivery, Incorrect Address, and Re-Delivery',
      blocks: [
        {
          type: 'paragraph',
          text: 'If delivery fails because the customer is unavailable, address is incorrect, phone is unreachable, premises are closed, payment balance is pending, or delivery is refused without valid reason, additional storage, return-to-origin, re-dispatch, or re-delivery charges may apply.',
        },
        {
          type: 'paragraph',
          text: 'Address changes after dispatch may not be possible. If the logistics partner permits address change, additional charges and delays may apply.',
        },
      ],
    },
    {
      id: 'fragile-handling',
      title: 'Fragile, Bulky, and White-Glove Deliveries',
      blocks: [
        {
          type: 'paragraph',
          text: 'Chandeliers, glass shades, crystal lighting, large pendants, and luxury fixtures may require special packaging, multi-box dispatch, wooden crating, freight handling, or appointment-based delivery. These shipments may be heavier, slower, and more sensitive than standard parcels.',
        },
        {
          type: 'paragraph',
          text: 'White-glove delivery, installation assistance, unpacking, assembly, ceiling mounting, electrical connection, or site coordination is provided only if specifically mentioned in writing and may be chargeable.',
        },
      ],
    },
    {
      id: 'installation',
      title: 'Installation and Site Readiness',
      blocks: [
        {
          type: 'paragraph',
          text: 'Delivery does not include installation unless stated in the order confirmation or invoice. Customers must ensure safe storage after delivery, proper ceiling support, electrical readiness, lift or stair access, availability of authorised representatives, and qualified electrician support.',
        },
        {
          type: 'paragraph',
          text: 'We are not responsible for damage caused after delivery by improper storage, mishandling, installation errors, site dust, moisture, electrical faults, voltage fluctuation, unauthorised alterations, or third-party service providers.',
        },
      ],
    },
    {
      id: 'delays',
      title: 'Delays and Force Majeure',
      blocks: [
        {
          type: 'paragraph',
          text: 'We work to meet communicated timelines, but delays may occur due to material availability, artisan production, quality rejection, finishing time, courier capacity, transport disruption, public holidays, extreme weather, strikes, government restrictions, payment verification, customer approval delays, or force majeure events.',
        },
        {
          type: 'paragraph',
          text: 'For made-to-order and custom products, quality and safe packaging may take priority over speed. We will make reasonable efforts to keep customers informed of significant delays.',
        },
      ],
    },
    {
      id: 'damaged-in-transit',
      title: 'Products Damaged in Transit',
      blocks: [
        {
          type: 'paragraph',
          text: 'Transit damage claims are handled under this policy and our Refund & Cancellation Policy. Customers must preserve packaging, avoid installation, and report the issue within the stated timeline. After verification, we may arrange repair, replacement part, replacement product, reverse pickup, insurance claim, or refund depending on the facts and product availability.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Shipping Support',
      blocks: [
        {
          type: 'paragraph',
          text: `For shipping queries, delivery support, address corrections, or damage reporting, contact ${LEGAL_CONTACT.email} or ${LEGAL_CONTACT.phone}. Support timings: ${LEGAL_CONTACT.supportTimings}. Please include order ID, invoice number, registered phone number, delivery address, photographs, and tracking details where available.`,
        },
      ],
    },
  ],
};
