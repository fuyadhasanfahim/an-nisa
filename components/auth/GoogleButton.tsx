'use client';

import { motion } from 'framer-motion';
import { IconBrandGoogleFilled, IconLoader2 } from '@tabler/icons-react';

type GoogleButtonProps = {
    loading?: boolean;
    onClick?: () => void;
};

export function GoogleButton({ loading = false, onClick }: GoogleButtonProps) {
    return (
        <motion.button
            type="button"
            onClick={loading ? undefined : onClick}
            disabled={loading}
            whileHover={loading ? undefined : { scale: 1.01 }}
            whileTap={loading ? undefined : { scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={[
                'group relative inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#fcc4c8]/60 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand-black cursor-pointer shadow-sm transition-all duration-300',
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#fcc4c8]/10 hover:border-[#fcc4c8] hover:shadow-md',
            ].join(' ')}
        >
            <span className="absolute left-4 inline-flex items-center">
                {loading ? (
                    <IconLoader2
                        className="h-4 w-4 animate-spin text-[#fcc4c8]"
                        stroke={2.2}
                    />
                ) : (
                    <IconBrandGoogleFilled
                        className="h-4 w-4 text-brand-black/75 group-hover:text-brand-black transition duration-300"
                        stroke={1.8}
                    />
                )}
            </span>

            <span className="transition duration-300">
                {loading ? 'Signing you in…' : 'Continue with Google'}
            </span>
        </motion.button>
    );
}
