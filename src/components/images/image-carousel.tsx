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
            className={"w-full h-full"}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false,
            }}
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={2}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
        >
            {
                images.map((image, index) => (
                    <SwiperSlide key={index} className={"w-full"} style={{

                    }}>
                        <img
                            src={getImageUrl(image)}
                            alt="image"

                            style={{
                                width:"50%",
                                objectFit: "cover"

                            }}
                        />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}