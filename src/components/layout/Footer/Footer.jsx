import logoFooter from "../../../assets/footer/logoFooter.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/auth";

const navItems = [
    ["Home", "/"],
    ["Forum", "/forum"],
    ["Blog", "/blog"],
    ["E-Commerce", "/e-commerce"],
];

const Footer = () => {
  const { user } = useAuth();
  const links = user ? navItems : [...navItems, ["Login", "/login"]];

  return (
        <footer className="w-full px-5 py-10 text-[#3d3d3d] sm:px-8 sm:py-12 lg:px-[97.32px] lg:pb-20 lg:pt-6">
        <div className="mx-auto px-0 sm:px-2 lg:px-10">
            <div className="flex flex-col gap-7 border-b border-[#cfcfcf] pb-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <img className="h-auto w-28 sm:w-32 lg:w-auto" src={logoFooter} alt="Balanjo logo"/>
                <p className="text-sm font-normal leading-relaxed tracking-[-0.02em] text-[#4a4a4a] sm:text-[16px]">
                © 2024 Balanjo. All rights reserved.
                </p>
            </div>

            <nav className="w-full md:w-auto" aria-label="Footer navigation">
                <ul className="flex flex-wrap items-center justify-start gap-x-5 gap-y-3 text-sm font-normal tracking-[-0.02em] text-[#4a4a4a] sm:gap-x-8 sm:text-[15px] md:justify-end">
                {links.map(([label, path]) => (
                    <li key={label} className="transition-colors hover:text-[#1b1b1b]">
                    <Link to={path}>{label}</Link>
                    </li>
                ))}
                </ul>
            </nav>
            </div>

            <div className="pt-5 sm:pt-6">
            <p className="text-base text-[#8a8a8a] opacity-60 sm:text-[17px]">
                Inovasi untuk Rangers.
            </p>
            </div>
        </div>
          </footer>
    );
};

export default Footer;