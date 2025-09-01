import { useState } from 'react';

export const applyCpfMask = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let maskedValue = digits;

    if (digits.length > 9) {
        maskedValue = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (digits.length > 6) {
        maskedValue = digits.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (digits.length > 3) {
        maskedValue = digits.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }

    return { masked: maskedValue, raw: digits };
};

export default function useCpfMask() {
    const [masked, setMasked] = useState('');

    const handleChange = (e) => {
        const { masked: newMasked, raw } = applyCpfMask(e.target.value);
        setMasked(newMasked);
        return raw;
    };

    return { masked, handleChange, setMasked };
}