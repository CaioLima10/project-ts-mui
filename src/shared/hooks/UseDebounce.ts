import { useCallback, useRef } from "react";

export function useDebounce(delay = 300 , notDelayInFirstTime = true){
    const debouncing = useRef<number>()
    const isFirstTime = useRef<boolean>(notDelayInFirstTime)

    const debounce = useCallback((func: () => void) => {
        if(isFirstTime.current){
            isFirstTime.current = false
            func()
        }else{
            if(debouncing.current){
                clearTimeout(debouncing.current)
            }
            debouncing.current = setTimeout(() => {
                func()
            }, delay)
        }
    },[delay])
    return { debounce }
}