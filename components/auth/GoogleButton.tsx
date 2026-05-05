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
            whileHover={loading ? undefined : { scale: 1.03 }}
            whileTap={loading ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={[
                'group relative inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b0b0f] px-4 py-3 text-sm font-medium text-white',
                'shadow-softSm transition',
                'focus:outline-none focus:ring-2 focus:ring-[#fcc4c8]/50',
                loading ? 'opacity-80' : 'hover:shadow-soft hover:bg-black',
            ].join(' ')}
        >
            <span className="absolute left-3 inline-flex items-center">
                {loading ? (
                    <IconLoader2
                        className="h-5 w-5 animate-spin text-white/90"
                        stroke={2}
                    />
                ) : (
                    <IconBrandGoogleFilled
                        className="h-5 w-5 text-white/90"
                        stroke={1.8}
                    />
                )}
            </span>

            <span className="transition group-hover:translate-x-px">
                {loading ? 'Signing you in…' : 'Continue with Google'}
            </span>
        </motion.button>
    );
}
