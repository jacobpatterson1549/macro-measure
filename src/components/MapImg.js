import { useState, useEffect, useRef } from 'react';

import './MapImg.css';

export const MapImg = (props) => {
    const divRef = useRef(null);
    const [svgWidth, setSVGWidth] = useState(0);
    const [svgHeight, setSVGHeight] = useState(0);
    const [pixelTop, setPixelTop] = useState(0);
    const [pixelRight, setPixelRight] = useState(0);
    const [pixelBottom, setPixelBottom] = useState(0);
    const [pixelLeft, setPixelLeft] = useState(0);
    useEffect(() => {
        if (divRef.current) {
            const parentWidth = divRef.current.parentElement.offsetWidth;
            const containerHeight = divRef.current.offsetHeight;
            const containerRatio = parentWidth  / containerHeight;
            const imgRatio = props.fileWidth / props.fileHeight;
            const widthRatio = parentWidth / props.fileWidth;
            const heightRatio = containerHeight / props.fileHeight;
            const [width, height] = (containerRatio > imgRatio)
                ? [Math.trunc(props.fileWidth * heightRatio), containerHeight]
                : [parentWidth, Math.trunc(props.fileHeight * widthRatio)];
            const svgRatio = height / props.fileHeight;
            setSVGWidth(width);
            setSVGHeight(height);
            setPixelTop(Math.trunc(props.pixelTop * svgRatio));
            setPixelRight(Math.trunc(props.pixelRight * svgRatio));
            setPixelBottom(Math.trunc(props.pixelBottom * svgRatio));
            setPixelLeft(Math.trunc(props.pixelLeft * svgRatio));
        }
    }, [divRef,
        props.fileWidth, props.fileHeight,
        props.pixelTop, props.pixelRight, props.pixelLeft, props.pixelBottom,
        setSVGWidth, setSVGHeight, setPixelTop, setPixelRight, setPixelLeft, setPixelBottom]);
    const state = {
        divRef,
        svgWidth,
        svgHeight,
        pixelTop,
        pixelRight,
        pixelBottom,
        pixelLeft,
    };
    return render({ url: props.fileURL, ...state });
};

const render = (props) => (
    props.url
        ? renderFile(props)
        : (<span>Choose file so it can be displayed here.</span>)
);

const renderFile = (props) => {
    const lineColor = "red";
    return (
        <div
            className="MapImg"
            ref={props.divRef}
        >
            <svg
                role="img"
                width={props.svgWidth}
                height={props.svgHeight}
                xmlns="http://www.w3.org/2000/svg"
            >
                <image
                    href={props.url}
                    width={props.svgWidth}
                    height={props.svgHeight}
                />
                <line
                    x1={0}
                    y1={props.pixelTop}
                    x2={props.svgWidth}
                    y2={props.pixelTop}
                    stroke={lineColor}
                />
                <line
                    x1={props.svgWidth - props.pixelRight}
                    y1={0}
                    x2={props.svgWidth - props.pixelRight}
                    y2={props.svgHeight}
                    stroke={lineColor}
                />
                <line
                    x1={0}
                    y1={props.svgHeight - props.pixelBottom}
                    x2={props.svgWidth}
                    y2={props.svgHeight - props.pixelBottom}
                    stroke={lineColor}
                />
                <line
                    x1={props.pixelLeft}
                    y1={0}
                    x2={props.pixelLeft}
                    y2={props.svgHeight}
                    stroke={lineColor}
                />
            </svg>
        </div>
    );
};