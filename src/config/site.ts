import type { FaqItem, MembershipPlan } from "@/types";

export const siteConfig = {
  name: "Elite Gold Community",
  brandName: "Elite Gold",
  description:
    "คอมมูนิตี้และแพลตฟอร์มการเรียนรู้สำหรับเทรดเดอร์ที่ต้องการพัฒนาทักษะ วินัย และระบบการเก็บสถิติอย่างยั่งยืน",
  shortDescription:
    "Trading education, journaling discipline, and community for long-term trader growth.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  keywords: [
    "Elite Gold",
    "Elite Gold Community",
    "trading education",
    "trading journal",
    "trader community",
    "risk management",
    "trading discipline",
  ],
};

export const corePillars = [
  {
    title: "Trading Education",
    description:
      "เรียนรู้โครงสร้างตลาด การจัดการความเสี่ยง จิตวิทยาการเทรด และวิธีสร้างแผนอย่างเป็นระบบ",
  },
  {
    title: "Trading Journal",
    description:
      "บันทึกผลการเทรด ทบทวนพฤติกรรม และเปลี่ยนข้อมูลจริงให้เป็นบทเรียนสำหรับการพัฒนา",
  },
  {
    title: "Trading Community",
    description:
      "เติบโตไปกับกลุ่มเทรดเดอร์ที่ให้ความสำคัญกับวินัย การเรียนรู้ และการรีวิวอย่างมีเหตุผล",
  },
] as const;

export const membershipPlans: MembershipPlan[] = [
  {
    name: "Community Plan",
    description: "เหมาะสำหรับผู้เริ่มต้นสร้างพื้นฐานและเข้าร่วมคอมมูนิตี้",
    price: "ราคาเปิดรับสมาชิก",
    features: [
      "เข้าถึงพื้นที่ Community",
      "บทเรียนพื้นฐานสำหรับเริ่มต้น",
      "แนวทางเริ่มต้นบันทึก Trading Journal",
      "อัปเดตกิจกรรมและประกาศสมาชิก",
    ],
  },
  {
    name: "Pro Trader Plan",
    description: "เหมาะสำหรับเทรดเดอร์ที่ต้องการเรียนรู้และรีวิวผลลัพธ์อย่างจริงจัง",
    price: "ราคาเปิดรับสมาชิก",
    highlighted: true,
    features: [
      "เข้าถึง Education Library ในอนาคต",
      "Trading Journal workflow สำหรับสมาชิก",
      "Community session และการรีวิวเชิงระบบ",
      "เชื่อมต่อกับ Member Dashboard และ workflow การพัฒนา",
    ],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "สมัครเข้าร่วม Elite Gold Community ได้อย่างไร?",
    answer:
      "สามารถเริ่มจากหน้า Sign Up และทีมงานจะใช้ข้อมูลเพื่อเตรียมการเข้าร่วมคอมมูนิตี้",
  },
  {
    question: "Membership รวม Trading Education ด้วยไหม?",
    answer:
      "ใช่ เป้าหมายของ Membership คือเชื่อม Education, Journal และ Community เข้ากับประสบการณ์สมาชิกในอนาคต",
  },
  {
    question: "Trading Journal ใช้งานได้ทันทีหรือยัง?",
    answer:
      "Trading Journal ถูกวางให้เป็นพื้นที่สำหรับบันทึกและรีวิวผลการเทรดอย่างเป็นระบบ",
  },
  {
    question: "มีระบบ Access Code สำหรับสมัครสมาชิกไหม?",
    answer:
      "หน้า Sign Up รองรับ Access Code เช่น /signup?ref=EG000 สำหรับการสมัครผ่านลิงก์ที่ได้รับ",
  },
  {
    question: "Elite Gold Community เหมาะกับใคร?",
    answer:
      "เหมาะกับเทรดเดอร์ที่ต้องการพัฒนาทักษะด้วยการเรียนรู้ วางแผน เก็บสถิติ และรีวิวพฤติกรรมอย่างเป็นระบบ",
  },
];
