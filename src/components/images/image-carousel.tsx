import {Carousel} from "antd";
import {getImageUrl} from "@/lib/helpers";
import React from "react";
import {Image} from "antd"
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Navigation, Pagination, Scrollbar} from "swiper/modules";

type Props = {
    images: string[]
}

export function ImageCarousel({images}: Props) {



    return (
        <Swiper
            // install Swiper modules
            className={"w-full bg-orange-400"}
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={3}
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            onSwiper={(swiper: Record<string, any>) => console.log(swiper)}
            onSlideChange={() => console.log('slide change')}
        >
            {
                [images[0], images[0], images[0]].map((image, index) => (
                    <SwiperSlide key={index} className={"w-full h-full bg-red-400"}>
                        <img
                            src={getImageUrl(image)}
                            alt="image"
                            // preview={false}
                            className={"w-full"}
                        />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}