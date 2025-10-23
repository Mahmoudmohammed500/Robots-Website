import { motion } from "framer-motion";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
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
              alt="Omega Robotics Logo"
              className="h-12 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <p className="text-sm leading-relaxed text-gray-100/90 max-w-sm">
            We design and develop intelligent robots for solar panel cleaning.
            Our mission is to enhance solar efficiency through automation and
            sustainability — ensuring a cleaner, greener future.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm text-gray-100/90">
            <li>
              <span className="font-medium text-second-color">Email:</span>{" "}
              <a
                href="mailto:support@omegarobotics.com"
                className="hover:underline"
              >
                support@omegarobotics.com
              </a>
            </li>
            <li>
              <span className="font-medium text-second-color">Phone:</span>{" "}
              <a href="tel:+201000000000" className="hover:underline">
                +20 100 000 0000
              </a>
            </li>
            <li>
              <span className="font-medium text-second-color">Address:</span>{" "}
              Cairo, Egypt
            </li>
          </ul>

          {/* Socials */}
          <div className="flex justify-center md:justify-start gap-4 mt-5">
            {[ 
              { Icon: Facebook, href: "#" },
              { Icon: Twitter, href: "#" },
              { Icon: Linkedin, href: "#" },
              { Icon: Mail, href: "mailto:support@omegarobotics.com" },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                whileHover={{ scale: 1.15 }}
                className="p-2 rounded-full bg-white/10 hover:bg-second-color transition"
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        
        <div className="text-sm text-gray-100/80 md:self-center">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
