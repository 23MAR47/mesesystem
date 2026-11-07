import Image from "next/image";

import type { Avatar } from "@/data/mocks/home";

import { popIn, SOFT_SNAPPY } from "./hero-motion";
import { Reveal } from "./reveal";

interface AvatarStackProps {
  avatars: Avatar[];
  delayIn?: number;
}

/** Overlapping founder avatars — each pops in with a soft stagger. */
export const AvatarStack = ({ avatars, delayIn = 0 }: AvatarStackProps) => {
  return (
    <ul className="flex items-center">
      {avatars.map((avatar, index) => (
        <Reveal
          key={avatar.src}
          tag="li"
          mode="once"
          from={popIn.from}
          to={popIn.to}
          config={SOFT_SNAPPY}
          delayIn={delayIn + index * 90}
          className={index < avatars.length - 1 ? "-mr-[0.75rem]" : ""}
        >
          <Image
            src={avatar.src}
            alt={avatar.alt}
            width={35}
            height={35}
            className="size-[2.1875rem] rounded-full object-cover"
          />
        </Reveal>
      ))}
    </ul>
  );
};
