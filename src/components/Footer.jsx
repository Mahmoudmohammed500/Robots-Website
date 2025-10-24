import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Globe2, Printer } from "lucide-react";
import LogoImg from "../assets/logo omega-2022.png";

export default function Footer() {
  return (
    <footer className="relative bg-main-color text-white py-12 px-6 overflow-hidden">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-start text-center md:text-left">
        {/* Logo + About */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-5 cursor-pointer select-none">
            <img
              src={LogoImg}
              alt="Omega Engineering Industries Logo"
              className="h-12 w-auto object-contain drop-shadow-lg"
            />
          </div>

          <p className="text-sm leading-relaxed text-gray-100/90 max-w-sm">
            OMEGA Engineering Industries (OEI) is an innovation of industrial and
            solar engineering solutions established in Jordan in 2006. We deliver
            excellence through superior technology and engineering solutions,
            providing clients across the MENA region with unmatched quality and reliability.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-5">Contact Us</h3>
          <ul className="space-y-4 text-sm text-gray-100/90">
            {/* Phone */}
            <li className="flex items-start gap-3">
              <div className="pt-1">
                <Phone size={18} className="text-second-color" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-second-color">Mobile:</span>
                <span>+962 777970321</span>
                <span>+962 798878411</span>
              </div>
            </li>

            {/* Fax */}
            <li className="flex items-start gap-3">
              <div className="pt-1">
                <Printer size={18} className="text-second-color" />
              </div>
              <div className="text-left">
                <span className="font-medium text-second-color">Fax:</span>
                <p>+962 6 4162060</p>
              </div>
            </li>

            {/* Address */}
            <li className="flex items-start gap-3">
              <div className="pt-1">
                <MapPin size={18} className="text-second-color" />
              </div>
              <div className="text-left">
                <span className="font-medium text-second-color">Address:</span>
                <p>
                  Omega Engineering Industries Co, Jowied Bni Sakher St 1, Amman<br />
                  P.O Box 111 Amman 11621 Jordan
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Socials + Copyright */}
        <div className="flex flex-col items-center md:items-start justify-between text-sm text-gray-100/80">
          {/* Website + Email + WhatsApp */}
          <div className="flex justify-center md:justify-start gap-4 mb-5">
            {/* Website */}
            <motion.a
              href="https://www.omega-jordan.com/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              className="p-2 rounded-full bg-white/10 hover:bg-second-color transition"
            >
              <Globe2 size={18} />
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:omega.jo@gmail.com"
              whileHover={{ scale: 1.15 }}
              className="p-2 rounded-full bg-white/10 hover:bg-second-color transition"
            >
              <Mail size={18} />
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="https://api.whatsapp.com/send?phone=962790603862"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              className="p-2 rounded-full bg-white/10 hover:bg-second-color transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="text-white"
                viewBox="0 0 16 16"
              >
                <path d="M13.601 2.326a7.875 7.875 0 0 0-11.045 0 7.875 7.875 0 0 0-2.311 5.572c0 1.394.386 2.767 1.119 3.963l-1.15 4.196 4.29-1.133a7.87 7.87 0 0 0 3.964 1.12h.003a7.875 7.875 0 0 0 5.572-2.311 7.875 7.875 0 0 0 0-11.045zM8 14.875a6.88 6.88 0 0 1-3.543-.986l-.25-.147-2.54.669.678-2.485-.164-.263A6.876 6.876 0 1 1 8 14.875z"/>
                <path d="M11.154 10.846c-.155-.078-.917-.453-1.06-.506-.143-.052-.247-.078-.351.078-.104.155-.403.505-.494.607-.09.104-.18.116-.335.039-.155-.078-.65-.24-1.238-.76-.458-.409-.767-.915-.855-1.07-.088-.156-.009-.24.068-.317.07-.069.155-.18.232-.27.077-.09.103-.156.155-.26.052-.104.026-.195-.013-.273-.039-.078-.351-.844-.48-1.155-.127-.31-.257-.27-.351-.274-.09-.005-.195-.006-.3-.006s-.273.039-.416.195c-.143.156-.546.533-.546 1.3 0 .766.56 1.506.638 1.61.077.104 1.105 1.69 2.678 2.373 1.572.683 1.572.455 1.855.426.282-.03.916-.374 1.046-.734.13-.36.13-.668.091-.734-.039-.065-.143-.104-.3-.182z"/>
              </svg>
            </motion.a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="mb-1 font-semibold">
              © Copyright Omega Engineering Industries
            </p>
            <p>{new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
