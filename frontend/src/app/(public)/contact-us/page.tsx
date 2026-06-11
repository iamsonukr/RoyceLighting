import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { LEGAL_CONTACT } from '@/components/legal/PolicyPage';
import { mailTo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact Us | Royace Lighting',
  description:
    'Contact Royace Lighting for luxury chandeliers, pendant lights, decorative lighting orders, custom lighting consultations, shipping support, returns, refunds, and warranty assistance.',
};

const contactCards = [
  {
    title: 'Customer Support',
    detail: LEGAL_CONTACT.email,
    helper: 'Order updates, payment queries, returns, refunds, and warranty support.',
    href: mailTo('Royace Lighting customer support enquiry'),
    Icon: Mail,
  },
  {
    title: 'Phone Support',
    detail: LEGAL_CONTACT.phone,
    helper: 'For urgent delivery, damage reporting, and custom project coordination.',
    href: LEGAL_CONTACT.phoneHref,
    Icon: Phone,
  },
  {
    title: 'Registered Office',
    detail: LEGAL_CONTACT.registeredAddress,
    helper: `GSTIN: ${LEGAL_CONTACT.gstNumber}`,
    href: LEGAL_CONTACT.mapUrl,
    Icon: MapPin,
  },
  {
    title: 'Business Hours',
    detail: LEGAL_CONTACT.supportTimings,
    helper: 'Responses may be slower on Sundays, public holidays, and peak festive periods.',
    href: mailTo('Royace Lighting appointment request'),
    Icon: Clock,
  },
];

const faqs = [
  {
    question: 'How quickly will Royace Lighting respond to my enquiry?',
    answer:
      'We aim to respond during stated support timings. Order, payment, shipping, and damaged-product queries are prioritised when you include your order ID, registered phone number, invoice copy, and photographs where relevant.',
  },
  {
    question: 'What details should I share for a custom chandelier or pendant light?',
    answer:
      'Please share room type, ceiling height, preferred size, finish, colour temperature, installation city, reference images, budget range, project timeline, and any drawings or site photographs available. Our team may request additional details before confirming feasibility, price, and timeline.',
  },
  {
    question: 'Can I contact support for payment gateway or failed payment issues?',
    answer:
      'Yes. Please share the order ID, payment reference, transaction screenshot if available, payment date, payment mode, and registered mobile number. Failed or duplicate payments are verified through gateway settlement reports before refund initiation.',
  },
  {
    question: 'How do I report a damaged, wrong, or missing product?',
    answer:
      'Contact us within 48 hours of delivery with order ID, invoice copy, outer packaging photographs, inner packaging photographs, product photographs, and a continuous unboxing video wherever possible. Do not install or discard packaging until our team has reviewed the claim.',
  },
  {
    question: 'Does Royace Lighting provide installation?',
    answer:
      'Installation is available only where expressly mentioned in writing and may depend on city serviceability, product type, site access, ceiling readiness, electrical readiness, and appointment availability. Product prices do not automatically include installation.',
  },
  {
    question: 'Can I visit the showroom or office?',
    answer:
      'Visits, showroom appointments, trade consultations, and project meetings may be available by prior appointment at the address or location confirmed by our team. Please contact support before visiting.',
  },
];

export default function ContactUsPage() {
  return (
    <main className="legal-page contact-page">
      <section className="legal-hero">
        <div>
          <p className="luxury-kicker">Contact Us</p>
          <h1>Contact Royace Lighting</h1>
          <p>
            Speak with our team for decorative lighting orders, luxury chandeliers,
            pendant lights, made-to-order commissions, payment support, delivery
            updates, returns, refunds, and warranty assistance.
          </p>
          <dl className="legal-meta">
            <div>
              <dt>Company</dt>
              <dd>{LEGAL_CONTACT.companyName}</dd>
            </div>
            <div>
              <dt>GSTIN</dt>
              <dd>{LEGAL_CONTACT.gstNumber}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="contact-shell" aria-labelledby="company-details">
        <div className="contact-details">
          <div className="section-heading section-heading-left">
            <p className="luxury-kicker">Support Desk</p>
            <h2 id="company-details">Company Details and Customer Support</h2>
            <p>
              Use the details below for order support, payment verification,
              product consultation, custom lighting enquiries, and post-delivery
              assistance. Please include your order ID wherever applicable.
            </p>
          </div>

          <div className="contact-card-grid">
            {contactCards.map(({ title, detail, helper, href, Icon }) => (
              <article className="contact-card" key={title}>
                <Icon size={20} strokeWidth={1.5} />
                <h3>{title}</h3>
                <Link className="contact-card-detail" href={href}>
                  {detail}
                </Link>
                <p>{helper}</p>
              </article>
            ))}
          </div>

          <div className="map-placeholder" role="region" aria-label="Royace Lighting location">
            <div>
              <MapPin size={30} strokeWidth={1.4} />
            </div>
            <h2>Visit by Appointment</h2>
            <p>
              Our team can help schedule showroom visits, project meetings, and
              trade consultations at the confirmed Royace Lighting location.
            </p>
            <Link
              className="rl-button rl-button-outline contact-map-link"
              href={LEGAL_CONTACT.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get Directions
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <aside className="contact-form-panel" aria-labelledby="inquiry-form">
          <div className="contact-form-heading">
            <MessageSquare size={22} strokeWidth={1.4} />
            <div>
              <p className="overline-text">Inquiry Form</p>
              <h2 id="inquiry-form">Send Us a Message</h2>
            </div>
          </div>

          <form
            className="contact-form"
            action={mailTo('Royace Lighting website enquiry')}
            method="post"
            encType="text/plain"
          >
            <label>
              Full Name
              <input name="fullName" type="text" placeholder="Enter your full name" required />
            </label>
            <label>
              Email Address
              <input name="email" type="email" placeholder="Enter your email address" required />
            </label>
            <label>
              Phone Number
              <input name="phone" type="tel" placeholder="Enter your phone number" required />
            </label>
            <label>
              Order ID
              <input name="orderId" type="text" placeholder="Optional, if your enquiry relates to an order" />
            </label>
            <label>
              Inquiry Type
              <select name="inquiryType" required defaultValue="">
                <option value="" disabled>
                  Select an inquiry type
                </option>
                <option value="product-consultation">Product consultation</option>
                <option value="custom-lighting">Custom or made-to-order lighting</option>
                <option value="order-support">Order support</option>
                <option value="payment-invoice">Payment or GST invoice query</option>
                <option value="shipping-delivery">Shipping or delivery support</option>
                <option value="returns-refunds">Returns, refunds, or cancellation</option>
                <option value="damaged-product">Damaged, wrong, or missing product</option>
                <option value="trade-designer">Trade, architect, or designer enquiry</option>
              </select>
            </label>
            <label>
              Product or Project Details
              <input
                name="productOrProject"
                type="text"
                placeholder="Example: chandelier for dining room, pendant light, order item"
              />
            </label>
            <label className="contact-form-wide">
              Message
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us how we can help. For custom lighting, include dimensions, finish preference, city, timeline, and budget range."
                required
              />
            </label>
            <p className="contact-form-help">
              For damaged products, please email photographs, packaging images,
              invoice copy, and unboxing video to {LEGAL_CONTACT.email} along
              with your order ID.
            </p>
            <button type="submit" className="rl-button rl-button-primary">
              Submit Inquiry
            </button>
          </form>
        </aside>
      </section>

      <section className="contact-faq-section" aria-labelledby="contact-faqs">
        <div className="section-heading">
          <p className="luxury-kicker">Help Centre</p>
          <h2 id="contact-faqs">Contact Us FAQs</h2>
          <p>
            Quick answers for common customer support, custom lighting, payment,
            delivery, and damaged-product questions.
          </p>
        </div>

        <div className="contact-faq-grid">
          {faqs.map((faq) => (
            <article className="contact-faq-card" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
