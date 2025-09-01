import { useState } from 'react';

export const applyPhoneMask = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);

    if (digits.length > 10) {
        // Celular: (99) 99999-9999
        return {
            masked: digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim(),
            raw: digits,
        };
    } else {
        // Fixo: (99) 9999-9999
        return {
            masked: digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim(),
            raw: digits,
        };
    }
};

export default function usePhoneMask() {
    const [masked, setMasked] = useState('');

    const handleChange = (e) => {
        const { masked: newMasked, raw } = applyPhoneMask(e.target.value);
        setMasked(newMasked);
        return raw;
    };

    return { masked, handleChange, setMasked };
}