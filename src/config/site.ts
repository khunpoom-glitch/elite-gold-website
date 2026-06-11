import type { FaqItem, MembershipPlan } from "@/types";

export const siteConfig = {
  name: "Elite Gold Community",
  brandName: "Elite Gold",
  description:
    "คอมมูนิตี้และแพลตฟอร์มการเรียนรู้สำหรับเทรดเดอร์ที่ต้องการพัฒนาทักษะ วินัย และระบบการเก็บสถิติอย่างยั่งยืน",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "support@elitegold.community",
  supportLine: "Elite Gold Support",
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
      "Preview บทเรียนพื้นฐาน",
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
      "พร้อมเชื่อมต่อ Member Dashboard ใน Phase ถัดไป",
    ],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "สมัครเข้าร่วม Elite Gold Community ได้อย่างไร?",
    answer:
      "ใน Phase นี้หน้า Sign Up เป็น placeholder เพื่อเตรียมระบบ สมาชิกจริงจะเปิดเมื่อระบบ Authentication พร้อมใน Phase ถัดไป",
  },
  {
    question: "Membership รวม Trading Education ด้วยไหม?",
    answer:
      "ใช่ เป้าหมายของ Membership คือเชื่อม Education, Journal และ Community เข้ากับประสบการณ์สมาชิกในอนาคต",
  },
  {
    question: "Trading Journal ใช้งานได้ทันทีหรือยัง?",
    answer:
      "ยังไม่เปิดใช้งานจริงใน Phase นี้ แต่โครงเว็บถูกเตรียมเพื่อรองรับระบบบันทึกและรีวิวผลการเทรดในอนาคต",
  },
  {
    question: "มีระบบ referral code หรือ affiliate ไหม?",
    answer:
      "หน้า Sign Up แสดงช่อง Referral Code ไว้แล้ว เพื่อรองรับลิงก์ referral เช่น /signup?ref=EG000 ใน Phase ถัดไป",
  },
  {
    question: "Elite Gold Community เหมาะกับใคร?",
    answer:
      "เหมาะกับเทรดเดอร์ที่ต้องการพัฒนาทักษะด้วยการเรียนรู้ วางแผน เก็บสถิติ และรีวิวพฤติกรรมอย่างเป็นระบบ",
  },
];
