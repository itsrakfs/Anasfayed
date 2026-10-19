/* ==========================================================================
   SITE CONFIGURATION — edit this file to update the whole website.
   • Leave a value as "" (empty) and that line / button is hidden.
   • Everything here is public. Never put passwords or secrets in it.
   • Keep it valid JavaScript: keep the commas and quotation marks.
   ========================================================================== */

window.SITE_CONFIG = {
  /* ---------- Name & intro ---------- */
  name: "Anas Fayed",
  tagline: "AI student at Kafr El-Sheikh University",
  intro: "Welcome! Here are my social accounts and a few basics about me.",

  /* ---------- About me ----------
     Each item is hidden when left empty.
     Privacy tip: you can empty "born" or "birthplace" any time to hide them. */
  about: {
    fullName: "Anas Mohamed Abdelhay Fayed",
    born: "October 12, 2005",
    birthplace: "Hubuna, Najran, Saudi Arabia",
    from: "Kafr El-Sheikh, Egypt",
    university: "Kafr El-Sheikh University",
    faculty: "Faculty of Artificial Intelligence",
    graduation: "2027",
    currentStage: ""          // e.g. "Fourth year" — fill in when you want it shown
  },

  /* ---------- Links ----------
     Full URLs (https://...). Empty string = hidden.
     whatsapp → international number, digits only, no "+" and no leading zero
                (Egypt: 20 + the number without its first 0).
     email    → just the address.                                          */
  links: {
    linkedin: "https://www.linkedin.com/in/anas-fayed-1187972b6",
    instagram: "https://www.instagram.com/anasfayyed/",
    tiktok: "https://www.tiktok.com/@xw4b",
    snapchat: "https://www.snapchat.com/add/mmxnn1",
    github: "",
    email: "",
    whatsapp: "201061759959"
  },

  /* Message pre-filled when someone opens the WhatsApp chat. */
  whatsappMessage: "Hi Anas, I found your website and wanted to say hi.",

  /* Order of the account cards (names must match keys in `links`). */
  linkOrder: ["whatsapp", "linkedin", "instagram", "tiktok", "snapchat", "github", "email"]
};
