import {getImageUrl} from "@/lib/helpers";
import React from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Autoplay, Navigation, Pagination} from "swiper/modules";
import {Image} from "antd";

type Props = {
    images: string[]
}

export function ImageCarousel({images}: Props) {

    return (
        <Swiper
            className={"w-96 h-72"}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false,
            }}
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={2}
            slidesPerView={1}
            // navigation
            pagination={{ clickable: true }}
        >
            {
                images.map((image, index) => (
                    <SwiperSlide key={index} className={"w-full h-full  flex items-center justify-center"} style={{

                    }}>
                        <img
                            src={getImageUrl(image)}
                            alt="image"

                            style={{
                                height:"50%",
                                objectFit: "contain"
                            }}
                        />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}