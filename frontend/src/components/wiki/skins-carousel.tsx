import type { JSX } from "react";
import type { Champion } from "../../types/champions";
import {
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  EffectFade,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { AiFillSkin } from "react-icons/ai";
interface SkinsCarouselProps {
  skins: Champion["skins"];
}
export function SkinsCarousel({ skins }: SkinsCarouselProps): JSX.Element {
  return (
    <div className="details-wrapper">
      <h2 className="details-title w-full flex justify-center">
        <>
          <AiFillSkin />
          Skins
        </>
      </h2>
      <div className="relative w-full aspect-video max-h-[70vh] rounded-md">
        <Swiper
          className="size-full rounded-md"
          modules={[Navigation, Pagination, Autoplay, Keyboard, EffectFade]}
          slidesPerView={1}
          spaceBetween={0}
          loop
          pagination={{
            clickable: true,
          }}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          keyboard={{
            enabled: true,
          }}
          effect="fade"
        >
          {skins.map((skin) => (
            <SwiperSlide key={skin.name} className="relative">
              <img
                src={skin.imageUrl}
                alt={skin.name}
                className="size-full object-contain object-center rounded-md"
                loading="eager"
              />
              <div className="absolute bottom-0 py-8 w-full text-center font-bold text-base md:text-xl text-lol-gold text-shadow-md text-shadow-lol-bg">
                {skin.name}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
