import { useEffect, useRef } from 'react';

const useAbortableEffect = (effect, dependencies) => {
    

    useEffect(() => {
        const abortControllerRef = new AbortController();
        const sideEffect = effect(abortControllerRef.signal);

        return () => {
            sideEffect()
            abortControllerRef.abort();
        };
    }, dependencies);
};

export default useAbortableEffect;