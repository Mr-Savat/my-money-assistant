import { useState, useEffect, useRef } from "react";

export const useAnimatedNumber = (value, duration = 600) => {
    const [display, setDisplay] = useState(value);
    const prevValue = useRef(value);
    const frameRef = useRef(null);

    useEffect(() => {
        const from = prevValue.current;
        const to = value;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(from + (to - from) * eased);
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                prevValue.current = to;
            }
        };

        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    return display;
};