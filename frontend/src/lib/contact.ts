export const SITE_CONTACT = {
  brandName: 'Royace Lighting',
  companyName: 'Royace Lighting',
  gstNumber: 'Available on GST invoice',
  email: 'atelier@royacelighting.com',
  phone: '+91 98765 43210',
  phoneHref: 'tel:+919876543210',
  registeredAddress: 'Mehrauli Road, Qutub Area, New Delhi, 110030',
  supportTimings: 'Monday to Saturday, 10:00 AM to 7:00 PM IST',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Mehrauli%20Road%2C%20Qutub%20Area%2C%20New%20Delhi%20110030',
};

export const mailTo = (subject: string) =>
  `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(subject)}`;
