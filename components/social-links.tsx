"use client";

import {
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  TiktokLogo,
} from "@phosphor-icons/react";
import site from "@/data/site.json";

const SOCIALS = [
  { label: "Facebook", href: site.social.facebook, Icon: FacebookLogo },
  { label: "Instagram", href: site.social.instagram, Icon: InstagramLogo },
  { label: "YouTube", href: site.social.youtube, Icon: YoutubeLogo },
  { label: "TikTok", href: site.social.tiktok, Icon: TiktokLogo },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-2">
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`DevUp on ${label}`}
          className="grid h-10 w-10 place-items-center border border-white/15 bg-white/5 text-paper-2 transition-colors hover:border-coral hover:text-coral"
        >
          <Icon size={18} weight="fill" aria-hidden />
        </a>
      ))}
    </div>
  );
}
