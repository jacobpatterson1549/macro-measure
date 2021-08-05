import { useState, useEffect, useRef } from 'react';

import './MapImg.css';

export const MapImg = (props) => {
    const divRef = useRef(null);
    const [dimensions, setDimensions] = useState(null);
    useEffect(() => {
        const container = divRef.current;
        if (container && props.file) {
            const containerWidth = container.parentElement.offsetWidth;
            const containerHeight = container.parentElement.offsetHeight;
            const containerRatio = containerWidth / containerHeight;
            const imgRatio = props.file.width / props.file.height;
            const widthRatio = containerWidth / props.file.width;
            const heightRatio = containerHeight / props.file.height;
            const [width, height] = (containerRatio > imgRatio)
                ? [Math.trunc(props.file.width * heightRatio), containerHeight]
                : [containerWidth, Math.trunc(props.file.height * widthRatio)];
            const svgRatio = height / props.file.height;
            const dimensions2 = {
                svgWidth: width,
                svgHeight: height,
                pixelTop: Math.trunc(props.pixelTop * svgRatio),
                pixelRight: Math.trunc(props.pixelRight * svgRatio),
                pixelBottom: Math.trunc(props.pixelBottom * svgRatio),
                pixelLeft: Math.trunc(props.pixelLeft * svgRatio),
            };
            setDimensions(dimensions2);
        }
    }, [divRef,
        props.file,
        props.pixelTop, props.pixelRight, props.pixelLeft, props.pixelBottom,
        setDimensions]);
    return render({ file: props.file, divRef, dimensions });
};

const render = (props) => (
    <div
        className="MapImg"
        ref={props.divRef}
    >
        {
            props.file && props.dimensions
                ? getSVG({ ...props.file, ...props.dimensions })
                : (<span>Choose image file so it can be displayed here.</span>)
        }
    </div >
);

const getSVG = (props) => (
    <svg
        role="img"
        width={props.svgWidth}
        height={props.svgHeight}
        xmlns="http://www.w3.org/2000/svg"
    >
        <image href={props.url} width={props.svgWidth} height={props.svgHeight} />
        {getSVGLine(0, props.pixelTop, props.svgWidth, props.pixelTop)}
        {getSVGLine(props.svgWidth - props.pixelRight, 0, props.svgWidth - props.pixelRight, props.svgHeight)}
        {getSVGLine(0, props.svgHeight - props.pixelBottom, props.svgWidth, props.svgHeight - props.pixelBottom)}
        {getSVGLine(props.pixelLeft, 0, props.pixelLeft, props.svgHeight)}
    </svg>

);

const getSVGLine = (x1, y1, x2, y2) => {
    const props = { x1, y1, x2, y2, stroke: 'red' }; // TODO: use css for stroke color? ".MapImg line" ?
    return (<line {...props} />);
}