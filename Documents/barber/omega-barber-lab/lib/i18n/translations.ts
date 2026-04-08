import type { Locale } from './server'

const translations = {
  el: {
    nav: {
      services: 'Υπηρεσίες',
      booking: 'Κράτηση',
      bookCta: 'Κλείσε Ραντεβού',
    },

    hero: {
      eyebrow: 'Premium Grooming Experience',
      h1a: 'Premium grooming',
      h1b: 'με',
      h1accent: 'ακρίβεια',
      h1c: ', χαρακτήρα',
      h1end: '& στιλ.',
      sub: 'Στο Omega Barber Lab κάθε ραντεβού είναι σχεδιασμένο για άνδρες που θέλουν καθαρό αποτέλεσμα, σταθερή ποιότητα και μια εμπειρία που δείχνει premium.',
      cta: 'Κλείσε Ραντεβού',
      ctaSec: 'Δες Υπηρεσίες ↓',
      scroll: 'Scroll',
      side: 'Καβάλα · Ελλάδα',
    },

    stats: [
      { value: '500+',   label: 'Πιστοί πελάτες' },
      { value: '12+',    label: 'Χρόνια εμπειρίας' },
      { value: '3.000+', label: 'Ραντεβού ετησίως' },
      { value: '4',      label: 'Premium υπηρεσίες' },
    ],

    about: {
      eyebrow: 'Η φιλοσοφία μας',
      h2: 'Ένα premium barbershop που αντιμετωπίζει το grooming ως εμπειρία,',
      h2muted: 'όχι ως ρουτίνα.',
      p: 'Το Omega Barber Lab δημιουργήθηκε για άνδρες που εκτιμούν τη λεπτομέρεια, την καθαρή αισθητική και την επαγγελματική εξυπηρέτηση.',
      points: [
        'Καθαρό αισθητικό αποτέλεσμα με έμφαση στη φόρμα και στο φινίρισμα.',
        'Προσεγμένη εμπειρία εξυπηρέτησης με σεβασμό στον χρόνο του πελάτη.',
        'Ισορροπία ανάμεσα σε παραδοσιακή barber φιλοσοφία και σύγχρονο luxury ύφος.',
      ],
    },

    services: {
      eyebrow: 'Τι προσφέρουμε',
      h2: 'Υπηρεσίες',
      bookAll: 'Κλείσε ραντεβού',
      minutes: 'λεπτά',
      book: 'Κλείσε →',
    },

    why: {
      eyebrow: 'Γιατί εμάς',
      h2: 'Η διαφορά στη λεπτομέρεια',
      items: [
        { title: 'Η Δουλειά μας',     desc: 'Τεχνική συνέπεια, αισθητική ωριμότητα και εμπειρία που φαίνεται στο τελικό αποτέλεσμα.' },
        { title: 'Premium Προϊόντα',   desc: 'Επιλεγμένα προϊόντα για styling, shaving και beard care χωρίς εκπτώσεις στην ποιότητα.' },
        { title: 'Υγιεινή & Καθαριότητα', desc: 'Σχολαστική απολύμανση, καθαρός χώρος και επαγγελματική προετοιμασία πριν από κάθε υπηρεσία.' },
        { title: 'Online Ραντεβού',    desc: 'Γρήγορη κράτηση χωρίς αναμονή, με ξεκάθαρη εμπειρία και έλεγχο διαθεσιμότητας.' },
        { title: 'Λεπτομέρεια',        desc: 'Το φινίρισμα, η γραμμή και η διάρκεια του look είναι μέρος της υπογραφής μας.' },
      ],
    },

    testimonials: {
      eyebrow: 'Τι λένε οι πελάτες',
      h2: 'Αξιολογήσεις',
      items: [
        { name: 'Γιώργος Μ.',    text: 'Από την πρώτη επίσκεψη κατάλαβα ότι εδώ δίνουν βάρος στη λεπτομέρεια. Το αποτέλεσμα κρατάει και η εξυπηρέτηση είναι πραγματικά επαγγελματική.' },
        { name: 'Αντώνης Π.',    text: 'Ο χώρος έχει premium αίσθηση χωρίς υπερβολές και το κούρεμα είναι πάντα ακριβώς όπως το ζητάω. Σπάνιο επίπεδο συνέπειας.' },
        { name: 'Δημήτρης Κ.',   text: 'Η περιποίηση γενειάδας έγινε με τρομερή προσοχή. Καθαρές γραμμές, σωστό σχήμα και πολύ ωραία συνολική εμπειρία.' },
        { name: 'Χρήστος Λ.',    text: 'Κλείνω online ραντεβού εύκολα και δεν χάνω χρόνο. Πολύ οργανωμένο, υψηλό επίπεδο υπηρεσίας και σωστό επαγγελματικό ύφος.' },
        { name: 'Παναγιώτης Σ.', text: 'Έχω δοκιμάσει αρκετά κουρεία, αλλά εδώ το αποτέλεσμα είναι πιο προσεγμένο και η εξυπηρέτηση πιο ώριμη. Θα ξαναπάω σίγουρα.' },
        { name: 'Σωτήρης Ν.',    text: 'Το premium πακέτο αξίζει πραγματικά. Νιώθεις ότι δεν μπήκες απλώς για ένα κούρεμα, αλλά για ολοκληρωμένη περιποίηση.' },
      ],
    },

    cta: {
      eyebrow: 'Έτοιμος;',
      h2a: 'Το επόμενο ραντεβού σου',
      h2b: 'σε 2 λεπτά.',
      p: 'Χωρίς αναμονή. Χωρίς τηλεφωνήματα. Επίλεξε ώρα, επιβεβαίωσε, έλα.',
      btn: 'Κλείσε Ραντεβού Τώρα',
    },

    footer: {
      tagline: 'Premium grooming experience για άνδρες που εκτιμούν τη λεπτομέρεια, το στιλ και την ποιότητα.',
      nav: 'Πλοήγηση',
      navLinks: [
        { href: '/',          label: 'Αρχική' },
        { href: '/#services', label: 'Υπηρεσίες' },
        { href: '/booking',   label: 'Ραντεβού' },
      ],
      contact: 'Επικοινωνία',
      hours: 'Ωράριο',
      hoursRows: [
        { day: 'Δευτέρα',       time: '10:00 – 18:00' },
        { day: 'Τρ – Παρ',     time: '09:00 – 21:00' },
        { day: 'Σάββατο',       time: '10:00 – 18:00' },
        { day: 'Κυριακή',       time: 'Κλειστά' },
      ],
      rights: 'Premium Grooming · Όλα τα δικαιώματα κατοχυρωμένα',
    },

    booking: {
      eyebrow: 'Omega Barber Lab',
      h1: 'Κλείσε Ραντεβού',
      sub: 'Γρήγορα, εύκολα, χωρίς αναμονή.',
      steps: ['Υπηρεσία', 'Ημ/νία', 'Στοιχεία', 'Επιβεβαίωση'] as string[],
      step1: { h2: 'Επιλέξτε Υπηρεσία', minutes: 'λεπτά' },
      step2: { h2: 'Επιλέξτε Ημερομηνία', dateLabel: 'Ημερομηνία', timesLabel: 'Διαθέσιμες Ώρες', noSlots: 'Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημερομηνία.' },
      step3: {
        h2: 'Τα Στοιχεία σας',
        name: 'Ονοματεπώνυμο', namePh: 'Γιώργος Παπαδόπουλος',
        phone: 'Κινητό τηλέφωνο', phonePh: '6912345678', phoneHint: 'Για υπενθύμιση του ραντεβού',
        email: 'Email (προαιρετικό)', emailPh: 'email@example.com', emailHint: 'Για επιβεβαίωση & υπενθύμιση',
        notes: 'Σημειώσεις', notesPh: 'Οτιδήποτε θέλετε να γνωρίζουμε...',
        coupon: 'Κωδικός Έκπτωσης', couponPh: 'π.χ. OBL-SUMMER', couponBtn: 'Εφαρμογή',
        next: 'Επόμενο',
        couponValidPrefix: '✓', couponValidMid: '— Έκπτωση', couponValidSuffix: '→ Τελική τιμή',
        couponInvalid: '✗ Μη έγκυρο κουπόνι',
      },
      step4: {
        h2: 'Επιβεβαίωση Ραντεβού',
        service: 'Υπηρεσία', date: 'Ημερομηνία', time: 'Ώρα',
        customer: 'Πελάτης', phone: 'Τηλέφωνο', email: 'Email',
        price: 'Τιμή', discount: 'Έκπτωση', total: 'Σύνολο',
        submitPrefix: 'Κλείσε Ραντεβού —',
        cancel: 'Για ακύρωση επικοινωνήστε τηλεφωνικά: 6940502965',
      },
      success: {
        h2: 'Ραντεβού Κλειστό!',
        msgFor: 'Το ραντεβού σας για', msgAt: 'στις', msgDone: 'κλείστηκε επιτυχώς.',
        emailSentPrefix: 'Επιβεβαίωση εστάλη στο',
        newBtn: 'Νέο Ραντεβού',
      },
    },
  },

  en: {
    nav: {
      services: 'Services',
      booking: 'Book',
      bookCta: 'Book Appointment',
    },

    hero: {
      eyebrow: 'Premium Grooming Experience',
      h1a: 'Premium grooming',
      h1b: 'with',
      h1accent: 'precision',
      h1c: ', character',
      h1end: '& style.',
      sub: 'At Omega Barber Lab every appointment is designed for men who want a clean result, consistent quality and an experience that feels premium.',
      cta: 'Book Appointment',
      ctaSec: 'See Services ↓',
      scroll: 'Scroll',
      side: 'Kavala · Greece',
    },

    stats: [
      { value: '500+',   label: 'Loyal clients' },
      { value: '12+',    label: 'Years of experience' },
      { value: '3,000+', label: 'Appointments yearly' },
      { value: '4',      label: 'Premium services' },
    ],

    about: {
      eyebrow: 'Our philosophy',
      h2: 'A premium barbershop that treats grooming as an experience,',
      h2muted: 'not a routine.',
      p: 'Omega Barber Lab was created for men who appreciate attention to detail, clean aesthetics and professional service.',
      points: [
        'A clean aesthetic result with emphasis on shape and finish.',
        'A refined service experience with respect for the client\'s time.',
        'A balance between traditional barber philosophy and modern luxury style.',
      ],
    },

    services: {
      eyebrow: 'What we offer',
      h2: 'Services',
      bookAll: 'Book appointment',
      minutes: 'min',
      book: 'Book →',
    },

    why: {
      eyebrow: 'Why us',
      h2: 'The difference is in the detail',
      items: [
        { title: 'Our Craft',          desc: 'Technical consistency, aesthetic maturity and experience that shows in the final result.' },
        { title: 'Premium Products',   desc: 'Curated products for styling, shaving and beard care with no compromise on quality.' },
        { title: 'Hygiene & Cleanliness', desc: 'Meticulous sterilisation, clean space and professional preparation before every service.' },
        { title: 'Online Booking',     desc: 'Fast booking without waiting, with a clear experience and availability check.' },
        { title: 'Attention to Detail', desc: 'The finish, the line and the longevity of your look are part of our signature.' },
      ],
    },

    testimonials: {
      eyebrow: 'What clients say',
      h2: 'Reviews',
      items: [
        { name: 'George M.',     text: 'From my first visit I could tell they care about every detail. The result lasts and the service is truly professional.' },
        { name: 'Anthony P.',    text: 'The space has a premium feel without being over the top, and the cut is always exactly as I ask. A rare level of consistency.' },
        { name: 'Dimitris K.',   text: 'The beard treatment was done with incredible care. Clean lines, the right shape and a really enjoyable overall experience.' },
        { name: 'Chris L.',      text: 'I book online easily and don\'t waste time. Very organised, high-level service and a proper professional attitude.' },
        { name: 'Panagiotis S.', text: 'I\'ve tried many barbershops, but here the result is more refined and the service more mature. I\'ll definitely come back.' },
        { name: 'Sotiris N.',    text: 'The premium package is really worth it. You feel like you came in for a complete grooming experience, not just a haircut.' },
      ],
    },

    cta: {
      eyebrow: 'Ready?',
      h2a: 'Your next appointment',
      h2b: 'in 2 minutes.',
      p: 'No waiting. No phone calls. Pick a time, confirm, come in.',
      btn: 'Book Now',
    },

    footer: {
      tagline: 'Premium grooming experience for men who appreciate detail, style and quality.',
      nav: 'Navigation',
      navLinks: [
        { href: '/',          label: 'Home' },
        { href: '/#services', label: 'Services' },
        { href: '/booking',   label: 'Book' },
      ],
      contact: 'Contact',
      hours: 'Opening Hours',
      hoursRows: [
        { day: 'Monday',         time: '10:00 – 18:00' },
        { day: 'Tue – Fri',     time: '09:00 – 21:00' },
        { day: 'Saturday',       time: '10:00 – 18:00' },
        { day: 'Sunday',         time: 'Closed' },
      ],
      rights: 'Premium Grooming · All rights reserved',
    },

    booking: {
      eyebrow: 'Omega Barber Lab',
      h1: 'Book Appointment',
      sub: 'Fast, easy, no waiting.',
      steps: ['Service', 'Date', 'Details', 'Confirm'] as string[],
      step1: { h2: 'Select Service', minutes: 'min' },
      step2: { h2: 'Select Date', dateLabel: 'Date', timesLabel: 'Available Times', noSlots: 'No available slots for this date.' },
      step3: {
        h2: 'Your Details',
        name: 'Full Name', namePh: 'John Smith',
        phone: 'Mobile', phonePh: '+306912345678', phoneHint: 'For appointment reminder',
        email: 'Email (optional)', emailPh: 'email@example.com', emailHint: 'For confirmation & reminder',
        notes: 'Notes', notesPh: "Anything you'd like us to know...",
        coupon: 'Discount Code', couponPh: 'e.g. OBL-SUMMER', couponBtn: 'Apply',
        next: 'Next',
        couponValidPrefix: '✓', couponValidMid: '— Discount', couponValidSuffix: '→ Final price',
        couponInvalid: '✗ Invalid coupon code',
      },
      step4: {
        h2: 'Confirm Appointment',
        service: 'Service', date: 'Date', time: 'Time',
        customer: 'Name', phone: 'Phone', email: 'Email',
        price: 'Price', discount: 'Discount', total: 'Total',
        submitPrefix: 'Book Appointment —',
        cancel: 'To cancel please call: 6940502965',
      },
      success: {
        h2: 'Appointment Booked!',
        msgFor: 'Your appointment for', msgAt: 'on', msgDone: 'has been successfully booked.',
        emailSentPrefix: 'Confirmation sent to',
        newBtn: 'New Appointment',
      },
    },
  },
}

export type TranslationKey = typeof translations
export function getT(locale: Locale) {
  return translations[locale]
}
