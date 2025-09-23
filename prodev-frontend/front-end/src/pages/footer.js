// components/Footer.tsx
"use client";

import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-100 mt-10 py-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-6 text-sm text-gray-700">
                <div>
                    <h3 className="font-semibold mb-3">เกี่ยวกับเรา</h3>
                    <p className="mb-1 cursor-pointer">คำถามที่พบบ่อย</p>
                    <p className="mb-1 cursor-pointer">ติดต่อทีมงานหลังการสั่งซื้อ</p>
                    <p className="mb-1 cursor-pointer">เงื่อนไข</p>
                    <p className="cursor-pointer">นโยบายความเป็นส่วนตัว</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-3">ติดต่อ</h3>
                    <p className="mb-1 cursor-pointer">ติดต่อเรา</p>
                    <p className="mb-1 cursor-pointer">แผนผังเว็บไซต์</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-3">บัญชีของฉัน</h3>
                    <p className="mb-1 cursor-pointer">เข้าสู่ระบบ</p>
                    <p className="cursor-pointer">ลงทะเบียน</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-3">ตามเรา</h3>
                    <div className="flex space-x-4 text-gray-700">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                            <Facebook size={24} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
                            <Instagram size={24} />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                            <MessageCircle size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
