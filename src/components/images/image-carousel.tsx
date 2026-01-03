import {getImageUrl} from "@/lib/helpers";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Autoplay, Navigation, Pagination} from "swiper/modules";
import {Image} from "antd";

type Props = {
    images: string[]
}

export function ImageCarousel({images}: Props) {

    return (
        <Swiper
            className={"h-48 flex items-center justify-start"}
            style={{width: "17vw"}}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false,
            }}
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={1}
            slidesPerView={1}
            // navigation
            pagination={{ clickable: true }}
        >
            {
                images.map((image, index) => (
                    <SwiperSlide key={index} className={"w-full h-full  flex items-center justify-center"} style={{

                    }}>
                        <Image
                            src={getImageUrl(image)}
                            alt="image"
                            style={{
                                height:"100%",
                                width:"100%",
                                objectFit: "cover"
                            }}
                        />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}