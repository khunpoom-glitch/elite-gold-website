"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <form
      className="rounded-lg border border-border bg-surface/80 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setIsSubmitted(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-white">
          Name
          <Input name="name" placeholder="ชื่อของคุณ" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Email
          <Input name="email" placeholder="you@example.com" required type="email" />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-medium text-white">
        Subject
        <Input name="subject" placeholder="หัวข้อที่ต้องการสอบถาม" required />
      </label>
      <label className="mt-4 grid gap-2 text-sm font-medium text-white">
        Message
        <Textarea name="message" placeholder="รายละเอียดข้อความ" required />
      </label>
      <Button className="mt-5 w-full sm:w-auto" type="submit">
        <Send aria-hidden="true" className="h-4 w-4" />
        Send Message
      </Button>
      {isSubmitted ? (
        <p className="mt-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          ขอบคุณครับ ข้อความนี้เป็น placeholder success state และยังไม่ส่งข้อมูลไป backend ใน Phase นี้
        </p>
      ) : null}
    </form>
  );
}
