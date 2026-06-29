export const masterClassCourse = {
  slug: "master-class",
  title: "Master Class",
  subtitle: "Elite Gold trading education for structured gold-market execution.",
  priceThb: 12900,
  level: "Intermediate",
  duration: "6 weeks",
  lessonCount: 18,
  resourceCount: 7,
  description:
    "A structured course for members who want to build a disciplined gold trading process: market structure, risk planning, execution review, and journal-based improvement.",
  outcomes: [
    "Understand gold market structure without relying on guaranteed signals",
    "Build a repeatable pre-trade planning routine",
    "Use risk rules and trade review to improve discipline",
    "Connect education lessons with Trading Journal review habits",
  ],
  modules: [
    {
      title: "Gold Market Foundation",
      lessons: [
        "How gold moves across sessions",
        "Key price zones and volatility behavior",
      ],
      resource: "Gold Market Session Checklist",
    },
    {
      title: "Trade Planning",
      lessons: [
        "Bias, scenario, and invalidation",
        "Risk per trade and position sizing mindset",
      ],
      resource: "Pre-Trade Planning Worksheet",
    },
    {
      title: "Execution Discipline",
      lessons: [
        "Entry confirmation and patience",
        "Managing emotions during active trades",
      ],
      resource: "Execution Review Template",
    },
    {
      title: "Journal Review",
      lessons: [
        "How to review losing trades",
        "Weekly review rhythm",
      ],
      resource: "Weekly Journal Scorecard",
    },
  ],
};

export const masterClassBankTransfer = {
  accountName: "Elite Gold Community Co., Ltd.",
  accountNumber: "123-4-56789-0",
  amountThb: masterClassCourse.priceThb,
  bankName: "Kasikorn Bank",
  paymentDeadlineHours: 24,
  referencePrefix: "EG-MC",
};
