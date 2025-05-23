// قائمة محافظات ومدن الدلتا (مراجعة ومطابقة للمصادر الرسمية)
// يمكن التوسعة لاحقًا لباقي المحافظات

export interface GovernorateCities {
  governorate: string;
  cities: string[];
}

export const egyptGovernorates: GovernorateCities[] = [
  {
    governorate: "الدقهلية",
    cities: [
      "المنصورة", "طلخا", "ميت غمر", "دكرنس", "منية النصر", "الجمالية", "شربين", "بني عبيد", "المنزلة", "تمي الأمديد", "بلقاس", "أجا", "السنبلاوين", "نبروه", "محلة دمنة", "ميت سلسيل", "الكردي", "بني عبيد", "جمصة"
    ]
  },
  {
    governorate: "الغربية",
    cities: [
      "طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "بسيون", "سمنود", "قطور"
    ]
  },
  {
    governorate: "الشرقية",
    cities: [
      "الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح", "فاقوس", "أبو كبير", "ههيا", "أبو حماد", "ديرب نجم", "الإبراهيمية", "مشتول السوق", "القنايات", "أولاد صقر", "الحسينية", "صان الحجر", "كفر صقر", "القرين", "الصالحية الجديدة", "العصايد"
    ]
  },
  {
    governorate: "كفر الشيخ",
    cities: [
      "كفر الشيخ", "دسوق", "بلطيم", "الحامول", "بيلا", "سيدي سالم", "قلين", "مطوبس", "فوه", "الرياض"
    ]
  },
  {
    governorate: "دمياط",
    cities: [
      "دمياط", "رأس البر", "فارسكور", "الزرقا", "السرو", "كفر سعد", "كفر البطيخ", "عزبة البرج", "ميت أبو غالب"
    ]
  },
  {
    governorate: "البحيرة",
    cities: [
      "دمنهور", "كفر الدوار", "رشيد", "إيتاي البارود", "أبو حمص", "الدلنجات", "المحمودية", "حوش عيسى", "شبراخيت", "كوم حمادة", "بدر", "وادي النطرون", "النوبارية الجديدة", "إدكو"
    ]
  },
  {
    governorate: "المنوفية",
    cities: [
      "شبين الكوم", "منوف", "سرس الليان", "أشمون", "الباجور", "تلا", "بركة السبع", "قويسنا", "السادات", "الشهداء"
    ]
  },
  {
    governorate: "القاهرة",
    cities: [
      "القاهرة", "حلوان", "مدينتي", "الشروق", "العبور", "بدر", "التجمع الخامس", "15 مايو", "المعادي", "مدينة نصر", "مصر الجديدة", "عين شمس", "المطرية", "الزيتون", "حدائق القبة", "الزمالك", "شبرا", "روض الفرج", "الساحل", "الشرابية", "الزاوية الحمراء", "المرج", "السلام", "المقطم", "وسط البلد", "الأزبكية", "باب الشعرية", "بولاق", "السيدة زينب", "الخليفة", "الموسكى", "الدرب الأحمر", "الجمالية", "عابدين"
    ]
  },
  {
    governorate: "الجيزة",
    cities: [
      "الجيزة", "6 أكتوبر", "الشيخ زايد", "الحوامدية", "البدرشين", "العياط", "أوسيم", "أبو النمرس", "كرداسة", "منشأة القناطر", "الصف", "أطفيح", "الواحات البحرية", "الوراق", "الدقي", "العجوزة", "إمبابة", "الهرم", "بولاق الدكرور", "العمرانية", "المنيب", "الطالبية", "الزمر"
    ]
  },
  {
    governorate: "الإسكندرية",
    cities: [
      "الإسكندرية", "برج العرب", "برج العرب الجديدة", "العجمي", "المنتزه", "سيدي جابر", "محرم بك", "سيدي بشر", "الجمرك", "اللبان", "العطارين", "المنشية", "الرمل", "المندرة", "العامرية", "كرموز", "باكوس", "سموحة", "فيكتوريا", "جليم", "سان ستيفانو", "الشاطبي", "المعمورة"
    ]
  },
  {
    governorate: "الإسماعيلية",
    cities: [
      "الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير", "أبو صوير", "القصاصين الجديدة", "سرابيوم", "أبو خليفة"
    ]
  },
  {
    governorate: "بورسعيد",
    cities: [
      "بورسعيد", "بورفؤاد", "العرب", "الضواحي", "المناخ", "الزهور", "الشرق", "الجنوب"
    ]
  },
  {
    governorate: "السويس",
    cities: [
      "السويس", "عتاقة", "الجناين", "الأربعين", "فيصل", "الصباح"
    ]
  },
  {
    governorate: "شمال سيناء",
    cities: [
      "العريش", "بئر العبد", "رفح", "الشيخ زويد", "الحسنة", "نخل"
    ]
  },
  {
    governorate: "جنوب سيناء",
    cities: [
      "طور سيناء", "شرم الشيخ", "دهب", "نويبع", "طابا", "سانت كاترين", "أبو رديس", "أبو زنيمة", "رأس سدر"
    ]
  },
  {
    governorate: "بني سويف",
    cities: [
      "بني سويف", "الواسطى", "ناصر", "إهناسيا", "ببا", "سمسطا", "الفشن", "الفتح"
    ]
  },
  {
    governorate: "الفيوم",
    cities: [
      "الفيوم", "سنورس", "إطسا", "إبشواي", "يوسف الصديق", "طامية", "الحادقة", "الفيوم الجديدة"
    ]
  },
  {
    governorate: "المنيا",
    cities: [
      "المنيا", "العدوة", "مغاغة", "بني مزار", "مطاي", "سمالوط", "المنيا الجديدة", "أبو قرقاص", "ملوي", "دير مواس"
    ]
  },
  {
    governorate: "أسيوط",
    cities: [
      "أسيوط", "ديروط", "منفلوط", "القوصية", "أبنوب", "أبو تيج", "الغنايم", "ساحل سليم", "البداري", "صدفا", "أسيوط الجديدة"
    ]
  },
  {
    governorate: "سوهاج",
    cities: [
      "سوهاج", "أخميم", "البلينا", "المراغة", "المنشأة", "دار السلام", "جرجا", "جهينة", "ساقلتة", "طما", "طهطا", "سوهاج الجديدة"
    ]
  },
  {
    governorate: "قنا",
    cities: [
      "قنا", "أبو تشت", "نجع حمادي", "دشنا", "الوقف", "قفط", "قوص", "نقادة", "فرشوط", "قنا الجديدة"
    ]
  },
  {
    governorate: "الأقصر",
    cities: [
      "الأقصر", "الزينية", "البياضية", "الطود", "القرنة", "أرمنت", "إسنا", "الأقصر الجديدة"
    ]
  },
  {
    governorate: "أسوان",
    cities: [
      "أسوان", "دراو", "كوم أمبو", "نصر النوبة", "كلابشة", "إدفو", "الرديسية", "البصيلية", "السباعية", "أبو سمبل السياحية", "أسوان الجديدة"
    ]
  },
  {
    governorate: "الوادي الجديد",
    cities: [
      "الخارجة", "باريس", "موط", "الفرافرة", "البلاط", "الداخلة"
    ]
  },
  {
    governorate: "البحر الأحمر",
    cities: [
      "الغردقة", "رأس غارب", "سفاجا", "القصير", "مرسى علم", "الشلاتين", "حلايب", "برنيس"
    ]
  }
];
