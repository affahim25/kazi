# নিকাহ রেজিস্ট্রি

একটি সম্পূর্ণ ওয়েব অ্যাপ্লিকেশন যেখানে নিকাহর তথ্য ও ছবি সংরক্ষণ করা যায়।

## প্রজেক্ট স্ট্রাকচার

```
nikah-registry/
├── index.html          # মেইন HTML পেইজ
├── README.md           # এই ফাইল
├── css/
│   └── style.css       # সম্পূর্ণ স্টাইলশিট
└── js/
    ├── firebase.js     # Firebase SDK ইনিশিয়ালাইজেশন
    ├── cloudinary.js   # Cloudinary ইমেজ আপলোড হেল্পার
    ├── ui.js           # UI রেন্ডারিং ফাংশন (toast, tabs, records)
    └── app.js          # মেইন অ্যাপ লজিক (entry point)
```

## ফিচারসমূহ

- 📸 জামাই ও বউয়ের ছবি **Cloudinary**-তে আপলোড
- 💾 সমস্ত তথ্য **Firebase Realtime Database**-এ সেভ
- 🔍 নাম, এনআইডি বা পেইজ নম্বর দিয়ে সার্চ
- 📋 সব রেকর্ডের লিস্ট ছবিসহ দেখা

## ব্যবহার

সরাসরি `index.html` ফাইলটি ব্রাউজারে ওপেন করুন অথবা যেকোনো স্ট্যাটিক হোস্টিং (Netlify, Vercel, GitHub Pages)-এ আপলোড করুন।

> **নোট:** ES Modules (`type="module"`) ব্যবহার করা হয়েছে, তাই ফাইলটি সরাসরি `file://` প্রোটোকলে নয়, বরং একটি লোকাল সার্ভার (যেমন VS Code Live Server) বা হোস্টিং-এ রান করতে হবে।

## কনফিগারেশন

| ফাইল | কী আছে |
|---|---|
| `js/firebase.js` | Firebase project config |
| `js/cloudinary.js` | Cloud name ও upload preset |
