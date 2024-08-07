import {Avatar} from "antd";

type Props = {
    src: string;
    size?: number;
    alt?: string;
}

export function Thumbnail({src, size, alt}: Props) {
    const props = {src, size: size || 64, alt};
    console.log(src)
    if (!src) return <Avatar shape="square" {...props}/>
    return <Avatar shape="square" {...props}/>
}