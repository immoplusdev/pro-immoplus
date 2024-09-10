import {Avatar} from "antd";
import classNames from "classnames";

type Props = {
    src: string;
    alt?: string;
    className?: string;
}

export function LargeThumbnail({src, alt, className}: Props) {
    const cssClassNames = classNames("size-52", className)
    return <Avatar shape="square" src={src} className={cssClassNames} alt={alt}/>
}